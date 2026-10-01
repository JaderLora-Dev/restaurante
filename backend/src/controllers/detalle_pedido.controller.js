import * as detalleService from "../services/detallePedido.service.js";

//mostrar detalle_pedido
export const mostrarDetallePedido = async (req, res, next) => {
  try {
    const idUsuario = req.usuario.idUsuarios;

    const detalle = await detalleService.obtenerDetallePedido(idUsuario);

    res.status(200).json(detalle);
  } catch (error) {
    next(error);
  }
};

export const mostrarDetallePedidoPorPedido = async (req, res, next) => {
  try {
    const idPedido = Number(req.params.idPedido);
    const idUsuario = req.usuario.idUsuarios;
    const rol = req.usuario.rol;

    const detalle = await detalleService.obtenerDetallePedidoPorPedido(
      idPedido,
      idUsuario,
      rol,
    );

    res.status(200).json(detalle);
  } catch (error) {
    next(error);
  }
};

//modtrar por id
export const mostrarDetallePedidoId = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    const detalle = await detalleService.mostrarDetallePedidoId(id);

    res.status(200).json(detalle);
  } catch (error) {
    next(error);
  }
};

// agregar producto al pedido
export const agregarDetallePedido = async (req, res, next) => {
  try {
    const idUsuario = req.usuario.idUsuarios;
    const detalle = await detalleService.crearDetallePedido(
      req.body,
      idUsuario,
    );

    res.status(201).json(detalle);
  } catch (error) {
    next(error);
  }
};

//actualizar cantidad manual
export const editarDetallePedido = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    const idUsuario = req.usuario.idUsuarios;

    const detalle = await detalleService.actualizarDetallePedido(
      id,
      req.body,
      idUsuario,
    );

    res.status(200).json(detalle);
  } catch (error) {
    next(error);
  }
};

//eliminar producto
export const borrarDetallePedido = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const idUsuario = req.usuario.idUsuarios;
    const rol = req.usuario.rol;

    await detalleService.eliminarDetallePedido(id, idUsuario, rol);

    res.status(200).json({ mensaje: "Detalle eliminado correctamente." });
  } catch (error) {
    next(error);
  }
};
