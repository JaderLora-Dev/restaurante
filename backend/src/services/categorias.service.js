import * as categoriaModel from "../models/categorias.model.js";
import AppError from "../utils/AppError.js";

//Obtener categorias
export const obtenerCategorias = async (buscar, estado, orden) => {
  const categorias = await categoriaModel.obtenerCategorias(
    buscar,
    estado,
    orden,
  );

  return categorias;
};

//obtener por id
export const mostrarCategoriaId = async (id) => {
  const categoria = await categoriaModel.obtenerCategoriaId(id);

  if (!categoria) {
    throw new AppError("Categoría no encontrada.", 404);
  }

  return categoria;
};

//crear categoria
export const crearCategoria = async (categoria) => {
  //validar nombre
  const { nombre } = categoria;

  if (nombre.length < 3) {
    throw new AppError("El nombre debe tener al menos 3 caracteres.", 400);
  }

  if (nombre.length > 100) {
    throw new AppError("El nombre no puede tener mas de 100 caracteres.", 400);
  }

  const existe = await categoriaModel.obtenerCategoriaNombre(nombre);

  if (existe) {
    throw new AppError("El nombre ya existe.", 400);
  }

  //=========================================================

  return categoriaModel.crearCategoria(categoria);
};

//editar categorias
export const actualizarCategoria = async (id, categoria) => {
  const { nombre } = categoria;

  if (nombre.length < 3) {
    throw new AppError("El nombre debe tener mínimo 3 caracteres.", 400);
  }

  if (nombre.length > 100) {
    throw new AppError("El nombre no debe tener mas de 100 caracteres.", 400);
  }

  const categoriaExiste = await categoriaModel.obtenerCategoriaId(id);

  if (!categoriaExiste) {
    throw new AppError("La categoría no existe.", 404);
  }

  //validar nombre
  const categoriaNombre = await categoriaModel.obtenerCategoriaNombre(nombre);

  if (categoriaNombre && categoriaNombre.id !== Number(id)) {
    throw new AppError("El nombre ya está registrado.", 400);
  }

  return categoriaModel.actualizarCategoria(id, categoria);
};

//cambiar estado
export const cambiarEstadoCategoria = async (id, estado) => {
  const categoria = await categoriaModel.obtenerCategoriaId(id);

  if (!categoria) {
    throw new AppError("Categoría no encontrada.", 404);
  }

  const estadosValidos = ["Activo", "Inactivo"];

  if (!estadosValidos.includes(estado)) {
    throw new AppError("El estado debe ser Activo o Inactivo.", 400);
  }

  return categoriaModel.cambiarEstadoCategoria(id, estado);
};

//eliminar o cambiar de estado inactivo
export const eliminarCategoria = async (id) => {
  const categoriaExiste = await categoriaModel.obtenerCategoriaId(id);

  if (!categoriaExiste) {
    throw new AppError("La categoría no existe.", 404);
  }

  const tieneProducto = await categoriaModel.categoriaTieneProducto(id);

  if (tieneProducto) {
    await cambiarEstadoCategoria(id, "Inactivo");

    return {
      eliminado: false,
      mensaje: "La categoria tiene productos y fue marcado como Inactivo",
    };
  }

  await categoriaModel.eliminarCategoria(id);

  return {
    eliminado: true,
    mensaje: "La categoria fue eliminada correctamente.",
  };
};
