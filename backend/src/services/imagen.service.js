import { Readable } from "stream";
import cloudinary from "../config/cloudinary.js";

export const subirImagen = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "restaurante/productos",
        resource_type: "image",
      },
      (error, resultado) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(resultado);
      },
    );

    Readable.from(buffer).pipe(stream);
  });
};

export const eliminarImagen = async (publicId) => {
  return cloudinary.uploader.destroy(publicId);
};
