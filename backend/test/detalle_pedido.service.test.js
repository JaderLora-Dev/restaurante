import { describe, it, expect, vi, beforeEach } from "vitest";

const {
  obtenerDetallePedidoMock,
  obtenerDetallePedidoIdMock,
  obtenerDetallePedidoPorPedidoMock,
  existeProductoEnPedidoMock,
  actualizarDetallePedidoMock,
  crearDetallePedidoMock,
  eliminarDetallePedidoMock,
  calcularTotalPedidoMock,
  actualizarTotalPedidoMock,

  obtenerPedidoIdMock,
  obtenerPedidoActivoMesaMock,
  crearPedidoMock,

  obtenerProductoIdMock,
  restarStockMock,
  sumarStockMock,
  cambiarEstadoProductoMock,

  ocuparMesaMock,

  getConnectionMock,
} = vi.hoisted(() => ({
  obtenerDetallePedidoMock: vi.fn(),
  obtenerDetallePedidoIdMock: vi.fn(),
  obtenerDetallePedidoPorPedidoMock: vi.fn(),
  existeProductoEnPedidoMock: vi.fn(),
  actualizarDetallePedidoMock: vi.fn(),
  crearDetallePedidoMock: vi.fn(),
  eliminarDetallePedidoMock: vi.fn(),
  calcularTotalPedidoMock: vi.fn(),
  actualizarTotalPedidoMock: vi.fn(),

  obtenerPedidoIdMock: vi.fn(),
  obtenerPedidoActivoMesaMock: vi.fn(),
  crearPedidoMock: vi.fn(),

  obtenerProductoIdMock: vi.fn(),
  restarStockMock: vi.fn(),
  sumarStockMock: vi.fn(),
  cambiarEstadoProductoMock: vi.fn(),

  ocuparMesaMock: vi.fn(),

  getConnectionMock: vi.fn(),
}));

vi.mock("../src/models/detalle_pedido.model.js", () => ({
  obtenerDetallePedido: obtenerDetallePedidoMock,
  obtenerDetallePedidoId: obtenerDetallePedidoIdMock,
  obtenerDetallePedidoPorPedido: obtenerDetallePedidoPorPedidoMock,
  existeProductoEnPedido: existeProductoEnPedidoMock,
  actualizarDetallePedido: actualizarDetallePedidoMock,
  crearDetallePedido: crearDetallePedidoMock,
  eliminarDetallePedido: eliminarDetallePedidoMock,
  calcularTotalPedido: calcularTotalPedidoMock,
  actualizarTotalPedido: actualizarTotalPedidoMock,
}));

vi.mock("../src/models/pedido.model.js", () => ({
  obtenerPedidoId: obtenerPedidoIdMock,
  obtenerPedidoActivoMesa: obtenerPedidoActivoMesaMock,
  crearPedido: crearPedidoMock,
}));

vi.mock("../src/models/producto.model.js", () => ({
  obtenerProductoId: obtenerProductoIdMock,
  restarStock: restarStockMock,
  sumarStock: sumarStockMock,
  cambiarEstadoProducto: cambiarEstadoProductoMock,
}));

vi.mock("../src/models/mesa.model.js", () => ({
  ocuparMesa: ocuparMesaMock,
}));

vi.mock("../src/config/db.js", () => ({
  connection: {
    getConnection: getConnectionMock,
  },
}));

import {
  obtenerDetallePedido,
  mostrarDetallePedidoId,
  obtenerDetallePedidoPorPedido,
  crearDetallePedido,
  actualizarDetallePedido,
  eliminarDetallePedido,
} from "../src/services/detallePedido.service.js";

