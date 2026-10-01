import * as mesaModel from "../models/mesa.model.js";
import AppError from "../utils/AppError.js";

//obtener mesas
export const obtenerMesas = async (buscar, estado, orden) => {
  const mesas = await mesaModel.obtenerMesas(buscar, estado, orden);

  return mesas;
};

//obtener por id
export const obtenerMesaId = async (id) => {
  const mesa = await mesaModel.obtenerMesaId(id);

  if (!mesa) {
    throw new AppError("Mesa no encontrada.", 404);
  }

  return mesa;
};

//crear mesa
export const crearMesa = async (mesa) => {
  const { numero, estado } = mesa;

  if (numero === undefined || numero === null || numero === "") {
    throw new AppError("El número es obligatorio.", 400);
  }

  const numeroMesa = Number(numero);
  if (!Number.isInteger(numeroMesa) || numeroMesa <= 0) {
    throw new AppError(
      "El número de la mesa debe ser un entero mayor que cero.",
      400,
    );
  }

  const numeroExisten = await mesaModel.obtenerMesaPorNumero(numeroMesa);

  if (numeroExisten) {
    throw new AppError("EL número ya existe.", 400);
  }

  //estados
  const estadosValidos = ["Disponible", "Ocupada", "Inactiva"];

  if (!estadosValidos.includes(estado)) {
    throw new AppError(
      "El estado debe ser Disponible, Ocupada o Inactiva.",
      400,
    );
  }

  return await mesaModel.crearMesa({
    ...mesa,
    numero: numeroMesa,
  });
};

//actualizar mesa
export const actualizarMesa = async (id, mesa) => {
  const { numero, estado } = mesa;

  if (numero === undefined || numero === null || numero === "") {
    throw new AppError("El número es obligatorio.", 400);
  }

  const numeroMesa = Number(numero);

  if (!Number.isInteger(numeroMesa) || numeroMesa <= 0) {
    throw new AppError(
      "El número de la mesa debe ser un entero mayor que cero.",
      400,
    );
  }

  const estadosValidos = ["Disponible", "Ocupada", "Inactiva"];

  if (!estadosValidos.includes(estado)) {
    throw new AppError(
      "El estado debe ser Disponible, Ocupada o Inactiva",
      400,
    );
  }

  const mesaExistente = await mesaModel.obtenerMesaId(id);

  if (!mesaExistente) {
    throw new AppError("Esta mesa no existe.", 404);
  }

  if (mesaExistente.estado === "Ocupada" && estado !== mesaExistente.estado) {
    throw new AppError(
      "No se puede cambiar el estado de una mesa ocupada.",
      400,
    );
  }

  const mesaNumero = await mesaModel.obtenerMesaPorNumero(numeroMesa);

  if (mesaNumero && mesaNumero.idMesas !== Number(id)) {
    throw new AppError("El número ya está registrado.", 400);
  }

  return await mesaModel.actualizarMesa(id, {
    ...mesa,
    numero: numeroMesa,
  });
};

//cambiar estado
export const cambiarEstadoMesa = async (id, estado, rol) => {
  const estadosValidos = ["Disponible", "Ocupada", "Inactiva"];

  if (!estadosValidos.includes(estado)) {
    throw new AppError(
      "El estado debe ser Disponible, Ocupada o Inactiva.",
      400,
    );
  }

  if (estado === "Inactiva" && rol !== "admin") {
    throw new AppError(
      "Solo el administrador puede marcar una mesa como Inactiva",
      403,
    );
  }
  const mesa = await mesaModel.obtenerMesaId(id);

  if (!mesa) {
    throw new AppError("La mesa no existe.", 404);
  }

  return await mesaModel.cambiarEstadoMesa(id, estado);
};

//eliminar o cambiar
export const eliminarMesa = async (id, rol) => {
  const mesa = await mesaModel.obtenerMesaId(id);

  if (!mesa) {
    throw new AppError("Mesa no encontrada.", 404);
  }

  const tienePedido = await mesaModel.mesaTienePedidos(id);

  if (tienePedido) {
    await cambiarEstadoMesa(id, "Inactiva", rol);

    return {
      eliminado: false,
      mensaje: "La mesa tiene pedido y fue marcada como Inactiva.",
    };
  }

  await mesaModel.eliminarMesa(id);

  return {
    eliminado: true,
    mensaje: "La mesa fue eliminada correctamente.",
  };
};
