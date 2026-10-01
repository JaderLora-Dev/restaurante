import AppError from "../utils/AppError.js";

export const validarId = (parametro = "id") => {
  return (req, res, next) => {
    const id = Number(req.params[parametro]);

    if (!Number.isInteger(id) || id <= 0) {
      throw new AppError(
        "El identificador debe ser un número entero mayor que cero.",
        400,
      );
    }

    next();
  };
};
