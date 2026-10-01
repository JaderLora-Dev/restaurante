import AppError from "../utils/AppError.js";

export const permitirRoles = (...rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.usuario) {
      return next(new AppError("No autenticado.", 401));
    }

    if (!rolesPermitidos.includes(req.usuario.rol)) {
      return next(
        new AppError("No tienes permiso para realizar esta acción.", 403),
      );
    }
    next();
  };
};
