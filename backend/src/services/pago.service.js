import { connection } from "../config/db.js";
import * as pagoModel from "../models/pago.model.js";
import * as pedidoModel from "../models/pedido.model.js";
import * as mesaModel from "../models/mesa.model.js";
import AppError from "../utils/AppError.js";

///obtener pagos
export const mostrarPagos = async (
  page,
  limit,
  metodoPago,
  fechaInicio,
  fechaFin,
) => {
  const { pagos, total } = await pagoModel.obtenerPagos(
    page,
    limit,
    metodoPago,
    fechaInicio,
    fechaFin,
  );

  return {
    pagos,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};
//crear pago
export const crearPago = async (
  idPedido,
  metodoPago,
  dineroRecibido,
  idUsuario,
  rol,
) => {
  const conn = await connection.getConnection();

  try {
    await conn.beginTransaction();

    //validar pedido
    const pedido = await pedidoModel.obtenerPedidoIdForUpdate(idPedido, conn);

    if (!pedido) {
      throw new AppError("El pedido no existe.", 404);
    }

    //validar que el pedido este activo
    if (pedido.estado !== "Activo") {
      throw new AppError("El pedido no está activo y no puede ser pagado", 400);
    }

    //verificar autorización del mesero
    if (rol === "mesero" && pedido.idUsuarios !== idUsuario) {
      throw new AppError("No tienes permiso para pagar este pedido.", 403);
    }

    //validar el metodo de pago
    const metodosValidos = ["Efectivo", "Nequi", "Transferencia", "Tarjeta"];

    if (!metodosValidos.includes(metodoPago)) {
      throw new AppError("El mètodo de pago no es vàlido.", 400);
    }

    //obtener el total base de datos
    const total = Number(pedido.total);

    if (!Number.isFinite(total) || total < 0) {
      throw new AppError("El total del pedido no es válido.", 500);
    }

    let cambio = null;
    let recibido = null;

    if (metodoPago === "Efectivo") {
      if (
        dineroRecibido === undefined ||
        dineroRecibido === null ||
        dineroRecibido === ""
      ) {
        throw new AppError("Debe ingresar el dinero recibido.", 400);
      }

      recibido = Number(dineroRecibido);

      if (!Number.isFinite(recibido)) {
        throw new AppError(
          "El dinero recibido debe ser un número válido.",
          400,
        );
      }

      if (recibido < 0) {
        throw new AppError("El dinero recibido no puede ser negativo.", 400);
      }

      if (recibido < total) {
        throw new AppError(
          `El dinero recibido es insuficiente. Faltan ${(
            total - recibido
          ).toLocaleString("es-CO", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}.`,
          400,
        );
      }
      cambio = recibido - total;
    }

    //registrar pago
    const idPago = await pagoModel.crearPago(
      conn,
      idPedido,
      metodoPago,
      total,
      recibido,
      cambio,
    );

    //finalizar
    await pedidoModel.finalizarPedido(conn, idPedido);

    //liberar mesa

    await mesaModel.liberarMesaPedido(conn, pedido.idPedidos);

    //confirmar transacción
    await conn.commit();

    return { idPago, idPedido, metodoPago, total, cambio };
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
};

//obtener comprobante
export const obtenerComprobante = async (idPedido, idUsuario, rol) => {
  const pedido = await pedidoModel.obtenerPedidoId(idPedido);

  if (!pedido) {
    throw new AppError("El pedido no existe.", 404);
  }

  if (rol === "mesero" && pedido.idUsuarios !== idUsuario) {
    throw new AppError(
      "No tienes permiso para consultar este comprobante.",
      403,
    );
  }

  const comprobante = await pagoModel.obtenerComprobantePago(idPedido);

  if (!comprobante) {
    throw new AppError("No se encontró el comprobante.", 404);
  }

  const detalle = await pagoModel.obtenerDetalleComprobante(idPedido);

  return {
    comprobante,
    detalle,
  };
};
