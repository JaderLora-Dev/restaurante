import { describe, it, expect, vi, beforeEach } from "vitest";

const {
  obtenerCategoriasMock,
  obtenerCategoriaIdMock,
  obtenerCategoriaNombreMock,
  crearCategoriaMock,
  actualizarCategoriaMock,
  cambiarEstadoCategoriaMock,
  categoriaTieneProductoMock,
  eliminarCategoriaMock,
} = vi.hoisted(() => ({
  obtenerCategoriasMock: vi.fn(),
  obtenerCategoriaIdMock: vi.fn(),
  obtenerCategoriaNombreMock: vi.fn(),
  crearCategoriaMock: vi.fn(),
  actualizarCategoriaMock: vi.fn(),
  cambiarEstadoCategoriaMock: vi.fn(),
  categoriaTieneProductoMock: vi.fn(),
  eliminarCategoriaMock: vi.fn(),
}));

vi.mock("../src/models/categorias.model.js", () => ({
  obtenerCategorias: obtenerCategoriasMock,
  obtenerCategoriaId: obtenerCategoriaIdMock,
  obtenerCategoriaNombre: obtenerCategoriaNombreMock,
  crearCategoria: crearCategoriaMock,
  actualizarCategoria: actualizarCategoriaMock,
  cambiarEstadoCategoria: cambiarEstadoCategoriaMock,
  categoriaTieneProducto: categoriaTieneProductoMock,
  eliminarCategoria: eliminarCategoriaMock,
}));

import {
  obtenerCategorias,
  mostrarCategoriaId,
  crearCategoria,
  actualizarCategoria,
  cambiarEstadoCategoria,
  eliminarCategoria,
} from "../src/services/categorias.service.js";

