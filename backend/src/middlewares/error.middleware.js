import multer from "multer";

const errorMiddleware = (error, req, res, next) => {
  console.error(error);

  const statusCode = error.statusCode || 500;

  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        mensaje: "La imagen no puede superar los 2 MB.",
      });
    }

    res.status(400).json({
      mensaje: "Error al subir la imagen.",
    });
  }

  return res.status(statusCode).json({
    mensaje: error.message || "Error interno del servidor.",
  });
};

export default errorMiddleware;
