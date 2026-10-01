import * as productoService from "../services/productos.service.js";

//mostrar productos
export const mostrarProductos = async (req, res, next) => {
  try {
    const { buscar, page, limit, categoria, estado, orden } = req.query;

    const productos = await productoService.obtenerProductos(
      buscar,
      Number(page) || 1,
      Number(limit) || 10,
      categoria,
      estado,
      orden,
    );

    res.status(200).json(productos);
  } catch (error) {
    next(error);
  }
};

//obtener producto disponible
export const obtenerProductosDisponible = async (req, res, next) => {
  try {
    const { buscar, page, limit, categoria } = req.query;

    const productos = await productoService.mostrarProductosDisponible(
      buscar,
      Number(page) || 1,
      Number(limit) || 10,
      categoria,
    );
    res.status(200).json(productos);
  } catch (error) {
    next(error);
  }
};

//mostrar por id
export const mostrarProductoId = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    const producto = await productoService.obtenerProductoId(id);

    res.json(producto);
  } catch (error) {
    next(error);
  }
};

//crear producto
export const agregarProducto = async (req, res, next) => {
  try {
    const nuevoProducto = await productoService.crearProducto(
      req.body,
      req.file,
    );

    res.status(201).json({
      mensaje: "Producto creado correctamente.",
      nuevoProducto,
    });
  } catch (error) {
    next(error);
  }
};

//actualizar productos
export const editarProducto = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    const productoActualizado = await productoService.editarProducto(
      id,
      req.body,
      req.file,
    );

    res.status(200).json({
      mensaje: "Producto actualizado correctamente.",
      productoActualizado,
    });
  } catch (error) {
    next(error);
  }
};

//actualizar estado
export const cambiarEstadoProducto = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { estado } = req.body;

    const producto = await productoService.actualizarEstadoProducto(id, estado);

    res.status(200).json({
      mensaje: "Estado actualizado correctamente",
      producto,
    });
  } catch (error) {
    next(error);
  }
};

// eliminar producto
export const borrarProducto = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    const respuesta = await productoService.borrarProducto(id);

    res.status(200).json({
      respuesta,
    });
  } catch (error) {
    next(error);
  }
};
