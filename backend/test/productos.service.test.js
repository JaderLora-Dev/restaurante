import { describe, it, expect, vi, beforeEach } from "vitest";

const {
  obtenerProductosMock,
  obtenerProductosDisponibleMock,
  obtenerProductoIdMock,
  obtenerPorNombreMock,
  crearProductoMock,
  actualizarProductoMock,
  cambiarEstadoProductoMock,
  productoTienePedidoMock,
  eliminarProductoMock,
  obtenerCategoriaIdMock,
  getConnectionMock,
  subirImagenMock,
  eliminarImagenMock,
} = vi.hoisted(() => ({
  obtenerProductosMock: vi.fn(),
  obtenerProductosDisponibleMock: vi.fn(),
  obtenerProductoIdMock: vi.fn(),
  obtenerPorNombreMock: vi.fn(),
  crearProductoMock: vi.fn(),
  actualizarProductoMock: vi.fn(),
  cambiarEstadoProductoMock: vi.fn(),
  productoTienePedidoMock: vi.fn(),
  eliminarProductoMock: vi.fn(),
  obtenerCategoriaIdMock: vi.fn(),
  getConnectionMock: vi.fn(),
  subirImagenMock: vi.fn(),
  eliminarImagenMock: vi.fn(),
}));

vi.mock("../src/models/producto.model.js", () => ({
  obtenerProductos: obtenerProductosMock,
  obtenerProductosDisponible: obtenerProductosDisponibleMock,
  obtenerProductoId: obtenerProductoIdMock,
  obtenerPorNombre: obtenerPorNombreMock,
  crearProducto: crearProductoMock,
  actualizarProducto: actualizarProductoMock,
  cambiarEstadoProducto: cambiarEstadoProductoMock,
  productoTienePedido: productoTienePedidoMock,
  eliminarProducto: eliminarProductoMock,
}));

vi.mock("../src/models/categorias.model.js", () => ({
  obtenerCategoriaId: obtenerCategoriaIdMock,
}));

vi.mock("../src/config/db.js", () => ({
  connection: {
    getConnection: getConnectionMock,
  },
}));

vi.mock("../src/services/imagen.service.js", () => ({
  subirImagen: subirImagenMock,
  eliminarImagen: eliminarImagenMock,
}));

import {
  obtenerProductos,
  mostrarProductosDisponible,
  obtenerProductoId,
  crearProducto,
  editarProducto,
  actualizarEstadoProducto,
  borrarProducto,
} from "../src/services/productos.service.js";

