import AppError from "../utils/AppError.js";

export const validarDetallePost = (req, res, next) => {
  const { idMesas, idProductos, cantidad, observaciones } = req.body;

  const idMesa = Number(idMesas);
  if (!Number.isInteger(idMesa) || idMesa <= 0) {
    throw new AppError(
      "El id de la mesa debe ser un número entero mayor que cero.",
      400,
    );
  }

  const idProducto = Number(idProductos);

  if (!Number.isInteger(idProducto) || idProducto <= 0) {
    throw new AppError(
      "El id del producto debe ser un número entero mayor que cero.",
      400,
    );
  }

  const cantidadProducto = Number(cantidad);

  if (!Number.isInteger(cantidadProducto) || cantidadProducto <= 0) {
    throw new AppError(
      "La cantidad debe ser un número entero mayor que cero.",
      400,
    );
  }

  if (
    observaciones !== undefined &&
    observaciones !== null &&
    typeof observaciones !== "string"
  ) {
    throw new AppError("Las observaciones deben ser texto.", 400);
  }

  if (typeof observaciones === "string" && observaciones.length > 255) {
    throw new AppError(
      "Las observaciones no pueden superar los 255 caracteres.",
      400,
    );
  }

  req.body.idMesas = idMesa;
  req.body.idProductos = idProducto;
  req.body.cantidad = cantidadProducto;

  next();
};

export const validarDetallePut = (req, res, next) => {
  const { cantidad, observaciones } = req.body;

  const cantidadProducto = Number(cantidad);

  if (!Number.isInteger(cantidadProducto) || cantidadProducto <= 0) {
    throw new AppError(
      "La cantidad debe ser un número entero mayor que cero.",
      400,
    );
  }

  if (
    observaciones !== undefined &&
    observaciones !== null &&
    typeof observaciones !== "string"
  ) {
    throw new AppError("Las observaciones deben ser texto.", 400);
  }

  if (typeof observaciones === "string" && observaciones.length > 255) {
    throw new AppError(
      "Las observaciones no pueden superar los 255 caracteres.",
      400,
    );
  }

  req.body.cantidad = cantidadProducto;

  next();
};
