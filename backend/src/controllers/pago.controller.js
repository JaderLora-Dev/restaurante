import * as pagoService from "../services/pago.service.js";

//obtener pagos
export const obtenerPagos = async (req, res, next) => {
  try {
    const { page, limit, metodoPago, fechaInicio, fechaFin } = req.query;

    const pagos = await pagoService.mostrarPagos(
      Number(page) || 1,
      Number(limit) || 10,
      metodoPago,
      fechaInicio,
      fechaFin,
    );

    res.status(200).json(pagos);
  } catch (error) {
    next(error);
  }
};

//crear pagos
export const crearPago = async (req, res, next) => {
  try {
    const { idPedidos, metodoPago, dineroRecibido } = req.body;

    const idUsuario = req.usuario.idUsuarios;
    const rol = req.usuario.rol;

    const pago = await pagoService.crearPago(
      idPedidos,
      metodoPago,
      dineroRecibido,
      idUsuario,
      rol,
    );

    res.status(201).json({
      mensaje: "Pago registrado correctamente.",
      pago,
    });
  } catch (error) {
    next(error);
  }
};

//Obtener comprobante
export const mostrarComprobante = async (req, res, next) => {
  try {
    const idPedido = Number(req.params.id);
    const idUsuario = req.usuario.idUsuarios;
    const rol = req.usuario.rol;

    const comprobante = await pagoService.obtenerComprobante(
      idPedido,
      idUsuario,
      rol,
    );

    res.status(200).json(comprobante);
  } catch (error) {
    next(error);
  }
};