describe("productos.service", () => {
  let conn;

  beforeEach(() => {
    vi.clearAllMocks();

    conn = {
      beginTransaction: vi.fn(),
      commit: vi.fn(),
      rollback: vi.fn(),
      release: vi.fn(),
    };

    getConnectionMock.mockResolvedValue(conn);
  });

  describe("obtenerProductos", () => {
    it("debe devolver los productos con la información de paginación", async () => {
      const productos = [
        {
          idProductos: 1,
          nombre: "Hamburguesa",
        },
        {
          idProductos: 2,
          nombre: "Pizza",
        },
      ];

      obtenerProductosMock.mockResolvedValue({
        productos,
        total: 12,
      });

      const resultado = await obtenerProductos(
        "ham",
        1,
        5,
        2,
        "Disponible",
        "ASC",
      );

      expect(resultado).toEqual({
        productos,
        total: 12,
        page: 1,
        limit: 5,
        totalPages: 3,
      });

      expect(obtenerProductosMock).toHaveBeenCalledWith(
        "ham",
        1,
        5,
        2,
        "Disponible",
        "ASC",
      );
    });

    it("debe calcular correctamente las páginas cuando el total no es múltiplo del límite", async () => {
      obtenerProductosMock.mockResolvedValue({
        productos: [],
        total: 11,
      });

      const resultado = await obtenerProductos("", 2, 5, "", "", "ASC");

      expect(resultado.totalPages).toBe(3);
    });
  });

  describe("mostrarProductosDisponible", () => {
    it("debe devolver solamente la información de productos disponibles con paginación", async () => {
      const productos = [
        {
          idProductos: 1,
          nombre: "Pizza",
          estado: "Disponible",
        },
      ];

      obtenerProductosDisponibleMock.mockResolvedValue({
        productos,
        total: 6,
      });

      const resultado = await mostrarProductosDisponible("pizza", 1, 2, 1);

      expect(resultado).toEqual({
        productos,
        total: 6,
        page: 1,
        limit: 2,
        totalPages: 3,
      });

      expect(obtenerProductosDisponibleMock).toHaveBeenCalledWith(
        "pizza",
        1,
        2,
        1,
      );
    });
  });

  describe("obtenerProductoId", () => {
    it("debe devolver el producto cuando existe", async () => {
      const producto = {
        idProductos: 1,
        nombre: "Pizza",
      };

      obtenerProductoIdMock.mockResolvedValue(producto);

      const resultado = await obtenerProductoId(1);

      expect(resultado).toEqual(producto);
      expect(obtenerProductoIdMock).toHaveBeenCalledWith(1);
    });

    it("debe lanzar error si el producto no existe", async () => {
      obtenerProductoIdMock.mockResolvedValue(null);

      await expect(obtenerProductoId(99)).rejects.toMatchObject({
        message: "Producto no encontrado",
        statusCode: 404,
      });
    });
  });

  describe("crearProducto", () => {
    const productoBase = () => ({
      nombre: "Pizza",
      precio: "25000",
      stock: 10,
      estado: "Disponible",
      detalle: "Pizza de pollo",
      categorias_id: 1,
    });

    const archivo = {
      buffer: Buffer.from("imagen"),
    };

    beforeEach(() => {
      obtenerPorNombreMock.mockResolvedValue(null);

      obtenerCategoriaIdMock.mockResolvedValue({
        id: 1,
        nombre: "Comidas",
      });

      subirImagenMock.mockResolvedValue({
        secure_url: "https://cloudinary.com/pizza.jpg",
        public_id: "restaurante/productos/pizza",
      });

      crearProductoMock.mockResolvedValue({
        idProductos: 1,
        nombre: "Pizza",
      });
    });

    it("debe rechazar un nombre duplicado", async () => {
      obtenerPorNombreMock.mockResolvedValue({
        idProductos: 5,
        nombre: "Pizza",
      });

      await expect(
        crearProducto(productoBase(), archivo),
      ).rejects.toMatchObject({
        message: "El nombre ya existe",
        statusCode: 400,
      });

      expect(conn.rollback).toHaveBeenCalled();
      expect(crearProductoMock).not.toHaveBeenCalled();
      expect(subirImagenMock).not.toHaveBeenCalled();
    });

    it("debe rechazar un precio que no sea válido", async () => {
      const producto = {
        ...productoBase(),
        precio: "abc",
      };

      await expect(crearProducto(producto, archivo)).rejects.toMatchObject({
        message: "El precio debe ser un número válido.",
        statusCode: 400,
      });

      expect(crearProductoMock).not.toHaveBeenCalled();
    });

    it("debe rechazar un precio menor o igual a cero", async () => {
      const producto = {
        ...productoBase(),
        precio: 0,
      };

      await expect(crearProducto(producto, archivo)).rejects.toMatchObject({
        message: "El precio debe ser mayor que 0",
        statusCode: 400,
      });
    });

    it("debe rechazar un precio superior al límite", async () => {
      const producto = {
        ...productoBase(),
        precio: 1000001,
      };

      await expect(crearProducto(producto, archivo)).rejects.toMatchObject({
        message: "El precio es demasiado alto.",
        statusCode: 400,
      });
    });

    it("debe cambiar el estado a Inactivo cuando el stock es cero", async () => {
      const producto = {
        ...productoBase(),
        stock: 0,
      };

      const resultadoEsperado = {
        idProductos: 1,
        nombre: "Pizza",
        estado: "Inactivo",
      };

      crearProductoMock.mockResolvedValue(resultadoEsperado);

      const resultado = await crearProducto(producto, archivo);

      expect(producto.estado).toBe("Inactivo");

      expect(crearProductoMock).toHaveBeenCalledWith(
        expect.objectContaining({
          estado: "Inactivo",
        }),
        conn,
      );

      expect(resultado).toEqual(resultadoEsperado);
    });

    it("debe rechazar un estado inválido", async () => {
      const producto = {
        ...productoBase(),
        estado: "Reservado",
      };

      await expect(crearProducto(producto, archivo)).rejects.toMatchObject({
        message: "El estado debe ser Disponible, Inactivo, o Agotado",
        statusCode: 400,
      });

      expect(crearProductoMock).not.toHaveBeenCalled();
    });

    it("debe rechazar un detalle superior a 500 caracteres", async () => {
      const producto = {
        ...productoBase(),
        detalle: "A".repeat(501),
      };

      await expect(crearProducto(producto, archivo)).rejects.toMatchObject({
        message: "EL detalle no debe superar los 500 caracteres.",
        statusCode: 400,
      });

      expect(crearProductoMock).not.toHaveBeenCalled();
    });

    it("debe rechazar una categoría inexistente", async () => {
      obtenerCategoriaIdMock.mockResolvedValue(null);

      await expect(
        crearProducto(productoBase(), archivo),
      ).rejects.toMatchObject({
        message: "La categoría no existe",
        statusCode: 404,
      });

      expect(crearProductoMock).not.toHaveBeenCalled();
      expect(subirImagenMock).not.toHaveBeenCalled();
    });

    it("debe rechazar la creación sin imagen", async () => {
      await expect(crearProducto(productoBase(), null)).rejects.toMatchObject({
        message: "Debes subir una imagen del producto.",
        statusCode: 400,
      });

      expect(crearProductoMock).not.toHaveBeenCalled();
      expect(subirImagenMock).not.toHaveBeenCalled();
    });

    it("debe subir la imagen y crear el producto correctamente", async () => {
      const producto = productoBase();

      const resultadoEsperado = {
        idProductos: 1,
        nombre: "Pizza",
      };

      crearProductoMock.mockResolvedValue(resultadoEsperado);

      const resultado = await crearProducto(producto, archivo);

      expect(subirImagenMock).toHaveBeenCalledWith(archivo.buffer);

      expect(crearProductoMock).toHaveBeenCalledWith(
        expect.objectContaining({
          imagen_url: "https://cloudinary.com/pizza.jpg",
          imagen_public_id: "restaurante/productos/pizza",
        }),
        conn,
      );

      expect(conn.beginTransaction).toHaveBeenCalled();
      expect(conn.commit).toHaveBeenCalled();
      expect(conn.release).toHaveBeenCalled();

      expect(resultado).toEqual(resultadoEsperado);
    });

    it("debe eliminar la imagen si ocurre un error después de subirla", async () => {
      crearProductoMock.mockRejectedValue(new Error("Error de base de datos"));

      await expect(crearProducto(productoBase(), archivo)).rejects.toThrow(
        "Error de base de datos",
      );

      expect(conn.rollback).toHaveBeenCalled();

      expect(eliminarImagenMock).toHaveBeenCalledWith(
        "restaurante/productos/pizza",
      );

      expect(conn.release).toHaveBeenCalled();
    });
  });

  describe("editarProducto", () => {
    const productoExistente = {
      idProductos: 1,
      nombre: "Pizza",
      precio: 20000,
      stock: 10,
      estado: "Disponible",
      categorias_id: 1,
      imagen_url: "https://cloudinary.com/anterior.jpg",
      imagen_public_id: "restaurante/productos/anterior",
    };

    const productoEditado = () => ({
      nombre: "Pizza Especial",
      precio: "25000",
      stock: 8,
      estado: "Disponible",
      categorias_id: 1,
    });

    beforeEach(() => {
      obtenerProductoIdMock.mockResolvedValue(productoExistente);

      obtenerPorNombreMock.mockResolvedValue(null);

      obtenerCategoriaIdMock.mockResolvedValue({
        id: 1,
        nombre: "Comidas",
      });

      actualizarProductoMock.mockResolvedValue({
        idProductos: 1,
        nombre: "Pizza Especial",
      });
    });

    it("debe rechazar si el producto no existe", async () => {
      obtenerProductoIdMock.mockResolvedValue(null);

      await expect(
        editarProducto(99, productoEditado(), null),
      ).rejects.toMatchObject({
        message: "Producto no encontrado",
        statusCode: 404,
      });

      expect(conn.rollback).toHaveBeenCalled();
      expect(actualizarProductoMock).not.toHaveBeenCalled();
    });

    it("debe rechazar un nombre duplicado", async () => {
      obtenerPorNombreMock.mockResolvedValue({
        idProductos: 2,
        nombre: "Pizza Especial",
      });

      await expect(
        editarProducto(1, productoEditado(), null),
      ).rejects.toMatchObject({
        message: "El nombre ya existe",
        statusCode: 400,
      });

      expect(actualizarProductoMock).not.toHaveBeenCalled();
    });

    it("debe rechazar un precio inválido", async () => {
      const producto = {
        ...productoEditado(),
        precio: "abc",
      };

      await expect(editarProducto(1, producto, null)).rejects.toMatchObject({
        message: "El precio debe ser un número válido.",
        statusCode: 400,
      });
    });

    it("debe rechazar un precio menor o igual a cero", async () => {
      const producto = {
        ...productoEditado(),
        precio: 0,
      };

      await expect(editarProducto(1, producto, null)).rejects.toMatchObject({
        message: "El precio debe ser mayor que 0",
        statusCode: 400,
      });
    });

    it("debe rechazar un precio superior al límite", async () => {
      const producto = {
        ...productoEditado(),
        precio: 1000001,
      };

      await expect(editarProducto(1, producto, null)).rejects.toMatchObject({
        message: "El precio es demasiado alto.",
        statusCode: 400,
      });
    });

    it("debe rechazar stock negativo", async () => {
      const producto = {
        ...productoEditado(),
        stock: -1,
      };

      await expect(editarProducto(1, producto, null)).rejects.toMatchObject({
        message: "El stock no puede ser negativo.",
        statusCode: 400,
      });
    });

    it("debe cambiar a Inactivo cuando el stock queda en cero", async () => {
      const producto = {
        ...productoEditado(),
        stock: 0,
      };

      const resultado = await editarProducto(1, producto, null);

      expect(producto.estado).toBe("Inactivo");

      expect(actualizarProductoMock).toHaveBeenCalledWith(
        1,
        expect.objectContaining({
          estado: "Inactivo",
        }),
        conn,
      );

      expect(resultado).toEqual({
        idProductos: 1,
        nombre: "Pizza Especial",
      });
    });

    it("debe rechazar un estado inválido", async () => {
      const producto = {
        ...productoEditado(),
        estado: "Reservado",
      };

      await expect(editarProducto(1, producto, null)).rejects.toMatchObject({
        message: "El estado debe ser Disponible, Agotado o Inactivo.",
        statusCode: 400,
      });
    });

    it("debe rechazar una categoría inexistente", async () => {
      obtenerCategoriaIdMock.mockResolvedValue(null);

      await expect(
        editarProducto(1, productoEditado(), null),
      ).rejects.toMatchObject({
        message: "La categoría no existe",
        statusCode: 404,
      });

      expect(actualizarProductoMock).not.toHaveBeenCalled();
    });

    it("debe conservar la imagen anterior si no se proporciona una nueva", async () => {
      const producto = productoEditado();

      await editarProducto(1, producto, null);

      expect(producto.imagen_url).toBe("https://cloudinary.com/anterior.jpg");

      expect(producto.imagen_public_id).toBe("restaurante/productos/anterior");

      expect(subirImagenMock).not.toHaveBeenCalled();
    });

    it("debe subir una nueva imagen y eliminar la anterior después del commit", async () => {
      subirImagenMock.mockResolvedValue({
        secure_url: "https://cloudinary.com/nueva.jpg",
        public_id: "restaurante/productos/nueva",
      });

      const producto = productoEditado();

      await editarProducto(1, producto, {
        buffer: Buffer.from("nueva"),
      });

      expect(subirImagenMock).toHaveBeenCalledWith(expect.any(Buffer));

      expect(actualizarProductoMock).toHaveBeenCalledWith(
        1,
        expect.objectContaining({
          imagen_url: "https://cloudinary.com/nueva.jpg",
          imagen_public_id: "restaurante/productos/nueva",
        }),
        conn,
      );

      expect(conn.commit).toHaveBeenCalled();

      expect(eliminarImagenMock).toHaveBeenCalledWith(
        "restaurante/productos/anterior",
      );
    });

    it("debe eliminar la nueva imagen si falla la actualización", async () => {
      subirImagenMock.mockResolvedValue({
        secure_url: "https://cloudinary.com/nueva.jpg",
        public_id: "restaurante/productos/nueva",
      });

      actualizarProductoMock.mockRejectedValue(
        new Error("Error al actualizar"),
      );

      await expect(
        editarProducto(1, productoEditado(), {
          buffer: Buffer.from("nueva"),
        }),
      ).rejects.toThrow("Error al actualizar");

      expect(conn.rollback).toHaveBeenCalled();

      expect(eliminarImagenMock).toHaveBeenCalledWith(
        "restaurante/productos/nueva",
      );
    });
  });

  describe("actualizarEstadoProducto", () => {
    it("debe rechazar si el producto no existe", async () => {
      obtenerProductoIdMock.mockResolvedValue(null);

      await expect(
        actualizarEstadoProducto(99, "Disponible"),
      ).rejects.toMatchObject({
        message: "Producto no encontrado",
        statusCode: 404,
      });

      expect(cambiarEstadoProductoMock).not.toHaveBeenCalled();
    });

    it("debe rechazar un estado inválido", async () => {
      obtenerProductoIdMock.mockResolvedValue({
        idProductos: 1,
        stock: 10,
      });

      await expect(
        actualizarEstadoProducto(1, "Reservado"),
      ).rejects.toMatchObject({
        message: "El estado debe ser Disponible, Agotado y Inactivo.",
        statusCode: 400,
      });
    });

    it("debe impedir Disponible cuando el stock es cero", async () => {
      obtenerProductoIdMock.mockResolvedValue({
        idProductos: 1,
        stock: 0,
      });

      await expect(
        actualizarEstadoProducto(1, "Disponible"),
      ).rejects.toMatchObject({
        message: "No puedes marcar como Disponible un producto sin stock.",
        statusCode: 400,
      });

      expect(cambiarEstadoProductoMock).not.toHaveBeenCalled();
    });

    it("debe cambiar el estado correctamente", async () => {
      obtenerProductoIdMock.mockResolvedValue({
        idProductos: 1,
        stock: 10,
      });

      cambiarEstadoProductoMock.mockResolvedValue({
        mensaje: "Estado actualizado",
      });

      const resultado = await actualizarEstadoProducto(1, "Agotado");

      expect(resultado).toEqual({
        mensaje: "Estado actualizado",
      });

      expect(cambiarEstadoProductoMock).toHaveBeenCalledWith(1, "Agotado");
    });
  });

  describe("borrarProducto", () => {
    const producto = {
      idProductos: 1,
      nombre: "Pizza",
      imagen_public_id: "restaurante/productos/pizza",
    };

    it("debe rechazar si el producto no existe", async () => {
      obtenerProductoIdMock.mockResolvedValue(null);

      await expect(borrarProducto(99)).rejects.toMatchObject({
        message: "Producto no encontrado",
        statusCode: 404,
      });

      expect(conn.rollback).toHaveBeenCalled();
      expect(productoTienePedidoMock).not.toHaveBeenCalled();
    });

    it("debe marcar como Inactivo si el producto tiene pedidos", async () => {
      obtenerProductoIdMock.mockResolvedValue(producto);

      productoTienePedidoMock.mockResolvedValue(true);

      cambiarEstadoProductoMock.mockResolvedValue({
        affectedRows: 1,
      });

      const resultado = await borrarProducto(1);

      expect(cambiarEstadoProductoMock).toHaveBeenCalledWith(
        1,
        "Inactivo",
        conn,
      );

      expect(conn.commit).toHaveBeenCalled();

      expect(resultado).toEqual({
        eliminado: false,
        mensaje: "El producto tiene pedidos y fue marcado como Inactivo.",
      });

      expect(eliminarProductoMock).not.toHaveBeenCalled();
      expect(eliminarImagenMock).not.toHaveBeenCalled();
    });

    it("debe eliminar el producto y su imagen si no tiene pedidos", async () => {
      obtenerProductoIdMock.mockResolvedValue(producto);

      productoTienePedidoMock.mockResolvedValue(false);

      eliminarProductoMock.mockResolvedValue({
        affectedRows: 1,
      });

      const resultado = await borrarProducto(1);

      expect(eliminarProductoMock).toHaveBeenCalledWith(1, conn);

      expect(conn.commit).toHaveBeenCalled();

      expect(eliminarImagenMock).toHaveBeenCalledWith(
        "restaurante/productos/pizza",
      );

      expect(resultado).toEqual({
        eliminado: true,
        mensaje: "Producto eliminado correctamente.",
      });
    });

    it("debe conservar el producto en la base de datos aunque falle la eliminación de la imagen", async () => {
      obtenerProductoIdMock.mockResolvedValue(producto);

      productoTienePedidoMock.mockResolvedValue(false);

      eliminarProductoMock.mockResolvedValue({
        affectedRows: 1,
      });

      eliminarImagenMock.mockRejectedValue(new Error("Error Cloudinary"));

      const resultado = await borrarProducto(1);

      expect(conn.commit).toHaveBeenCalled();

      expect(resultado).toEqual({
        eliminado: true,
        mensaje: "Producto eliminado correctamente.",
      });
    });
  });
});
