import AppError from "../utils/AppError.js";

export const validarPago = (req, res, next) => {
  try {
    const { idPedidos, metodoPago, dineroRecibido } = req.body;

    // Validar ID del pedido
    const idPedidoNumero = Number(idPedidos);

    if (!Number.isInteger(idPedidoNumero) || idPedidoNumero <= 0) {
      throw new AppError("El identificador del pedido no es válido.", 400);
    }

    // Validar método de pago
    const metodosValidos = ["Efectivo", "Nequi", "Transferencia", "Tarjeta"];

    if (
      typeof metodoPago !== "string" ||
      !metodosValidos.includes(metodoPago.trim())
    ) {
      throw new AppError("El método de pago no es válido.", 400);
    }

    const metodoNormalizado = metodoPago.trim();

    // Validar dinero recibido cuando es efectivo
    if (metodoNormalizado === "Efectivo") {
      if (
        dineroRecibido === undefined ||
        dineroRecibido === null ||
        dineroRecibido === ""
      ) {
        throw new AppError("Debe ingresar el dinero recibido.", 400);
      }

      const recibidoNumero = Number(dineroRecibido);

      if (!Number.isFinite(recibidoNumero)) {
        throw new AppError(
          "El dinero recibido debe ser un número válido.",
          400,
        );
      }

      if (recibidoNumero <= 0) {
        throw new AppError("El dinero recibido no puede ser negativo.", 400);
      }

      if (Math.round(recibidoNumero * 100) !== recibidoNumero * 100) {
        throw new AppError(
          "El dinero recibido debe tener máximo 2 decimales.",
          400,
        );
      }

      req.body.dineroRecibido = recibidoNumero;
    } else {
      // Para métodos electrónicos no se necesita dinero recibido
      req.body.dineroRecibido = null;
    }

    req.body.idPedidos = idPedidoNumero;
    req.body.metodoPago = metodoNormalizado;

    next();
  } catch (error) {
    next(error);
  }
};
