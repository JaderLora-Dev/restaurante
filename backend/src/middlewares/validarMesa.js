import AppError from "../utils/AppError.js";

export const validarMesa = (req, res, next) => {
  try {
    const { numero, estado } = req.body;

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

    if (typeof estado !== "string" || estado.trim() === "") {
      throw new AppError("El estado es obligatorio.", 400);
    }

    const estadoMesa = estado.trim();

    const estadosValidos = ["Disponible", "Ocupada", "Inactiva"];

    if (!estadosValidos.includes(estadoMesa)) {
      throw new AppError(
        "El estado debe ser Disponible, Ocupada o Inactiva.",
        400,
      );
    }

    req.body.numero = numeroMesa;
    req.body.estado = estadoMesa;

    next();
  } catch (error) {
    next(error);
  }
};

//validar estado mesa
export const validarMesaEstado = (req, res, next) => {
  try {
    const { estado } = req.body;

    if (typeof estado !== "string" || estado.trim() === "") {
      throw new AppError("El estado es obligatorio.", 400);
    }

    const estadoMesa = estado.trim();

    const estadosValidos = ["Disponible", "Ocupada", "Inactiva"];

    if (!estadosValidos.includes(estadoMesa)) {
      throw new AppError(
        "El estado debe ser Disponible, Ocupada o Inactiva.",
        400,
      );
    }

    req.body.estado = estadoMesa;

    next();
  } catch (error) {
    next(error);
  }
};
