import AppError from "../utils/AppError.js";

export const validarUsuario = (req, res, next) => {
  try {
    const { nombre, email, contraseña, rol } = req.body;

    //validar nombre
    if (typeof nombre !== "string" || !nombre.trim()) {
      throw new AppError("El nombre es obligatorio.", 400);
    }

    const nombreNormalizado = nombre.trim();

    if (nombreNormalizado.length < 3) {
      throw new AppError("El nombre debe tener al menos 3 caracteres.", 400);
    }

    if (nombreNormalizado.length > 100) {
      throw new AppError("El nombre no puede superar los 100 caracteres.", 400);
    }

    //validar email
    if (typeof email !== "string" || !email.trim()) {
      throw new AppError("El correo electrónico es obligatorio.", 400);
    }

    const emailNormalizado = email.trim().toLowerCase();

    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNormalizado);

    if (!emailValido) {
      throw new AppError("El correo electrónico no es válido.", 400);
    }

    if (emailNormalizado.length > 150) {
      throw new AppError("El correo electrónico es demasiado largo.", 400);
    }

    //validar rool
    if (typeof rol !== "string" || !rol.trim()) {
      throw new AppError("El rol es obligatorio.", 400);
    }

    const rolesValidos = ["admin", "mesero"];
    const rolNormalizado = rol.trim();

    if (!rolesValidos.includes(rolNormalizado)) {
      throw new AppError("El rol no es válido.", 400);
    }

    //validar contraseña
    if (req.method === "POST") {
      if (typeof contraseña !== "string" || !contraseña.trim()) {
        throw new AppError("La contraseña es obligatoria.");
      }

      if (contraseña.length < 6) {
        throw new AppError(
          "La contraseña debe tener al menos 6 caracteres.",
          400,
        );
      }

      if (contraseña.length > 100) {
        throw new AppError(
          "La contraseña no puede superar los 100 caracteres.",
          400,
        );
      }
    }

    if (req.method === "PUT" && contraseña) {
      if (typeof contraseña !== "string") {
        throw new AppError("La contraseña no ES válida.", 400);
      }

      if (contraseña.length < 6) {
        throw new AppError(
          "La contraseña debe tener al menos 6 caracteres.",
          400,
        );
      }

      if (contraseña.length > 100) {
        throw new AppError(
          "La contraseña no puede superar los 100 caracteres.",
          400,
        );
      }
    }

    req.body.nombre = nombreNormalizado;
    req.body.email = emailNormalizado;
    req.body.rol = rolNormalizado;

    next();
  } catch (error) {
    next(error);
  }
};

// validacion de login
export const validarLogin = (req, res, next) => {
  try {
    const { email, contraseña } = req.body;

    if (typeof email !== "string" || !email.trim()) {
      throw new AppError("El correo electrónico es obligatorio.", 400);
    }

    if (typeof contraseña !== "string" || !contraseña) {
      throw new AppError("La contraseña es obligatoria.", 400);
    }

    req.body.email = email.trim().toLowerCase();
    next();
  } catch (error) {
    next(error);
  }
};

//validar estado
export const validarEstadoUsuario = (req, res, next) => {
  try {
    const { estado } = req.body;

    if (typeof estado !== "string" || !estado.trim()) {
      throw new AppError("El estado es obligatorio.", 400);
    }

    const estadosValidos = ["Activo", "Inactivo"];
    const estadosNormalizado = estado.trim();

    if (!estadosValidos.includes(estadosNormalizado)) {
      throw new AppError("El estado debe ser Activo o Inactivo.", 400);
    }

    req.body.estado = estadosNormalizado;

    next();
  } catch (error) {
    next(error);
  }
};
