import AppError from "../utils/AppError.js";

export const validarProducto = async (req, res, next) => {
  try {
    const { nombre, precio, detalle, estado, stock, categorias_id } = req.body;

    //nombre
    if (typeof nombre !== "string" || !nombre.trim()) {
      throw new AppError("El nombre es obligatorio.", 400);
    }

    const nombreNormalizado = nombre.trim();

    //validar nombre
    if (nombreNormalizado.length < 3) {
      throw new AppError("El nombre debe tener al menos 3 caracteres.", 400);
    }

    if (nombreNormalizado.length > 100) {
      throw new AppError("El nombre no puede superar los 100 caracteres.", 400);
    }

    //precio
    if (precio === undefined || precio === null || precio === "") {
      throw new AppError("El precio es obligatorio.", 400);
    }

    const precioNumero = Number(precio);

    if (!Number.isFinite(precioNumero)) {
      throw new AppError("El precio debe ser número válido.", 400);
    }
    if (precioNumero < 0) {
      throw new AppError("El precio no puede ser negativo.", 400);
    }

    if (Math.round(precioNumero * 100) !== precioNumero * 100) {
      throw new AppError("El preio debe tener máximo 2 decimales.", 400);
    }

    //detalle
    if (typeof detalle !== "string" || !detalle.trim()) {
      throw new AppError("El detalle es obligatorio.", 400);
    }

    //Estado
    if (typeof estado !== "string" || !estado?.trim()) {
      throw new AppError("El estado es obligatorio.", 400);
    }

    const estadosPermitidos = ["Disponible", "Agotado", "Inactivo"];

    const estadoNormalizado = estado.trim();

    if (!estadosPermitidos.includes(estadoNormalizado)) {
      throw new AppError("El estado del producto no es válido.", 400);
    }

    //stock
    if (stock === undefined || stock === null || stock === "") {
      throw new AppError("El stock es obligatorio.", 400);
    }

    const stockNumero = Number(stock);

    if (!Number.isInteger(stockNumero)) {
      throw new AppError("El stock debe ser un número entero.", 400);
    }

    if (stockNumero < 0) {
      throw new AppError("El stock no puede ser negativo.", 400);
    }

    //categoria
    if (
      categorias_id === undefined ||
      categorias_id === null ||
      categorias_id === ""
    ) {
      throw new AppError("Debe selecionar una categoria.", 400);
    }

    const categoriaId = Number(categorias_id);

    if (!Number.isInteger(categoriaId) || categoriaId <= 0) {
      throw new AppError("El identificador de la categoría no es válido.", 400);
    }

    req.body.nombre = nombreNormalizado;
    req.body.detalle = detalle.trim();
    req.body.estado = estadoNormalizado;
    req.body.precio = precioNumero;
    req.body.stock = stockNumero;
    req.body.categorias_id = categoriaId;

    next();
  } catch (error) {
    next(error);
  }
};

export const validarProductoEstado = async (req, res, next) => {
  try {
    const { estado } = req.body;

    //Estado
    if (typeof estado !== "string" || !estado?.trim()) {
      throw new AppError("El estado es obligatorio.", 400);
    }

    const estadosPermitidos = ["Disponible", "Agotado", "Inactivo"];

    const estadoNormalizado = estado.trim();

    if (!estadosPermitidos.includes(estadoNormalizado)) {
      throw new AppError("El estado del producto no es válido.", 400);
    }

    req.body.estado = estadoNormalizado;

    next();
  } catch (error) {
    next(error);
  }
};
