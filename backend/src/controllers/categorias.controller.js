import * as categoriaService from "../services/categorias.service.js";

//mostrar categorias
export const mostrarCategorias = async (req, res, next) => {
  try {
    const { buscar, estado, orden } = req.query;
    const categorias = await categoriaService.obtenerCategorias(
      buscar,
      estado,
      orden,
    );

    res.status(200).json(categorias);
  } catch (error) {
    next(error);
  }
};

//mostrar por id
export const mostrarCategoriaId = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    const categoria = await categoriaService.mostrarCategoriaId(id);

    res.json(categoria);
  } catch (error) {
    next(error);
  }
};

// crear categoria
export const agregarCategoria = async (req, res, next) => {
  try {
    const categoriaNueva = await categoriaService.crearCategoria(req.body);

    res.status(201).json({
      mensaje: "Categoria creada correctamente.",
      categoria: categoriaNueva,
    });
  } catch (error) {
    next(error);
  }
};

//actualizar
export const editarCategoria = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    const categoriaActualizada = await categoriaService.actualizarCategoria(
      id,
      req.body,
    );

    res.json({
      mensaje: "Categoria actualizada",
      categoria: categoriaActualizada,
    });
  } catch (error) {
    next(error);
  }
};

//cambiar de estado
export const cambiarEstadoCategoria = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { estado } = req.body;

    const categoria = await categoriaService.cambiarEstadoCategoria(id, estado);

    res.status(200).json({
      mensaje: "Estado actualizado correctamente.",
      categoria,
    });
  } catch (error) {
    next(error);
  }
};

// eliminar
export const borrarCategoria = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    const respuesta = await categoriaService.eliminarCategoria(id);

    res.status(200).json({ mensaje: respuesta.mensaje });
  } catch (error) {
    next(error);
  }
};
