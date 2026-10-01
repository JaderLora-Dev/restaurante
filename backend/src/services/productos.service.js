import * as productoModel from "../models/producto.model.js";
import * as categoriaModel from "../models/categorias.model.js";
import AppError from "../utils/AppError.js";
import { connection } from "../config/db.js";
import { eliminarImagen, subirImagen } from "./imagen.service.js";

//obtener productos
export const obtenerProductos = async (
  buscar,
  page,
  limit,
  categoria,
  estado,
  orden,
) => {
  const { productos, total } = await productoModel.obtenerProductos(
    buscar,
    page,
    limit,
    categoria,
    estado,
    orden,
  );

  return {
    productos,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

//Obtener productos disponible
export const mostrarProductosDisponible = async (
  buscar,
  page,
  limit,
  categoria,
) => {
  const { productos, total } = await productoModel.obtenerProductosDisponible(
    buscar,
    page,
    limit,
    categoria,
  );

  return {
    productos,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

//obtener por id
export const obtenerProductoId = async (id) => {
  const producto = await productoModel.obtenerProductoId(id);
  if (!producto) {
    throw new AppError("Producto no encontrado", 404);
  }

  return producto;
};

//crear producto
export const crearProducto = async (nuevoProducto, archivo) => {
  const conn = await connection.getConnection();
  let imagenPublicId = null;

  try {
    await conn.beginTransaction();

    const nombreProducto = await productoModel.obtenerPorNombre(
      nuevoProducto.nombre,
      conn,
    );

    if (nombreProducto) {
      throw new AppError("El nombre ya existe", 400);
    }

    //validar precio
    const precio = Number(nuevoProducto.precio);

    if (!Number.isFinite(precio)) {
      throw new AppError("El precio debe ser un número válido.", 400);
    }

    if (precio <= 0) {
      throw new AppError("El precio debe ser mayor que 0", 400);
    }

    if (precio > 1000000) {
      throw new AppError("El precio es demasiado alto.", 400);
    }
    //===========================================

    //validar stock
    if (nuevoProducto.stock === 0) {
      nuevoProducto.estado = "Inactivo";
    }

    //validar estado
    const estadosValidos = ["Disponible", "Agotado", "Inactivo"];

    if (!estadosValidos.includes(nuevoProducto.estado)) {
      throw new AppError(
        "El estado debe ser Disponible, Inactivo, o Agotado",
        400,
      );
    }
    //=========================================

    //validar detalle
    if (nuevoProducto.detalle.length > 500) {
      throw new AppError("EL detalle no debe superar los 500 caracteres.", 400);
    }
    //=========================================

    //validar categoria
    const categoria = await categoriaModel.obtenerCategoriaId(
      nuevoProducto.categorias_id,
      conn,
    );

    if (!categoria) {
      throw new AppError("La categoría no existe", 404);
    }
    //==========================================

    if (!archivo) {
      throw new AppError("Debes subir una imagen del producto.", 400);
    }

    //validar imagen
    if (archivo) {
      const resultado = await subirImagen(archivo.buffer);

      imagenPublicId = resultado.public_id;

      nuevoProducto.imagen_url = resultado.secure_url;
      nuevoProducto.imagen_public_id = resultado.public_id;
    }

    //crear el producto
    const producto = await productoModel.crearProducto(nuevoProducto, conn);

    //confirmar
    await conn.commit();

    return producto;
  } catch (error) {
    await conn.rollback();

    //borrar la imagen por si llama
    if (imagenPublicId) {
      try {
        await eliminarImagen(imagenPublicId);
      } catch (errorEliminar) {
        console.error(
          "No se pudo eliminar la  imagen de cloudinary:",
          errorEliminar,
        );
      }
    }

    throw error;
  } finally {
    conn.release();
  }
};
//===================================================================

//editar producto
export const editarProducto = async (id, nuevoProducto, archivo) => {
  const conn = await connection.getConnection();

  let imagenNuevaPublicId = null;
  let imagenAnteriorPublicId = null;

  try {
    await conn.beginTransaction();

    //validar si existe el producto
    const productoExiste = await productoModel.obtenerProductoId(id, conn);

    if (!productoExiste) {
      throw new AppError("Producto no encontrado", 404);
    }

    //guardar la iamgen vieja
    imagenAnteriorPublicId = productoExiste.imagen_public_id;

    //validar nombre duplicado
    const nombreProducto = await productoModel.obtenerPorNombre(
      nuevoProducto.nombre,
      conn,
    );

    if (nombreProducto && nombreProducto.idProductos !== id) {
      throw new AppError("El nombre ya existe", 400);
    }

    //validar precio
    const precio = Number(nuevoProducto.precio);

    if (!Number.isFinite(precio)) {
      throw new AppError("El precio debe ser un número válido.", 400);
    }

    if (precio <= 0) {
      throw new AppError("El precio debe ser mayor que 0", 400);
    }

    if (precio > 1000000) {
      throw new AppError("El precio es demasiado alto.", 400);
    }
    //==============================

    if (nuevoProducto.stock < 0) {
      throw new AppError("El stock no puede ser negativo.", 400);
    }
    //validar stock
    if (nuevoProducto.stock === 0) {
      nuevoProducto.estado = "Inactivo";
    }

    //validar estado
    const estadosValidos = ["Disponible", "Agotado", "Inactivo"];

    if (!estadosValidos.includes(nuevoProducto.estado)) {
      throw new AppError(
        "El estado debe ser Disponible, Agotado o Inactivo.",
        400,
      );
    }

    //validar categoria
    const categoria = await categoriaModel.obtenerCategoriaId(
      nuevoProducto.categorias_id,
      conn,
    );

    if (!categoria) {
      throw new AppError("La categoría no existe", 404);
    }

    //si no llega una nueva, conserva la anterior
    nuevoProducto.imagen_url = productoExiste.imagen_url;
    nuevoProducto.imagen_public_id = productoExiste.imagen_public_id;

    if (archivo) {
      const resultado = await subirImagen(archivo.buffer);

      imagenNuevaPublicId = resultado.public_id;

      nuevoProducto.imagen_url = resultado.secure_url;
      nuevoProducto.imagen_public_id = resultado.public_id;
    }

    //actualizar BD primero
    const productoActualizado = await productoModel.actualizarProducto(
      id,
      nuevoProducto,
      conn,
    );

    //confirmar commit
    await conn.commit();

    //eliminar imagen
    if (imagenNuevaPublicId && imagenAnteriorPublicId) {
      try {
        await eliminarImagen(imagenAnteriorPublicId);
      } catch (error) {
        console.error("No se pudo eliminar la imagen anterior:", error);
      }
    }

    return productoActualizado;
  } catch (error) {
    await conn.rollback();

    //eliminar imagen si falla
    if (imagenNuevaPublicId) {
      try {
        await eliminarImagen(imagenNuevaPublicId);
      } catch (errorEliminar) {
        console.error("No se pudo eliminar la imagen nueva:", errorEliminar);
      }
    }
    throw error;
  } finally {
    conn.release();
  }
};

//cambiar estado del producto
export const actualizarEstadoProducto = async (id, estado) => {
  const producto = await productoModel.obtenerProductoId(id);

  if (!producto) {
    throw new AppError("Producto no encontrado", 404);
  }

  const estadosValidos = ["Disponible", "Agotado", "Inactivo"];

  if (!estadosValidos.includes(estado)) {
    throw new AppError(
      "El estado debe ser Disponible, Agotado y Inactivo.",
      400,
    );
  }

  if (estado === "Disponible" && producto.stock === 0) {
    throw new AppError(
      "No puedes marcar como Disponible un producto sin stock.",
      400,
    );
  }

  return productoModel.cambiarEstadoProducto(id, estado);
};
//==================================

//eliminar producto
export const borrarProducto = async (id) => {
  const conn = await connection.getConnection();

  try {
    await conn.beginTransaction();

    //validar producto
    const producto = await productoModel.obtenerProductoId(id, conn);

    if (!producto) {
      throw new AppError("Producto no encontrado", 404);
    }

    //imagen
    const imagenProducto = producto.imagen_public_id;

    const tienePedido = await productoModel.productoTienePedido(id, conn);

    if (tienePedido) {
      await productoModel.cambiarEstadoProducto(id, "Inactivo", conn);

      await conn.commit();

      return {
        eliminado: false,
        mensaje: "El producto tiene pedidos y fue marcado como Inactivo.",
      };
    }

    await productoModel.eliminarProducto(id, conn);

    //confirmar
    await conn.commit();

    if (imagenProducto) {
      try {
        await eliminarImagen(imagenProducto);
      } catch (errorEliminar) {
        console.error("No se pudo eliminar la imagen:", errorEliminar);
      }
    }

    return {
      eliminado: true,
      mensaje: "Producto eliminado correctamente.",
    };
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
};
