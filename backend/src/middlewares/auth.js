import jwt from "jsonwebtoken";
import AppError from "../utils/AppError.js";

export const verificarToken = (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      throw new AppError("Token requerido.", 401);
    }

    //verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ["HS256"],
    });

    //guardar usuario en request
    req.usuario = decoded;

    next();
  } catch (error) {
    next(error);
  }
};
