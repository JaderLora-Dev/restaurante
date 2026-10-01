import { fileTypeFromBuffer } from "file-type";
import AppError from "../utils/AppError.js";

export const validarImagen = async (req, res, next) => {
  if (!req.file) {
    return next();
  }

  try {
    const tipoReal = await fileTypeFromBuffer(req.file.buffer);

    const tiposPermitidos = ["image/jpeg", "image/png", "image/webp"];

    if (!tipoReal || !tiposPermitidos.includes(tipoReal.mime)) {
      return next(
        new AppError(
          "El archivo no es una imagen JPG, PNG o WEBP válida.",
          400,
        ),
      );
    }

    next();
  } catch (error) {
    next(error);
  }
};