describe("detallePedido.service", () => {
  let conn;

  beforeEach(() => {
    vi.resetAllMocks();

    conn = {
      beginTransaction: vi.fn(),
      commit: vi.fn(),
      rollback: vi.fn(),
      release: vi.fn(),
    };

    getConnectionMock.mockResolvedValue(conn);
  });

  describe("obtenerDetallePedido", () => {
    it("debe devolver los detalles obtenidos del modelo", async () => {
      const detalles = [
        {
          idDetalle_pedido: 1,
          idPedidos: 10,
          idProductos: 5,
          cantidad: 2,
        },
      ];

      obtenerDetallePedidoMock.mockResolvedValue(detalles);

      const resultado = await obtenerDetallePedido(4);

      expect(resultado).toEqual(detalles);

      expect(obtenerDetallePedidoMock).toHaveBeenCalledWith(4);
    });
  });

  describe("mostrarDetallePedidoId", () => {
    it("debe devolver el detalle cuando existe", async () => {
      const detalle = {
        idDetalle_pedido: 1,
        idPedidos: 10,
        cantidad: 2,
      };

      obtenerDetallePedidoIdMock.mockResolvedValue(detalle);

      const resultado = await mostrarDetallePedidoId(1);

      expect(resultado).toEqual(detalle);
      expect(obtenerDetallePedidoIdMock).toHaveBeenCalledWith(1);
    });

    it("debe lanzar error si el detalle no existe", async () => {
      obtenerDetallePedidoIdMock.mockResolvedValue(null);

      await expect(mostrarDetallePedidoId(99)).rejects.toMatchObject({
        message: "El detalle no existe.",
        statusCode: 404,
      });
    });
  });

  describe("obtenerDetallePedidoPorPedido", () => {
    it("debe rechazar si el pedido no existe", async () => {
      obtenerPedidoIdMock.mockResolvedValue(null);

      await expect(
        obtenerDetallePedidoPorPedido(99, 4, "mesero"),
      ).rejects.toMatchObject({
        message: "El pedido no existe.",
        statusCode: 404,
      });

      expect(obtenerDetallePedidoPorPedidoMock).not.toHaveBeenCalled();
    });

    it("debe rechazar si el usuario no pertenece al pedido", async () => {
      obtenerPedidoIdMock.mockResolvedValue({
        idPedidos: 10,
        idUsuarios: 8,
      });

      await expect(
        obtenerDetallePedidoPorPedido(10, 4, "mesero"),
      ).rejects.toMatchObject({
        message: "No tienes permiso para consultar este detalle.",
        statusCode: 403,
      });

      expect(obtenerDetallePedidoPorPedidoMock).not.toHaveBeenCalled();
    });

    it("debe permitir al administrador consultar cualquier pedido", async () => {
      const detalles = [
        {
          idDetalle_pedido: 1,
          idPedidos: 10,
          cantidad: 2,
        },
      ];

      obtenerPedidoIdMock.mockResolvedValue({
        idPedidos: 10,
        idUsuarios: 8,
      });

      obtenerDetallePedidoPorPedidoMock.mockResolvedValue(detalles);

      const resultado = await obtenerDetallePedidoPorPedido(10, 4, "admin");

      expect(resultado).toEqual(detalles);
    });

    it("debe rechazar si no existen detalles para el pedido", async () => {
      obtenerPedidoIdMock.mockResolvedValue({
        idPedidos: 10,
        idUsuarios: 4,
      });

      obtenerDetallePedidoPorPedidoMock.mockResolvedValue(null);

      await expect(
        obtenerDetallePedidoPorPedido(10, 4, "mesero"),
      ).rejects.toMatchObject({
        message: "El detalle del pedido no existe.",
        statusCode: 404,
      });
    });

    it("debe devolver los detalles cuando el usuario tiene permiso", async () => {
      const detalles = [
        {
          idDetalle_pedido: 1,
          idPedidos: 10,
          cantidad: 2,
        },
      ];

      obtenerPedidoIdMock.mockResolvedValue({
        idPedidos: 10,
        idUsuarios: 4,
      });

      obtenerDetallePedidoPorPedidoMock.mockResolvedValue(detalles);

      const resultado = await obtenerDetallePedidoPorPedido(10, 4, "mesero");

      expect(resultado).toEqual(detalles);

      expect(obtenerDetallePedidoPorPedidoMock).toHaveBeenCalledWith(10);
    });
  });

  describe("crearDetallePedido", () => {
    const detalleBase = () => ({
      idMesas: 2,
      idProductos: 5,
      cantidad: 2,
      observaciones: "Sin cebolla",
    });

    const productoBase = () => ({
      idProductos: 5,
      nombre: "Hamburguesa",
      precio: 20000,
      stock: 10,
      estado: "Disponible",
    });

    beforeEach(() => {
      obtenerPedidoActivoMesaMock.mockResolvedValue({
        idPedidos: 10,
        idMesas: 2,
        idUsuarios: 4,
        estado: "Activo",
      });

      obtenerProductoIdMock.mockResolvedValue(productoBase());

      existeProductoEnPedidoMock.mockResolvedValue(null);

      crearDetallePedidoMock.mockResolvedValue({
        idDetalle_pedido: 20,
        idProductos: 5,
        cantidad: 2,
        subtotal: 40000,
      });

      restarStockMock.mockResolvedValue({});
      obtenerDetallePedidoIdMock.mockResolvedValue(null);

      calcularTotalPedidoMock.mockResolvedValue(40000);
      actualizarTotalPedidoMock.mockResolvedValue({});
      cambiarEstadoProductoMock.mockResolvedValue({});
    });

    it("debe rechazar si el pedido pertenece a otro usuario", async () => {
      obtenerPedidoActivoMesaMock.mockResolvedValue({
        idPedidos: 10,
        idMesas: 2,
        idUsuarios: 8,
        estado: "Activo",
      });

      await expect(crearDetallePedido(detalleBase(), 4)).rejects.toMatchObject({
        message: "No tienes permiso para modificar este pedido.",
        statusCode: 403,
      });

      expect(conn.rollback).toHaveBeenCalled();
      expect(crearDetallePedidoMock).not.toHaveBeenCalled();
    });

    it("debe rechazar si el pedido no está activo", async () => {
      obtenerPedidoActivoMesaMock.mockResolvedValue({
        idPedidos: 10,
        idMesas: 2,
        idUsuarios: 4,
        estado: "Cerrado",
      });

      await expect(crearDetallePedido(detalleBase(), 4)).rejects.toMatchObject({
        message: "Solo se puede agregar productos a pedidos activos.",
        statusCode: 400,
      });
    });

    it("debe crear un nuevo pedido cuando no existe uno activo en la mesa", async () => {
      obtenerPedidoActivoMesaMock.mockResolvedValue(null);

      crearPedidoMock.mockResolvedValue({
        idPedidos: 15,
        idMesas: 2,
        idUsuarios: 4,
        estado: "Activo",
        total: 0,
      });

      const resultado = await crearDetallePedido(detalleBase(), 4);

      expect(crearPedidoMock).toHaveBeenCalledWith(conn, {
        idMesas: 2,
        idUsuarios: 4,
        estado: "Activo",
        total: 0,
      });

      expect(ocuparMesaMock).toHaveBeenCalledWith(conn, 2);

      expect(resultado.idPedidos).toBe(15);
    });

    it("debe rechazar si el producto no existe", async () => {
      obtenerProductoIdMock.mockResolvedValue(null);

      await expect(crearDetallePedido(detalleBase(), 4)).rejects.toMatchObject({
        message: "El producto no existe.",
        statusCode: 404,
      });

      expect(conn.rollback).toHaveBeenCalled();
    });

    it("debe rechazar si el producto no está disponible", async () => {
      obtenerProductoIdMock.mockResolvedValue({
        ...productoBase(),
        estado: "Agotado",
      });

      await expect(crearDetallePedido(detalleBase(), 4)).rejects.toMatchObject({
        message: "El producto no esta disponible.",
        statusCode: 400,
      });
    });

    it("debe rechazar una cantidad no entera", async () => {
      await expect(
        crearDetallePedido(
          {
            ...detalleBase(),
            cantidad: 1.5,
          },
          4,
        ),
      ).rejects.toMatchObject({
        message: "La cantidad debe ser mayor que cero.",
        statusCode: 400,
      });
    });

    it("debe rechazar una cantidad menor o igual a cero", async () => {
      await expect(
        crearDetallePedido(
          {
            ...detalleBase(),
            cantidad: 0,
          },
          4,
        ),
      ).rejects.toMatchObject({
        message: "La cantidad debe ser mayor que cero.",
        statusCode: 400,
      });
    });

    it("debe rechazar cuando no hay stock suficiente", async () => {
      obtenerProductoIdMock.mockResolvedValue({
        ...productoBase(),
        stock: 1,
      });

      await expect(
        crearDetallePedido(
          {
            ...detalleBase(),
            cantidad: 2,
          },
          4,
        ),
      ).rejects.toMatchObject({
        message: "Stock insuficiente.",
        statusCode: 400,
      });
    });

    it("debe rechazar observaciones que no sean texto", async () => {
      await expect(
        crearDetallePedido(
          {
            ...detalleBase(),
            observaciones: 123,
          },
          4,
        ),
      ).rejects.toMatchObject({
        message: "Las observaciones deben ser texto.",
        statusCode: 400,
      });
    });

    it("debe rechazar observaciones mayores a 255 caracteres", async () => {
      await expect(
        crearDetallePedido(
          {
            ...detalleBase(),
            observaciones: "A".repeat(256),
          },
          4,
        ),
      ).rejects.toMatchObject({
        message: "Las observaciones no pueden superar los 255 caracteres.",
        statusCode: 400,
      });
    });

    it("debe crear el detalle cuando el producto todavía no está en el pedido", async () => {
      obtenerProductoIdMock.mockResolvedValueOnce(productoBase());

      existeProductoEnPedidoMock.mockResolvedValue(null);

      const resultado = await crearDetallePedido(detalleBase(), 4);

      expect(crearDetallePedidoMock).toHaveBeenCalledWith(conn, {
        idPedidos: 10,
        idProductos: 5,
        cantidad: 2,
        precioUnitario: 20000,
        subtotal: 40000,
        observaciones: "Sin cebolla",
      });

      expect(restarStockMock).toHaveBeenCalledWith(conn, 5, 2);

      expect(resultado).toEqual({
        idDetalle_pedido: 20,
        idProductos: 5,
        cantidad: 2,
        subtotal: 40000,
        idPedidos: 10,
      });

      expect(conn.commit).toHaveBeenCalled();
    });

    it("debe aumentar la cantidad si el producto ya existe en el pedido", async () => {
      obtenerProductoIdMock
        .mockResolvedValueOnce(productoBase())
        .mockResolvedValueOnce({
          ...productoBase(),
          stock: 7,
        });

      existeProductoEnPedidoMock.mockResolvedValue({
        idDetalle_pedido: 30,
        cantidad: 3,
      });

      actualizarDetallePedidoMock.mockResolvedValue({
        idDetalle_pedido: 30,
        cantidad: 5,
        subtotal: 100000,
      });

      const resultado = await crearDetallePedido(detalleBase(), 4);

      expect(actualizarDetallePedidoMock).toHaveBeenCalledWith(
        conn,
        30,
        5,
        100000,
        "Sin cebolla",
      );

      expect(crearDetallePedidoMock).not.toHaveBeenCalled();

      expect(resultado.idPedidos).toBe(10);
    });

    it("debe marcar el producto como Agotado cuando el stock queda en cero", async () => {
      obtenerProductoIdMock
        .mockResolvedValueOnce(productoBase())
        .mockResolvedValueOnce({
          ...productoBase(),
          stock: 0,
        });

      await crearDetallePedido(detalleBase(), 4);

      expect(cambiarEstadoProductoMock).toHaveBeenCalledWith(
        5,
        "Agotado",
        conn,
      );
    });

    it("debe mantener el producto Disponible cuando todavía tiene stock", async () => {
      obtenerProductoIdMock
        .mockResolvedValueOnce(productoBase())
        .mockResolvedValueOnce({
          ...productoBase(),
          stock: 8,
        });

      await crearDetallePedido(detalleBase(), 4);

      expect(cambiarEstadoProductoMock).toHaveBeenCalledWith(
        5,
        "Disponible",
        conn,
      );
    });

    it("debe actualizar el total del pedido y confirmar la transacción", async () => {
      await crearDetallePedido(detalleBase(), 4);

      expect(calcularTotalPedidoMock).toHaveBeenCalledWith(conn, 10);

      expect(actualizarTotalPedidoMock).toHaveBeenCalledWith(conn, 10, 40000);

      expect(conn.commit).toHaveBeenCalled();
      expect(conn.rollback).not.toHaveBeenCalled();
      expect(conn.release).toHaveBeenCalled();
    });

    it("debe hacer rollback cuando ocurre un error durante la transacción", async () => {
      restarStockMock.mockRejectedValue(new Error("Error de stock"));

      await expect(crearDetallePedido(detalleBase(), 4)).rejects.toThrow(
        "Error de stock",
      );

      expect(conn.rollback).toHaveBeenCalled();
      expect(conn.commit).not.toHaveBeenCalled();
      expect(conn.release).toHaveBeenCalled();
    });
  });

  describe("actualizarDetallePedido", () => {
    const detalleExistente = {
      idDetalle_pedido: 20,
      idPedidos: 10,
      idProductos: 5,
      cantidad: 3,
      observaciones: "Normal",
    };

    const pedido = {
      idPedidos: 10,
      idUsuarios: 4,
      estado: "Activo",
    };

    const producto = {
      idProductos: 5,
      precio: 20000,
      stock: 10,
      estado: "Disponible",
    };

    beforeEach(() => {
      obtenerDetallePedidoIdMock.mockResolvedValue(detalleExistente);

      obtenerPedidoIdMock.mockResolvedValue(pedido);

      obtenerProductoIdMock.mockResolvedValue(producto);

      actualizarDetallePedidoMock.mockResolvedValue({
        ...detalleExistente,
        cantidad: 5,
        subtotal: 100000,
      });

      calcularTotalPedidoMock.mockResolvedValue(100000);
      actualizarTotalPedidoMock.mockResolvedValue({});
      cambiarEstadoProductoMock.mockResolvedValue({});
    });

    it("debe rechazar si el detalle no existe", async () => {
      obtenerDetallePedidoIdMock.mockResolvedValue(null);

      await expect(
        actualizarDetallePedido(99, { cantidad: 5 }, 4),
      ).rejects.toMatchObject({
        message: "El detalle del pedido no existe.",
        statusCode: 404,
      });
    });

    it("debe rechazar si el pedido no existe", async () => {
      obtenerPedidoIdMock.mockResolvedValue(null);

      await expect(
        actualizarDetallePedido(20, { cantidad: 5 }, 4),
      ).rejects.toMatchObject({
        message: "El pedido no existe.",
        statusCode: 404,
      });
    });

    it("debe rechazar si el usuario no pertenece al pedido", async () => {
      await expect(
        actualizarDetallePedido(20, { cantidad: 5 }, 8),
      ).rejects.toMatchObject({
        message: "No tienes permiso para modificar este pedido.",
        statusCode: 403,
      });
    });

    it("debe rechazar si el pedido no está activo", async () => {
      obtenerPedidoIdMock.mockResolvedValue({
        ...pedido,
        estado: "Pagado",
      });

      await expect(
        actualizarDetallePedido(20, { cantidad: 5 }, 4),
      ).rejects.toMatchObject({
        message: "Solo se pueden modificar pedidos activos.",
        statusCode: 400,
      });
    });

    it("debe rechazar si el producto no existe", async () => {
      obtenerProductoIdMock.mockResolvedValue(null);

      await expect(
        actualizarDetallePedido(20, { cantidad: 5 }, 4),
      ).rejects.toMatchObject({
        message: "El producto no existe.",
        statusCode: 404,
      });
    });

    it("debe rechazar si el producto está inactivo", async () => {
      obtenerProductoIdMock.mockResolvedValue({
        ...producto,
        estado: "Inactivo",
      });

      await expect(
        actualizarDetallePedido(20, { cantidad: 5 }, 4),
      ).rejects.toMatchObject({
        message: "El producto está inactivo.",
        statusCode: 400,
      });
    });

    it("debe rechazar una cantidad inválida", async () => {
      await expect(
        actualizarDetallePedido(20, { cantidad: 0 }, 4),
      ).rejects.toMatchObject({
        message: "La cantidad debe ser un número entero mayor que cero.",
        statusCode: 400,
      });
    });

    it("debe rechazar observaciones que no sean texto", async () => {
      await expect(
        actualizarDetallePedido(
          20,
          {
            cantidad: 5,
            observaciones: 123,
          },
          4,
        ),
      ).rejects.toMatchObject({
        message: "Las observaciones deben ser texto.",
        statusCode: 400,
      });
    });

    it("debe rechazar observaciones mayores a 255 caracteres", async () => {
      await expect(
        actualizarDetallePedido(
          20,
          {
            cantidad: 5,
            observaciones: "A".repeat(256),
          },
          4,
        ),
      ).rejects.toMatchObject({
        message: "Las observaciones no pueden superar los 255 caracteres.",
        statusCode: 400,
      });
    });

    it("debe rechazar si no hay stock suficiente para aumentar la cantidad", async () => {
      obtenerProductoIdMock.mockResolvedValue({
        ...producto,
        stock: 1,
      });

      await expect(
        actualizarDetallePedido(20, { cantidad: 5 }, 4),
      ).rejects.toMatchObject({
        message: "Stock insuficiente.",
        statusCode: 400,
      });

      expect(restarStockMock).not.toHaveBeenCalled();
    });

    it("debe restar stock cuando aumenta la cantidad", async () => {
      await actualizarDetallePedido(20, { cantidad: 5 }, 4);

      expect(restarStockMock).toHaveBeenCalledWith(conn, 5, 2);

      expect(actualizarDetallePedidoMock).toHaveBeenCalledWith(
        conn,
        20,
        5,
        100000,
        "Normal",
      );
    });

    it("debe devolver stock cuando disminuye la cantidad", async () => {
      obtenerProductoIdMock
        .mockResolvedValueOnce(producto)
        .mockResolvedValueOnce({
          ...producto,
          stock: 12,
        });

      actualizarDetallePedidoMock.mockResolvedValue({
        ...detalleExistente,
        cantidad: 1,
        subtotal: 20000,
      });

      await actualizarDetallePedido(20, { cantidad: 1 }, 4);

      expect(sumarStockMock).toHaveBeenCalledWith(conn, 5, 2);

      expect(restarStockMock).not.toHaveBeenCalled();
    });

    it("debe conservar las observaciones si no se envían", async () => {
      await actualizarDetallePedido(20, { cantidad: 5 }, 4);

      expect(actualizarDetallePedidoMock).toHaveBeenCalledWith(
        conn,
        20,
        5,
        100000,
        "Normal",
      );
    });

    it("debe actualizar las observaciones cuando se envían", async () => {
      await actualizarDetallePedido(
        20,
        {
          cantidad: 5,
          observaciones: "Sin tomate",
        },
        4,
      );

      expect(actualizarDetallePedidoMock).toHaveBeenCalledWith(
        conn,
        20,
        5,
        100000,
        "Sin tomate",
      );
    });

    it("debe marcar el producto como Agotado cuando el stock queda en cero", async () => {
      obtenerProductoIdMock
        .mockResolvedValueOnce(producto)
        .mockResolvedValueOnce({
          ...producto,
          stock: 0,
        });

      await actualizarDetallePedido(20, { cantidad: 5 }, 4);

      expect(cambiarEstadoProductoMock).toHaveBeenCalledWith(
        5,
        "Agotado",
        conn,
      );
    });

    it("debe actualizar el total y confirmar la transacción", async () => {
      const resultado = await actualizarDetallePedido(20, { cantidad: 5 }, 4);

      expect(resultado).toEqual({
        ...detalleExistente,
        cantidad: 5,
        subtotal: 100000,
      });

      expect(calcularTotalPedidoMock).toHaveBeenCalledWith(conn, 10);

      expect(actualizarTotalPedidoMock).toHaveBeenCalledWith(conn, 10, 100000);

      expect(conn.commit).toHaveBeenCalled();
      expect(conn.rollback).not.toHaveBeenCalled();
      expect(conn.release).toHaveBeenCalled();
    });

    it("debe hacer rollback si ocurre un error durante la actualización", async () => {
      restarStockMock.mockRejectedValue(new Error("Error al modificar stock"));

      await expect(
        actualizarDetallePedido(20, { cantidad: 5 }, 4),
      ).rejects.toThrow("Error al modificar stock");

      expect(conn.rollback).toHaveBeenCalled();
      expect(conn.commit).not.toHaveBeenCalled();
      expect(conn.release).toHaveBeenCalled();
    });
  });

  describe("eliminarDetallePedido", () => {
    const detalle = {
      idDetalle_pedido: 20,
      idPedidos: 10,
      idProductos: 5,
      cantidad: 3,
    };

    const pedido = {
      idPedidos: 10,
      idUsuarios: 4,
      estado: "Activo",
    };

    const producto = {
      idProductos: 5,
      stock: 0,
      estado: "Agotado",
    };

    beforeEach(() => {
      obtenerDetallePedidoIdMock.mockResolvedValue(detalle);

      obtenerPedidoIdMock.mockResolvedValue(pedido);

      obtenerProductoIdMock.mockResolvedValue(producto);

      sumarStockMock.mockResolvedValue({});
      cambiarEstadoProductoMock.mockResolvedValue({});
      eliminarDetallePedidoMock.mockResolvedValue({});
      calcularTotalPedidoMock.mockResolvedValue(40000);
      actualizarTotalPedidoMock.mockResolvedValue({});
    });

    it("debe rechazar si el detalle no existe", async () => {
      obtenerDetallePedidoIdMock.mockResolvedValue(null);

      await expect(
        eliminarDetallePedido(99, 4, "mesero"),
      ).rejects.toMatchObject({
        message: "El detalle del pedido no existe.",
        statusCode: 404,
      });
    });

    it("debe rechazar si el pedido no existe", async () => {
      obtenerPedidoIdMock.mockResolvedValue(null);

      await expect(
        eliminarDetallePedido(20, 4, "mesero"),
      ).rejects.toMatchObject({
        message: "El pedido no existe.",
        statusCode: 404,
      });
    });

    it("debe rechazar si el mesero no pertenece al pedido", async () => {
      await expect(
        eliminarDetallePedido(20, 8, "mesero"),
      ).rejects.toMatchObject({
        message: "No tienes permiso para eliminar este producto.",
        statusCode: 403,
      });
    });

    it("debe permitir al administrador eliminar un detalle de otro usuario", async () => {
      const resultado = await eliminarDetallePedido(20, 8, "admin");

      expect(resultado).toBe(true);

      expect(eliminarDetallePedidoMock).toHaveBeenCalledWith(conn, 20);
    });

    it("debe rechazar si el pedido no está activo", async () => {
      obtenerPedidoIdMock.mockResolvedValue({
        ...pedido,
        estado: "Pagado",
      });

      await expect(
        eliminarDetallePedido(20, 4, "mesero"),
      ).rejects.toMatchObject({
        message: "Solo se pueden modificar pedidos activos.",
        statusCode: 400,
      });
    });

    it("debe rechazar si el producto no existe", async () => {
      obtenerProductoIdMock.mockResolvedValue(null);

      await expect(
        eliminarDetallePedido(20, 4, "mesero"),
      ).rejects.toMatchObject({
        message: "El producto no existe.",
        statusCode: 404,
      });
    });

    it("debe marcar el producto como Disponible si vuelve a tener stock", async () => {
      obtenerProductoIdMock
        .mockResolvedValueOnce(producto)
        .mockResolvedValueOnce({
          ...producto,
          stock: 3,
        });

      await eliminarDetallePedido(20, 4, "mesero");

      expect(cambiarEstadoProductoMock).toHaveBeenCalledWith(
        5,
        "Disponible",
        conn,
      );
    });

    it("debe recalcular el total y confirmar la transacción", async () => {
      const resultado = await eliminarDetallePedido(20, 4, "mesero");

      expect(resultado).toBe(true);

      expect(calcularTotalPedidoMock).toHaveBeenCalledWith(conn, 10);

      expect(actualizarTotalPedidoMock).toHaveBeenCalledWith(conn, 10, 40000);

      expect(conn.commit).toHaveBeenCalled();
      expect(conn.rollback).not.toHaveBeenCalled();
      expect(conn.release).toHaveBeenCalled();
    });

    it("debe hacer rollback si ocurre un error durante la eliminación", async () => {
      sumarStockMock.mockRejectedValue(new Error("Error al devolver stock"));

      await expect(eliminarDetallePedido(20, 4, "mesero")).rejects.toThrow(
        "Error al devolver stock",
      );

      expect(conn.rollback).toHaveBeenCalled();
      expect(conn.commit).not.toHaveBeenCalled();
      expect(conn.release).toHaveBeenCalled();
    });
  });
});
