import * as usuarioService from "../services/usuarios.service.js";

//obtener usuarios
export const mostrarUsuarios = async (req, res, next) => {
  try {
    const usuarios = await usuarioService.obtenerUsuarios();

    res.status(200).json(usuarios);
  } catch (error) {
    next(error);
  }
};

//obtener por id
export const obtenerUsuarioId = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    const usuario = await usuarioService.obtenerUsuarioId(id);

    res.status(200).json(usuario);
  } catch (error) {
    next(error);
  }
};

//crear usuarios
export const crearUsuario = async (req, res, next) => {
  try {
    const usuario = await usuarioService.crearUsuario(req.body);

    res.status(201).json({
      mensaje: "Usuario creado correctamente.",
      usuario,
    });
  } catch (error) {
    next(error);
  }
};

//cambiar estado
export const cambiarEstadoUsuario = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { estado } = req.body;

    const usuario = await usuarioService.cambiarEstadoUsuario(
      id,
      estado,
      req.usuario.idUsuarios,
    );

    res.status(200).json({
      mensaje: "Estado actualizado correctamente.",
      usuario,
    });
  } catch (error) {
    next(error);
  }
};

//actualizar usuarios
export const actualizarUsuario = async (req, res, next) => {
  try {
    const id = req.params.id;

    const usuarioActualizado = await usuarioService.actualizarUsuario(
      id,
      req.body,
    );

    res.status(200).json({
      mensaje: "Usuario actualizado correctamente",
      usuario: usuarioActualizado,
    });
  } catch (error) {
    next(error);
  }
};

//eliminar usuarios
export const eliminarUsuario = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    const respuesta = await usuarioService.eliminarUsuario(
      id,
      req.usuario.idUsuarios,
    );

    res.status(200).json({ mensaje: respuesta.mensaje });
  } catch (error) {
    next(error);
  }
};
