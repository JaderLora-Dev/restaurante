import AppError from "../utils/AppError.js";

export const validarCategoria = (req, res, next) => {
  try {
    const { nombre, estado } = req.body;

    if (typeof nombre !== "string" || !nombre.trim()) {
      throw new AppError("El nombre es obligatorio.", 400);
    }

    if (typeof estado !== "string" || !estado.trim()) {
      throw new AppError("El estado es obligatorio.", 400);
    }

    const estadosValidos = ["Activo", "Inactivo"];
    const estadoNormalizado = estado.trim();

    if (!estadosValidos.includes(estadoNormalizado)) {
      throw new AppError("El estado debe ser Activo o Inactivo.", 400);
    }

    req.body.nombre = nombre.trim();
    req.body.estado = estadoNormalizado;
    next();
  } catch (error) {
    next(error);
  }
};

export const validarEstadoCategoria = (req, res, next) => {
  try {
    const { estado } = req.body;

    if (typeof estado !== "string" || !estado.trim()) {
      throw new AppError("El estado es obligatorio.", 400);
    }

    const estadosValidos = ["Activo", "Inactivo"];
    const estadoNormalizado = estado.trim();

    if (!estadosValidos.includes(estadoNormalizado)) {
      throw new AppError("El estado debe ser Activo o Inactivo.", 400);
    }

    req.body.estado = estadoNormalizado;

    next();
  } catch (error) {
    next(error);
  }
};
