import { connection } from "../config/db.js";
import * as detallePedidoModel from "../models/detalle_pedido.model.js";
import * as pedidoModel from "../models/pedido.model.js";
import * as productoModel from "../models/producto.model.js";
import * as mesaModel from "../models/mesa.model.js";
import AppError from "../utils/AppError.js";

//obterner detalle pedido
export const obtenerDetallePedido = async (idUsuario) => {
  return await detallePedidoModel.obtenerDetallePedido(idUsuario);
};

//obtener por id
export const mostrarDetallePedidoId = async (id) => {
  const detalle = await detallePedidoModel.obtenerDetallePedidoId(id);

  if (!detalle) {
    throw new AppError("El detalle no existe.", 404);
  }

  return detalle;
};

//obtener por pedido
export const obtenerDetallePedidoPorPedido = async (
  idPedido,
  idUsuario,
  rol,
) => {
  const pedido = await pedidoModel.obtenerPedidoId(idPedido);

  if (!pedido) {
    throw new AppError("El pedido no existe.", 404);
  }

  if (rol !== "admin" && pedido.idUsuarios !== idUsuario) {
    throw new AppError("No tienes permiso para consultar este detalle.", 403);
  }

  const detalles =
    await detallePedidoModel.obtenerDetallePedidoPorPedido(idPedido);

  if (!detalles) {
    throw new AppError("El detalle del pedido no existe.", 404);
  }

  return detalles;
};

