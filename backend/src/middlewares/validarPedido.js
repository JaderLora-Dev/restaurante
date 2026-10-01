import AppError from "../utils/AppError.js";

export const validarPedido = (req, res, next) => {
  const { idMesas } = req.body;

  if (idMesas === undefined || idMesas === null || idMesas === "") {
    throw new AppError("La mesa es obligatoria.", 400);
  }

  const idMesa = Number(idMesas);

  if (!Number.isInteger(idMesa) || idMesa <= 0) {
    throw new AppError("El id de la mesa debe ser mayor que cero.", 400);
  }

  next();
};

export const validarEstadoPedido = (req, res, next) => {
  const { estado } = req.body;

  if (typeof estado !== "string" || estado.trim() === "") {
    throw new AppError("El estado es obligatorio.", 400);
  }

  const estadosValidos = ["Activo", "Finalizado", "Cancelado"];

  if (!estadosValidos.includes(estado)) {
    throw new AppError(
      "El estado debe ser Activo, Finalizado o Cancelado.",
      400,
    );
  }
  next();
};