describe("categorias.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("obtenerCategorias", () => {
    it("debe devolver las categorías obtenidas del modelo", async () => {
      const categorias = [
        { id: 1, nombre: "Bebidas", estado: "Activo" },
        { id: 2, nombre: "Comidas", estado: "Activo" },
      ];

      obtenerCategoriasMock.mockResolvedValue(categorias);

      const resultado = await obtenerCategorias("beb", "Activo", "ASC");

      expect(resultado).toEqual(categorias);

      expect(obtenerCategoriasMock).toHaveBeenCalledWith(
        "beb",
        "Activo",
        "ASC",
      );
    });
  });

  describe("mostrarCategoriaId", () => {
    it("debe devolver la categoría cuando existe", async () => {
      const categoria = {
        id: 1,
        nombre: "Bebidas",
        estado: "Activo",
      };

      obtenerCategoriaIdMock.mockResolvedValue(categoria);

      const resultado = await mostrarCategoriaId(1);

      expect(resultado).toEqual(categoria);
      expect(obtenerCategoriaIdMock).toHaveBeenCalledWith(1);
    });

    it("debe lanzar error si la categoría no existe", async () => {
      obtenerCategoriaIdMock.mockResolvedValue(null);

      await expect(mostrarCategoriaId(99)).rejects.toMatchObject({
        message: "Categoría no encontrada.",
        statusCode: 404,
      });
    });
  });

  describe("crearCategoria", () => {
    it("debe rechazar un nombre menor de 3 caracteres", async () => {
      await expect(crearCategoria({ nombre: "AB" })).rejects.toMatchObject({
        message: "El nombre debe tener al menos 3 caracteres.",
        statusCode: 400,
      });

      expect(obtenerCategoriaNombreMock).not.toHaveBeenCalled();
    });

    it("debe rechazar un nombre mayor de 100 caracteres", async () => {
      const nombre = "A".repeat(101);

      await expect(crearCategoria({ nombre })).rejects.toMatchObject({
        message: "El nombre no puede tener mas de 100 caracteres.",
        statusCode: 400,
      });

      expect(obtenerCategoriaNombreMock).not.toHaveBeenCalled();
    });

    it("debe rechazar un nombre que ya existe", async () => {
      obtenerCategoriaNombreMock.mockResolvedValue({
        id: 1,
        nombre: "Bebidas",
      });

      await expect(crearCategoria({ nombre: "Bebidas" })).rejects.toMatchObject(
        {
          message: "El nombre ya existe.",
          statusCode: 400,
        },
      );

      expect(crearCategoriaMock).not.toHaveBeenCalled();
    });

    it("debe crear la categoría correctamente", async () => {
      const categoria = {
        nombre: "Postres",
      };

      const resultadoEsperado = {
        id: 3,
        ...categoria,
      };

      obtenerCategoriaNombreMock.mockResolvedValue(null);
      crearCategoriaMock.mockResolvedValue(resultadoEsperado);

      const resultado = await crearCategoria(categoria);

      expect(resultado).toEqual(resultadoEsperado);

      expect(obtenerCategoriaNombreMock).toHaveBeenCalledWith("Postres");

      expect(crearCategoriaMock).toHaveBeenCalledWith(categoria);
    });
  });

  describe("actualizarCategoria", () => {
    it("debe rechazar un nombre menor de 3 caracteres", async () => {
      await expect(
        actualizarCategoria(1, { nombre: "AB" }),
      ).rejects.toMatchObject({
        message: "El nombre debe tener mínimo 3 caracteres.",
        statusCode: 400,
      });
    });

    it("debe rechazar un nombre mayor de 100 caracteres", async () => {
      const nombre = "A".repeat(101);

      await expect(actualizarCategoria(1, { nombre })).rejects.toMatchObject({
        message: "El nombre no debe tener mas de 100 caracteres.",
        statusCode: 400,
      });
    });

    it("debe rechazar si la categoría no existe", async () => {
      obtenerCategoriaIdMock.mockResolvedValue(null);

      await expect(
        actualizarCategoria(99, { nombre: "Postres" }),
      ).rejects.toMatchObject({
        message: "La categoría no existe.",
        statusCode: 404,
      });

      expect(obtenerCategoriaNombreMock).not.toHaveBeenCalled();
    });

    it("debe rechazar si el nombre pertenece a otra categoría", async () => {
      obtenerCategoriaIdMock.mockResolvedValue({
        id: 1,
        nombre: "Bebidas",
      });

      obtenerCategoriaNombreMock.mockResolvedValue({
        id: 2,
        nombre: "Postres",
      });

      await expect(
        actualizarCategoria(1, { nombre: "Postres" }),
      ).rejects.toMatchObject({
        message: "El nombre ya está registrado.",
        statusCode: 400,
      });

      expect(actualizarCategoriaMock).not.toHaveBeenCalled();
    });

    it("debe actualizar la categoría correctamente", async () => {
      const categoria = {
        nombre: "Postres",
      };

      const resultadoEsperado = {
        id: 1,
        ...categoria,
      };

      obtenerCategoriaIdMock.mockResolvedValue({
        id: 1,
        nombre: "Bebidas",
      });

      obtenerCategoriaNombreMock.mockResolvedValue(null);
      actualizarCategoriaMock.mockResolvedValue(resultadoEsperado);

      const resultado = await actualizarCategoria(1, categoria);

      expect(resultado).toEqual(resultadoEsperado);

      expect(actualizarCategoriaMock).toHaveBeenCalledWith(1, categoria);
    });
  });

  describe("cambiarEstadoCategoria", () => {
    it("debe rechazar si la categoría no existe", async () => {
      obtenerCategoriaIdMock.mockResolvedValue(null);

      await expect(cambiarEstadoCategoria(99, "Activo")).rejects.toMatchObject({
        message: "Categoría no encontrada.",
        statusCode: 404,
      });

      expect(cambiarEstadoCategoriaMock).not.toHaveBeenCalled();
    });

    it("debe rechazar un estado inválido", async () => {
      obtenerCategoriaIdMock.mockResolvedValue({
        id: 1,
        nombre: "Bebidas",
        estado: "Activo",
      });

      await expect(
        cambiarEstadoCategoria(1, "Disponible"),
      ).rejects.toMatchObject({
        message: "El estado debe ser Activo o Inactivo.",
        statusCode: 400,
      });

      expect(cambiarEstadoCategoriaMock).not.toHaveBeenCalled();
    });

    it("debe cambiar el estado correctamente", async () => {
      obtenerCategoriaIdMock.mockResolvedValue({
        id: 1,
        nombre: "Bebidas",
        estado: "Activo",
      });

      const resultadoEsperado = {
        mensaje: "Estado actualizado",
      };

      cambiarEstadoCategoriaMock.mockResolvedValue(resultadoEsperado);

      const resultado = await cambiarEstadoCategoria(1, "Inactivo");

      expect(resultado).toEqual(resultadoEsperado);

      expect(cambiarEstadoCategoriaMock).toHaveBeenCalledWith(1, "Inactivo");
    });
  });

  describe("eliminarCategoria", () => {
    it("debe rechazar si la categoría no existe", async () => {
      obtenerCategoriaIdMock.mockResolvedValue(null);

      await expect(eliminarCategoria(99)).rejects.toMatchObject({
        message: "La categoría no existe.",
        statusCode: 404,
      });

      expect(categoriaTieneProductoMock).not.toHaveBeenCalled();
    });

    it("debe cambiar a Inactivo si tiene productos", async () => {
      obtenerCategoriaIdMock.mockResolvedValue({
        id: 1,
        nombre: "Bebidas",
        estado: "Activo",
      });

      categoriaTieneProductoMock.mockResolvedValue(true);
      cambiarEstadoCategoriaMock.mockResolvedValue({
        mensaje: "Estado actualizado",
      });

      const resultado = await eliminarCategoria(1);

      expect(resultado).toEqual({
        eliminado: false,
        mensaje: "La categoria tiene productos y fue marcado como Inactivo",
      });

      expect(cambiarEstadoCategoriaMock).toHaveBeenCalledWith(1, "Inactivo");

      expect(eliminarCategoriaMock).not.toHaveBeenCalled();
    });

    it("debe eliminar si no tiene productos", async () => {
      obtenerCategoriaIdMock.mockResolvedValue({
        id: 1,
        nombre: "Bebidas",
        estado: "Activo",
      });

      categoriaTieneProductoMock.mockResolvedValue(false);
      eliminarCategoriaMock.mockResolvedValue({
        affectedRows: 1,
      });

      const resultado = await eliminarCategoria(1);

      expect(resultado).toEqual({
        eliminado: true,
        mensaje: "La categoria fue eliminada correctamente.",
      });

      expect(eliminarCategoriaMock).toHaveBeenCalledWith(1);
      expect(cambiarEstadoCategoriaMock).not.toHaveBeenCalled();
    });
  });
});