//crear detalle pedido
export const crearDetallePedido = async (detallePedido, idUsuario) => {
  const conn = await connection.getConnection();

  try {
    await conn.beginTransaction();

    //validar pedido en mesa
    let pedidoExiste = await pedidoModel.obtenerPedidoActivoMesa(
      detallePedido.idMesas,
      conn,
    );

    //si existe, que sea del mesero
    if (pedidoExiste) {
      if (pedidoExiste.idUsuarios !== idUsuario) {
        throw new AppError(
          "No tienes permiso para modificar este pedido.",
          403,
        );
      }

      //validar que pedido este activo
      if (pedidoExiste.estado !== "Activo") {
        throw new AppError(
          "Solo se puede agregar productos a pedidos activos.",
          400,
        );
      }
    }

    //si no existe crear el pedido
    if (!pedidoExiste) {
      pedidoExiste = await pedidoModel.crearPedido(conn, {
        idMesas: detallePedido.idMesas,
        idUsuarios: idUsuario,
        estado: "Activo",
        total: 0,
      });

      //la mesa pasa a ocuapda
      await mesaModel.ocuparMesa(conn, detallePedido.idMesas);
    }

    //validar producto
    const productoExiste = await productoModel.obtenerProductoId(
      detallePedido.idProductos,
      conn,
    );

    if (!productoExiste) {
      throw new AppError("El producto no existe.", 404);
    }

    //validar estado del producto
    if (productoExiste.estado !== "Disponible") {
      throw new AppError("El producto no esta disponible.", 400);
    }

    //validar cantidad
    const cantidad = Number(detallePedido.cantidad);

    //validar cantidad
    if (!Number.isInteger(cantidad) || cantidad <= 0) {
      throw new AppError("La cantidad debe ser mayor que cero.", 400);
    }

    //validar stock producto
    if (productoExiste.stock < cantidad) {
      throw new AppError("Stock insuficiente.", 400);
    }

    //validar observaciones
    if (
      detallePedido.observaciones !== null &&
      detallePedido.observaciones !== undefined &&
      typeof detallePedido.observaciones !== "string"
    ) {
      throw new AppError("Las observaciones deben ser texto.", 400);
    }

    if (detallePedido.observaciones?.length > 255) {
      throw new AppError(
        "Las observaciones no pueden superar los 255 caracteres.",
        400,
      );
    }

    //validar si existe el producto en el pedido
    const detalleExiste = await detallePedidoModel.existeProductoEnPedido(
      conn,
      pedidoExiste.idPedidos,
      detallePedido.idProductos,
    );

    let detalleGuardado;

    //actualizar o crear detalle
    if (detalleExiste) {
      const nuevaCantidad = detalleExiste.cantidad + cantidad;

      const nuevoSubtotal = nuevaCantidad * productoExiste.precio;

      detalleGuardado = await detallePedidoModel.actualizarDetallePedido(
        conn,
        detalleExiste.idDetalle_pedido,
        nuevaCantidad,
        nuevoSubtotal,
        detallePedido.observaciones,
      );
    } else {
      const subtotal = cantidad * Number(productoExiste.precio);

      detalleGuardado = await detallePedidoModel.crearDetallePedido(conn, {
        idPedidos: pedidoExiste.idPedidos,
        idProductos: detallePedido.idProductos,
        cantidad: cantidad,
        precioUnitario: productoExiste.precio,
        subtotal,
        observaciones: detallePedido.observaciones || null,
      });
    }

    //restar stock
    await productoModel.restarStock(conn, detallePedido.idProductos, cantidad);

    //producto actualizado
    const productoActualizado = await productoModel.obtenerProductoId(
      detallePedido.idProductos,
      conn,
    );

    //atualizar el estado si stock es 0
    if (productoActualizado.stock <= 0) {
      await productoModel.cambiarEstadoProducto(
        detallePedido.idProductos,
        "Agotado",
        conn,
      );
    } else {
      await productoModel.cambiarEstadoProducto(
        detallePedido.idProductos,
        "Disponible",
        conn,
      );
    }

    //calcular el total
    const total = await detallePedidoModel.calcularTotalPedido(
      conn,
      pedidoExiste.idPedidos,
    );

    //actualizar el total del pedido
    await detallePedidoModel.actualizarTotalPedido(
      conn,
      pedidoExiste.idPedidos,
      total,
    );

    //confirmar transacción

    await conn.commit();

    return { ...detalleGuardado, idPedidos: pedidoExiste.idPedidos };
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
};

//actualizar detalle pedido
export const actualizarDetallePedido = async (id, detallePedido, idUsuario) => {
  const conn = await connection.getConnection();

  try {
    await conn.beginTransaction();

    const detalleExiste = await detallePedidoModel.obtenerDetallePedidoId(
      id,
      conn,
    );

    if (!detalleExiste) {
      throw new AppError("El detalle del pedido no existe.", 404);
    }

    //validar pedido activo
    const pedido = await pedidoModel.obtenerPedidoId(
      detalleExiste.idPedidos,
      conn,
    );

    if (!pedido) {
      throw new AppError("El pedido no existe.", 404);
    }

    //validar
    if (pedido.idUsuarios !== idUsuario) {
      throw new AppError("No tienes permiso para modificar este pedido.", 403);
    }
    if (pedido.estado !== "Activo") {
      throw new AppError("Solo se pueden modificar pedidos activos.", 400);
    }

    //validar producto
    const producto = await productoModel.obtenerProductoId(
      detalleExiste.idProductos,
      conn,
    );

    if (!producto) {
      throw new AppError("El producto no existe.", 404);
    }

    if (producto.estado === "Inactivo") {
      throw new AppError("El producto está inactivo.", 400);
    }

    //validar la nueva cantidad
    const nuevaCantidad = Number(detallePedido.cantidad);

    if (!Number.isInteger(nuevaCantidad) || nuevaCantidad <= 0) {
      throw new AppError(
        "La cantidad debe ser un número entero mayor que cero.",
        400,
      );
    }

    //validar observaciones
    if (
      detallePedido.observaciones !== null &&
      detallePedido.observaciones !== undefined &&
      typeof detallePedido.observaciones !== "string"
    ) {
      throw new AppError("Las observaciones deben ser texto.", 400);
    }

    if (detallePedido.observaciones?.length > 255) {
      throw new AppError(
        "Las observaciones no pueden superar los 255 caracteres.",
        400,
      );
    }

    //validar la direncia
    const diferencia = nuevaCantidad - detalleExiste.cantidad;

    //validar stock
    if (diferencia > 0) {
      if (producto.stock < diferencia) {
        throw new AppError("Stock insuficiente.", 400);
      }

      await productoModel.restarStock(conn, producto.idProductos, diferencia);
    }

    //si disminuye la cantidad
    if (diferencia < 0) {
      await productoModel.sumarStock(
        conn,
        producto.idProductos,
        Math.abs(diferencia),
      );
    }

    //calcular total
    const subtotal = nuevaCantidad * producto.precio;

    //si no envian observaciones, conserva la existente
    const observaciones =
      "observaciones" in detallePedido
        ? detallePedido.observaciones
        : detalleExiste.observaciones;

    //actualizar detalle
    const detalleActualizado = await detallePedidoModel.actualizarDetallePedido(
      conn,
      id,
      nuevaCantidad,
      subtotal,
      observaciones,
    );

    //obtener producto actualizado
    const productoActualizado = await productoModel.obtenerProductoId(
      producto.idProductos,
      conn,
    );

    //cambiar estado del producto
    if (productoActualizado.stock <= 0) {
      await productoModel.cambiarEstadoProducto(
        producto.idProductos,
        "Agotado",
        conn,
      );
    } else {
      await productoModel.cambiarEstadoProducto(
        producto.idProductos,
        "Disponible",
        conn,
      );
    }

    //calcular total del pedido
    const total = await detallePedidoModel.calcularTotalPedido(
      conn,
      detalleExiste.idPedidos,
    );

    //Actualizar total del pedido
    await detallePedidoModel.actualizarTotalPedido(
      conn,
      detalleExiste.idPedidos,
      total,
    );

    await conn.commit();

    return detalleActualizado;
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
};

//eliminar detalle pedido
export const eliminarDetallePedido = async (id, idUsuario, rol) => {
  const conn = await connection.getConnection();

  try {
    await conn.beginTransaction();

    //validad si detalle existe
    const detalleExiste = await detallePedidoModel.obtenerDetallePedidoId(
      id,
      conn,
    );

    if (!detalleExiste) {
      throw new AppError("El detalle del pedido no existe.", 404);
    }

    //validar pedido
    const pedido = await pedidoModel.obtenerPedidoId(
      detalleExiste.idPedidos,
      conn,
    );

    if (!pedido) {
      throw new AppError("El pedido no existe.", 404);
    }

    if (rol !== "admin" && pedido.idUsuarios !== idUsuario) {
      throw new AppError("No tienes permiso para eliminar este producto.", 403);
    }

    if (pedido.estado !== "Activo") {
      throw new AppError("Solo se pueden modificar pedidos activos.", 400);
    }

    //validar producto
    const producto = await productoModel.obtenerProductoId(
      detalleExiste.idProductos,
      conn,
    );

    if (!producto) {
      throw new AppError("El producto no existe.", 404);
    }

    //volver stock

    await productoModel.sumarStock(
      conn,
      producto.idProductos,
      detalleExiste.cantidad,
    );

    //obtener el producto
    const productoActualizado = await productoModel.obtenerProductoId(
      producto.idProductos,
      conn,
    );

    //cambiar el estado
    if (
      productoActualizado.stock > 0 &&
      productoActualizado.estado === "Agotado"
    ) {
      await productoModel.cambiarEstadoProducto(
        producto.idProductos,
        "Disponible",
        conn,
      );
    }

    //eliminar el detalle
    await detallePedidoModel.eliminarDetallePedido(conn, id);

    //calcular el nuevo total
    const total = await detallePedidoModel.calcularTotalPedido(
      conn,
      detalleExiste.idPedidos,
    );

    //actualizar el pedido
    await detallePedidoModel.actualizarTotalPedido(
      conn,
      detalleExiste.idPedidos,
      total,
    );

    await conn.commit();

    return true;
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
};
