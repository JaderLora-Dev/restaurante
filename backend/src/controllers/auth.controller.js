import * as usuarioService from "../services/auth.service.js";

export const login = async (req, res, next) => {
  try {
    const { email, contraseña } = req.body;

    const respuesta = await usuarioService.login(email, contraseña);

    const esProduccion = process.env.NODE_ENV === "production";

    res.cookie("token", respuesta.token, {
      httpOnly: true,
      secure: esProduccion,
      sameSite: esProduccion ? "none" : "lax",
      maxAge: 4 * 60 * 60 * 1000,
      path: "/",
    });

    res.status(200).json({
      mensaje: "Login exitoso.",
      usuario: respuesta.usuario,
    });
  } catch (error) {
    next(error);
  }
};

// obtener usuario autenticado
export const obtenerUsuarioActual = (req, res) => {
  res.json({
    usuario: { id: req.usuario.idUsuarios, rol: req.usuario.rol },
  });
};

//cerrar sesion
export const logout = (req, res) => {
  const esProduccion = process.env.NODE_ENV === "production";

  res.clearCookie("token", {
    httpOnly: true,
    secure: esProduccion,
    sameSite: esProduccion ? "none" : "lax",
    path: "/",
  });

  res.json({
    mensaje: "Sesión cerrada correctamente.",
  });
};
