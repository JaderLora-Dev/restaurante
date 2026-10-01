import * as usuarioModel from "../models/usuario.model.js";
import bcrypt from "bcrypt";
import AppError from "../utils/AppError.js";

//obtener usuarios
export const obtenerUsuarios = async () => {
  const usuarios = await usuarioModel.obtenerUsuarios();

  return usuarios;
};

//obtener usuario por id
export const obtenerUsuarioId = async (id) => {
  const usuario = await usuarioModel.obtenerUsuarioId(id);

  if (!usuario) {
    throw new AppError("El usuario no existe.", 404);
  }

  return usuario;
};

//crear usuario
export const crearUsuario = async ({ nombre, email, contraseña, rol }) => {
  //validar usuario
  const usuarioExiste = await usuarioModel.obtenerUsuarioPorEmail(email);

  if (usuarioExiste) {
    throw new AppError("El correo electrónico ya está registrado.", 400);
  }

  //validar rol
  const rolesPermitidos = ["admin", "mesero"];

  if (!rolesPermitidos.includes(rol)) {
    throw new AppError("El rol no es válido.", 400);
  }

  //validar contraseña
  const contraseñaHash = await bcrypt.hash(contraseña, 10);

  return await usuarioModel.crearUsuario(nombre, email, contraseñaHash, rol);
};

//actualizar usuarios
export const actualizarUsuario = async (
  id,
  { nombre, email, contraseña, rol },
) => {
  //validar usuario
  const usuarioActual = await obtenerUsuarioId(id);

  //validar rol
  const rolesPermitidos = ["admin", "mesero"];

  if (!rolesPermitidos.includes(rol)) {
    throw new AppError("El rol no es válido.", 400);
  }

  //validar email
  const usuarioEmail = await usuarioModel.obtenerUsuarioPorEmail(email);

  if (usuarioEmail && usuarioEmail.idUsuarios !== Number(id)) {
    throw new AppError("El correo electrónico ya está registrado.", 400);
  }

  //no permitir converit el ultimo admin en mesero
  if (
    usuarioActual.rol === "admin" &&
    usuarioActual.estado === "Activo" &&
    rol === "mesero"
  ) {
    const cantidadAdmin = await usuarioModel.obtenerCantidadAdminActivos();

    if (cantidadAdmin <= 1) {
      throw new AppError(
        "No puedes quitar el rol al último administrador activo.",
        403,
      );
    }
  }
  if (typeof contraseña === "string" && contraseña.trim() !== "") {
    // con contraseña
    const contraseñaHash = await bcrypt.hash(contraseña, 10);

    await usuarioModel.actualizarUsuarioConContraseña(
      nombre,
      email,
      contraseñaHash,
      rol,
      id,
    );
  } else {
    //sin contraseña
    await usuarioModel.actualizarUsuarioSinContraseña(nombre, email, rol, id);
  }

  return await usuarioModel.obtenerUsuarioId(id);
};

//cambiar estado
export const cambiarEstadoUsuario = async (
  id,
  estado,
  idUsuarioAutenticado,
) => {
  //validar usuario
  const usuario = await obtenerUsuarioId(id);

  if (Number(id) === Number(idUsuarioAutenticado)) {
    throw new AppError(
      "No puedes cambiar el estado de tu propio usuario.",
      403,
    );
  }

  const estadosPermitidos = ["Activo", "Inactivo"];

  if (!estadosPermitidos.includes(estado)) {
    throw new AppError("Estado no válido.", 400);
  }

  if (
    usuario.rol === "admin" &&
    usuario.estado === "Activo" &&
    estado === "Inactivo"
  ) {
    const cantidadAdmin = await usuarioModel.obtenerCantidadAdminActivos();

    if (cantidadAdmin <= 1) {
      throw new AppError(
        "No puedes desactivar al último administrador activo.",
        403,
      );
    }
  }
  await usuarioModel.cambiarEstadoUsuario(id, estado);

  return await usuarioModel.obtenerUsuarioId(id);
};

//eliminar usuario
export const eliminarUsuario = async (id, idUsuarioAutenticado) => {
  //valdar usuario
  const usuario = await obtenerUsuarioId(id);

  if (Number(id) === Number(idUsuarioAutenticado)) {
    throw new AppError("No puedes eliminar tu propio usuario.", 403);
  }

  if (usuario.rol === "admin" && usuario.estado === "Activo") {
    const cantidadAdmin = await usuarioModel.obtenerCantidadAdminActivos();

    if (cantidadAdmin <= 1) {
      throw new AppError(
        "No puedes eliminar al último administrador activo.",
        403,
      );
    }
  }

  //validar si tiene pedido
  const tienePedidos = await usuarioModel.obtenerCantidadPedidoUsuario(id);

  if (tienePedidos > 0) {
    await usuarioModel.cambiarEstadoUsuario(id, "Inactivo");

    return {
      eliminado: false,
      mensaje:
        "El usuario tiene pedidos asociados y fue marcado como Inactivo.",
    };
  } else {
    await usuarioModel.eliminarUsuario(id);

    return {
      eliminado: true,
      mensaje: "El usuario fue eliminado correctamente.",
    };
  }
};
