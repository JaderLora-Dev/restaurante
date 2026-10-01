import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import * as usuarioModel from "../models/usuario.model.js";
import AppError from "../utils/AppError.js";

export const login = async (email, contraseña) => {
  //validar datos
  if (
    typeof email !== "string" ||
    typeof contraseña !== "string" ||
    !email.trim() ||
    !contraseña
  ) {
    throw new AppError("Email y contraseña son obligatorios.", 400);
  }

  //normalizar correo
  const normalizarEmail = email.trim().toLowerCase();

  //buscar usuario
  const usuario = await usuarioModel.obtenerUsuarioPorEmail(normalizarEmail);

  if (!usuario) {
    throw new AppError("Credenciales incorrectas.", 401);
  }

  if (usuario.estado === "Inactivo") {
    throw new AppError("Credenciales incorrectas.", 401);
  }

  if (!usuario.contraseña) {
    throw new AppError("El usuario no tiene una contraseña válidad.", 500);
  }

  //comparar contraseña
  const validContraseña = await bcrypt.compare(contraseña, usuario.contraseña);

  if (!validContraseña) {
    throw new AppError("Credenciales incorrectas.", 401);
  }

  //generar jwt
  const token = jwt.sign(
    {
      idUsuarios: usuario.idUsuarios,
      rol: usuario.rol,
    },
    process.env.JWT_SECRET,

    {
      expiresIn: "4h",
    },
  );

  return {
    token,
    usuario: {
      id: usuario.idUsuarios,
      rol: usuario.rol,
    },
  };
};
