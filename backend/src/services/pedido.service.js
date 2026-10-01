import * as pedidoModel from "../models/pedido.model.js";
import * as mesaModel from "../models/mesa.model.js";
import * as DetallePedidoModel from "../models/detalle_pedido.model.js";
import * as productoModel from "../models/producto.model.js";

import AppError from "../utils/AppError.js";
import { obtenerUsuarioId } from "../models/usuario.model.js";
import { connection } from "../config/db.js";

//obntener pedido
export const obtenerPedidos = async (page, limit, estado, mesero, mesa) => {
  const { pedidos, total } = await pedidoModel.obtenerPedidos(
    page,
    limit,
    estado,
    mesero,
    mesa,
  );

  return {
    pedidos,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

//obtener por id
export const obtenerPedidoId = async (id, idUsuario, rol) => {
  const pedido = await pedidoModel.obtenerPedidoId(id);

  if (!pedido) {
    throw new AppError("Pedido no encontrado.", 404);
  }

  if (rol !== "admin" && pedido.idUsuarios !== idUsuario) {
    throw new AppError("No tienes permiso para consultar este pedido.", 403);
  }
  return pedido;
};

//obtener pedido activo mesa
export const obtenerPedidoActivoMesa = async (idMesa, idUsuario, rol) => {
  const pedido = await pedidoModel.obtenerPedidoActivoMesa(idMesa);

  if (!pedido) {
    return null;
  }

  //admin puede acceder a cualquier pedido
  if (rol !== "admin" && pedido.idUsuarios !== idUsuario) {
    throw new AppError(
      "Esta mesa tiene un pedido creado por otro mesero.",
      403,
    );
  }

  return pedido;
};

//obtener pedidos activos
export const obtenerPedidosActivos = async (idUsuario) => {
  return await pedidoModel.obtenerPedidosActivos(idUsuario);
};

//crear pedido
export const crearPedido = async (idMesa, idUsuario) => {
  const conn = await connection.getConnection();

  try {
    await conn.beginTransaction();

    //validar que la mesa exitas
    const mesaExiste = await mesaModel.obtenerMesaIdForUpdate(idMesa, conn);

    if (!mesaExiste) {
      throw new AppError("La mesa no existe.", 404);
    }
    //=====================

    //validar que exista el mesero
    const meseroExiste = await obtenerUsuarioId(idUsuario, conn);

    if (!meseroExiste) {
      throw new AppError("El mesero no existe.", 404);
    }
    //============================

    //validar que la mesa no este inactiva
    if (mesaExiste.estado === "Inactiva") {
      throw new AppError("La mesa está Inactiva.", 400);
    }

    //validar que la mesa no tenga pedido activo
    const pedidoActivo = await pedidoModel.obtenerPedidoActivoMesa(
      idMesa,
      conn,
    );

    if (pedidoActivo) {
      throw new AppError("La mesa ya tiene un pedido activo.", 400);
    }
    //=========================

    const nuevoPedido = {
      idMesas: idMesa,
      idUsuarios: idUsuario,
      estado: "Activo",
      total: 0,
    };

    //crear pedido
    const pedidoCreado = await pedidoModel.crearPedido(conn, nuevoPedido);

    //Cambiar estado de mesa a ocupada
    await mesaModel.ocuparMesa(conn, idMesa);

    //confirmar transacion
    await conn.commit();

    return pedidoCreado;
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
};

//cambiar estado de pedido
export const cambiarEstadoPedido = async (id, estado, idUsuario, rol) => {
  const conn = await connection.getConnection();

  try {
    await conn.beginTransaction();

    //validar pedido
    const pedido = await pedidoModel.obtenerPedidoId(id, conn);

    if (!pedido) {
      throw new AppError("El pedido no existe.", 404);
    }

    //validar propietario
    if (rol !== "admin" && pedido.idUsuarios !== idUsuario) {
      throw new AppError("No tienes permiso para cambiar este pedido.", 403);
    }

    //validar estado actual
    if (estado === pedido.estado) {
      throw new AppError("El pedido ya se encuentra en ese estado.", 400);
    }

    //validar estados
    const estadosValidos = ["Activo", "Finalizado", "Cancelado"];

    if (!estadosValidos.includes(estado)) {
      throw new AppError("Estado inválido.", 400);
    }

    //finalizar el pedido
    if (estado === "Finalizado") {
      const detalles =
        await DetallePedidoModel.obtenerDetallesPedidoTransaccion(conn, id);

      if (detalles.length === 0) {
        throw new AppError(
          "No se puede finalizar un pedido sin productos.",
          400,
        );
      }
    }

    //se se cancela pedido, devolver stock
    if (estado === "Cancelado") {
      const detalles =
        await DetallePedidoModel.obtenerDetallesPedidoTransaccion(conn, id);

      for (const detalle of detalles) {
        //devolver stock
        await productoModel.sumarStock(
          conn,
          detalle.idProductos,
          detalle.cantidad,
        );

        //obtener producto actualizado
        const producto = await productoModel.obtenerProductoId(
          detalle.idProductos,
          conn,
        );

        //cambiar estado si devulve a tener stock
        if (producto.stock > 0) {
          await productoModel.cambiarEstadoProducto(
            detalle.idProductos,
            "Disponible",
            conn,
          );
        }
      }
    }
    //cambiar estado del pedido
    const pedidoActualizado = await pedidoModel.cambiarEstadoPedido(
      conn,
      estado,
      id,
    );

    //liberar mesa cuando  termina o cancela
    if (estado === "Finalizado" || estado === "Cancelado") {
      await mesaModel.cambiarEstadoMesa(pedido.idMesas, "Disponible", conn);
    }

    //confirmar commit
    await conn.commit();

    return pedidoActualizado;
  } catch (error) {
    await conn.rollback();

    throw error;
  } finally {
    conn.release();
  }
};
