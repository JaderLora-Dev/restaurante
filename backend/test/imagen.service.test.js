import { describe, it, expect, vi, beforeEach } from "vitest";

const { uploadStreamMock, destroyMock } = vi.hoisted(() => ({
  uploadStreamMock: vi.fn(),
  destroyMock: vi.fn(),
}));

vi.mock("../src/config/cloudinary.js", () => ({
  default: {
    uploader: {
      upload_stream: uploadStreamMock,
      destroy: destroyMock,
    },
  },
}));

import { subirImagen, eliminarImagen } from "../src/services/imagen.service.js";

describe("imagen.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("subirImagen", () => {
    it("debe subir la imagen correctamente", async () => {
      const resultadoEsperado = {
        secure_url: "https://cloudinary.com/imagen.jpg",
        public_id: "restaurante/productos/imagen",
      };

      const buffer = Buffer.from("imagen");

      const streamMock = {
        write: vi.fn(),
        end: vi.fn(),
      };

      uploadStreamMock.mockImplementation((opciones, callback) => {
        callback(null, resultadoEsperado);

        return streamMock;
      });

      const resultado = await subirImagen(buffer);

      expect(resultado).toEqual(resultadoEsperado);

      expect(uploadStreamMock).toHaveBeenCalledWith(
        {
          folder: "restaurante/productos",
          resource_type: "image",
        },
        expect.any(Function),
      );
    });

    it("debe rechazar la promesa cuando Cloudinary devuelve un error", async () => {
      const errorCloudinary = new Error("Error al subir imagen");

      uploadStreamMock.mockImplementation((opciones, callback) => {
        callback(errorCloudinary, null);

        return {
          write: vi.fn(),
          end: vi.fn(),
        };
      });

      await expect(subirImagen(Buffer.from("imagen"))).rejects.toThrow(
        "Error al subir imagen",
      );
    });
  });

  describe("eliminarImagen", () => {
    it("debe eliminar la imagen usando el public_id", async () => {
      const resultadoEsperado = {
        result: "ok",
      };

      destroyMock.mockResolvedValue(resultadoEsperado);

      const resultado = await eliminarImagen("restaurante/productos/imagen");

      expect(resultado).toEqual(resultadoEsperado);

      expect(destroyMock).toHaveBeenCalledWith("restaurante/productos/imagen");
    });
  });
});
