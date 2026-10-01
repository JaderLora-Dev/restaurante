import multer from "multer";
import AppError from "../utils/AppError.js";

//configulacion
const storage = multer.memoryStorage();

const tiposPermitidos = ["image/jpeg", "image/png", "image/webp"];

//validar tipo de archivos
const fileFilter = (req, file, cb) => {
  if (!tiposPermitidos.includes(file.mimetype)) {
    return cb(new AppError("Solo se permiten imágenes JPG, PNG o WEBP."));
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024,
  },
});

export default upload;
