import * as pedidoService from "../services/pedido.service.js";

//obtener pedidos
export const mostrarPedidos = async (req, res, next) => {
  try {
    const { page, limit, estado, mesero, mesa } = req.query;

    const pedidos = await pedidoService.obtenerPedidos(
      Number(page) || 1,
      Number(limit) || 10,
      estado,
      mesero,
      mesa,
    );

    res.status(200).json(pedidos);
  } catch (error) {
    next(error);
  }
};

//mostrar por id
export const mostrarPedidoId = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    const idUsuario = req.usuario.idUsuarios;
    const rol = req.usuario.rol;

    const pedido = await pedidoService.obtenerPedidoId(id, idUsuario, rol);

    res.status(200).json(pedido);
  } catch (error) {
    next(error);
  }
};

//obtener pedido activo mesa
export const mostrarPedidoActivoMesa = async (req, res, next) => {
  try {
    const idMesa = Number(req.params.id);

    const idUsuario = req.usuario.idUsuarios;
    const rol = req.usuario.rol;

    const pedido = await pedidoService.obtenerPedidoActivoMesa(
      idMesa,
      idUsuario,
      rol,
    );

    res.status(200).json(pedido);
  } catch (error) {
    next(error);
  }
};

//obtener pedidos activos
export const mostrarPedidosActivos = async (req, res, next) => {
  try {
    const idUsuario = req.usuario.idUsuarios;

    const pedido = await pedidoService.obtenerPedidosActivos(idUsuario);

    res.status(200).json(pedido);
  } catch (error) {
    next(error);
  }
};

// crear pedidos
export const agregaPedido = async (req, res, next) => {
  try {
    const { idMesas } = req.body;

    const pedido = await pedidoService.crearPedido(
      idMesas,
      req.usuario.idUsuarios,
    );

    res.status(201).json({
      mensaje: "Pedido creado correctamente.",
      pedido,
    });
  } catch (error) {
    next(error);
  }
};

//cambiar estado de pedidos cocina
export const cambiarEstadoPedido = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const idUsuario = req.usuario.idUsuarios;
    const rol = req.usuario.rol;
    const { estado } = req.body;

    const pedido = await pedidoService.cambiarEstadoPedido(
      id,
      estado,
      idUsuario,
      rol,
    );

    res.status(200).json({
      mensaje: "Estado del pedido actualizado correctamente.",
      pedido,
    });
  } catch (error) {
    next(error);
  }
};
