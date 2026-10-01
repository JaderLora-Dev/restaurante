import { describe, it, expect, vi, beforeEach } from "vitest";

const {
  obtenerPagosMock,
  crearPagoMock,
  obtenerComprobantePagoMock,
  obtenerDetalleComprobanteMock,

  obtenerPedidoIdMock,
  obtenerPedidoIdForUpdateMock,
  finalizarPedidoMock,

  liberarMesaPedidoMock,

  getConnectionMock,
} = vi.hoisted(() => ({
  obtenerPagosMock: vi.fn(),
  crearPagoMock: vi.fn(),
  obtenerComprobantePagoMock: vi.fn(),
  obtenerDetalleComprobanteMock: vi.fn(),

  obtenerPedidoIdMock: vi.fn(),
  obtenerPedidoIdForUpdateMock: vi.fn(),
  finalizarPedidoMock: vi.fn(),

  liberarMesaPedidoMock: vi.fn(),

  getConnectionMock: vi.fn(),
}));

vi.mock("../src/models/pago.model.js", () => ({
  obtenerPagos: obtenerPagosMock,
  crearPago: crearPagoMock,
  obtenerComprobantePago: obtenerComprobantePagoMock,
  obtenerDetalleComprobante: obtenerDetalleComprobanteMock,
}));

vi.mock("../src/models/pedido.model.js", () => ({
  obtenerPedidoId: obtenerPedidoIdMock,
  obtenerPedidoIdForUpdate: obtenerPedidoIdForUpdateMock,
  finalizarPedido: finalizarPedidoMock,
}));

vi.mock("../src/models/mesa.model.js", () => ({
  liberarMesaPedido: liberarMesaPedidoMock,
}));

vi.mock("../src/config/db.js", () => ({
  connection: {
    getConnection: getConnectionMock,
  },
}));

import {
  mostrarPagos,
  crearPago,
  obtenerComprobante,
} from "../src/services/pago.service.js";

describe("pago.service", () => {
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
  describe("mostrarPagos", () => {
    it("debe devolver los pagos con la paginación", async () => {
      obtenerPagosMock.mockResolvedValue({
        pagos: [
          {
            idPagos: 1,
            idPedidos: 10,
            metodoPago: "Efectivo",
            total: 40000,
          },
        ],
        total: 5,
      });

      const resultado = await mostrarPagos(
        1,
        2,
        undefined,
        undefined,
        undefined,
      );

      expect(resultado).toEqual({
        pagos: [
          {
            idPagos: 1,
            idPedidos: 10,
            metodoPago: "Efectivo",
            total: 40000,
          },
        ],
        total: 5,
        page: 1,
        limit: 2,
        totalPages: 3,
      });

      expect(obtenerPagosMock).toHaveBeenCalledWith(
        1,
        2,
        undefined,
        undefined,
        undefined,
      );
    });

    it("debe calcular totalPages correctamente cuando el total es cero", async () => {
      obtenerPagosMock.mockResolvedValue({
        pagos: [],
        total: 0,
      });

      const resultado = await mostrarPagos(
        1,
        10,
        undefined,
        undefined,
        undefined,
      );

      expect(resultado.totalPages).toBe(0);
    });
  });
  describe("crearPago", () => {
    const pedido = {
      idPedidos: 10,
      idUsuarios: 4,
      estado: "Activo",
      total: 40000,
    };

    beforeEach(() => {
      obtenerPedidoIdForUpdateMock.mockResolvedValue(pedido);

      crearPagoMock.mockResolvedValue(25);

      finalizarPedidoMock.mockResolvedValue({});
      liberarMesaPedidoMock.mockResolvedValue({});
    });

    it("debe rechazar si el pedido no existe", async () => {
      obtenerPedidoIdForUpdateMock.mockResolvedValue(null);

      await expect(
        crearPago(10, "Efectivo", 50000, 4, "mesero"),
      ).rejects.toMatchObject({
        message: "El pedido no existe.",
        statusCode: 404,
      });

      expect(conn.rollback).toHaveBeenCalled();
      expect(conn.release).toHaveBeenCalled();
    });

    it("debe rechazar si el pedido no está activo", async () => {
      obtenerPedidoIdForUpdateMock.mockResolvedValue({
        ...pedido,
        estado: "Pagado",
      });

      await expect(
        crearPago(10, "Efectivo", 50000, 4, "mesero"),
      ).rejects.toMatchObject({
        message: "El pedido no está activo y no puede ser pagado",
        statusCode: 400,
      });

      expect(conn.rollback).toHaveBeenCalled();
    });

    it("debe rechazar si el mesero no pertenece al pedido", async () => {
      await expect(
        crearPago(10, "Efectivo", 50000, 8, "mesero"),
      ).rejects.toMatchObject({
        message: "No tienes permiso para pagar este pedido.",
        statusCode: 403,
      });

      expect(conn.rollback).toHaveBeenCalled();
    });

    it("debe permitir al administrador pagar un pedido de otro usuario", async () => {
      const resultado = await crearPago(10, "Efectivo", 50000, 8, "admin");

      expect(resultado).toEqual({
        idPago: 25,
        idPedido: 10,
        metodoPago: "Efectivo",
        total: 40000,
        cambio: 10000,
      });

      expect(crearPagoMock).toHaveBeenCalledWith(
        conn,
        10,
        "Efectivo",
        40000,
        50000,
        10000,
      );
    });

    it("debe rechazar un método de pago inválido", async () => {
      await expect(
        crearPago(10, "Bitcoin", 50000, 4, "mesero"),
      ).rejects.toMatchObject({
        message: "El mètodo de pago no es vàlido.",
        statusCode: 400,
      });

      expect(conn.rollback).toHaveBeenCalled();
    });

    it("debe rechazar efectivo sin dinero recibido", async () => {
      await expect(
        crearPago(10, "Efectivo", undefined, 4, "mesero"),
      ).rejects.toMatchObject({
        message: "Debe ingresar el dinero recibido.",
        statusCode: 400,
      });
    });

    it("debe rechazar dinero recibido que no sea numérico", async () => {
      await expect(
        crearPago(10, "Efectivo", "abc", 4, "mesero"),
      ).rejects.toMatchObject({
        message: "El dinero recibido debe ser un número válido.",
        statusCode: 400,
      });
    });

    it("debe rechazar dinero recibido negativo", async () => {
      await expect(
        crearPago(10, "Efectivo", -5000, 4, "mesero"),
      ).rejects.toMatchObject({
        message: "El dinero recibido no puede ser negativo.",
        statusCode: 400,
      });
    });

    it("debe rechazar dinero recibido insuficiente", async () => {
      await expect(
        crearPago(10, "Efectivo", 30000, 4, "mesero"),
      ).rejects.toMatchObject({
        message: expect.stringContaining("El dinero recibido es insuficiente."),
        statusCode: 400,
      });
    });
  });
  describe("crearPago", () => {
    const pedido = {
      idPedidos: 10,
      idUsuarios: 4,
      estado: "Activo",
      total: 40000,
    };

    beforeEach(() => {
      obtenerPedidoIdForUpdateMock.mockResolvedValue(pedido);

      crearPagoMock.mockResolvedValue(25);

      finalizarPedidoMock.mockResolvedValue({});
      liberarMesaPedidoMock.mockResolvedValue({});
    });

    // tus 9 tests anteriores

    it("debe crear correctamente un pago en efectivo y calcular el cambio", async () => {
      const resultado = await crearPago(10, "Efectivo", 50000, 4, "mesero");

      expect(resultado).toEqual({
        idPago: 25,
        idPedido: 10,
        metodoPago: "Efectivo",
        total: 40000,
        cambio: 10000,
      });

      expect(crearPagoMock).toHaveBeenCalledWith(
        conn,
        10,
        "Efectivo",
        40000,
        50000,
        10000,
      );

      expect(finalizarPedidoMock).toHaveBeenCalledWith(conn, 10);

      expect(liberarMesaPedidoMock).toHaveBeenCalledWith(conn, 10);

      expect(conn.commit).toHaveBeenCalled();
      expect(conn.rollback).not.toHaveBeenCalled();
      expect(conn.release).toHaveBeenCalled();
    });

    it("debe permitir pagar con Nequi sin dinero recibido", async () => {
      const resultado = await crearPago(10, "Nequi", undefined, 4, "mesero");

      expect(resultado).toEqual({
        idPago: 25,
        idPedido: 10,
        metodoPago: "Nequi",
        total: 40000,
        cambio: null,
      });

      expect(crearPagoMock).toHaveBeenCalledWith(
        conn,
        10,
        "Nequi",
        40000,
        null,
        null,
      );
    });

    it("debe permitir pagar con Transferencia sin dinero recibido", async () => {
      const resultado = await crearPago(
        10,
        "Transferencia",
        undefined,
        4,
        "mesero",
      );

      expect(resultado).toEqual({
        idPago: 25,
        idPedido: 10,
        metodoPago: "Transferencia",
        total: 40000,
        cambio: null,
      });

      expect(crearPagoMock).toHaveBeenCalledWith(
        conn,
        10,
        "Transferencia",
        40000,
        null,
        null,
      );
    });

    it("debe permitir pagar con Tarjeta sin dinero recibido", async () => {
      const resultado = await crearPago(10, "Tarjeta", undefined, 4, "mesero");

      expect(resultado).toEqual({
        idPago: 25,
        idPedido: 10,
        metodoPago: "Tarjeta",
        total: 40000,
        cambio: null,
      });

      expect(crearPagoMock).toHaveBeenCalledWith(
        conn,
        10,
        "Tarjeta",
        40000,
        null,
        null,
      );
    });

    it("debe hacer commit y liberar la mesa después de registrar el pago", async () => {
      await crearPago(10, "Nequi", undefined, 4, "mesero");

      expect(crearPagoMock).toHaveBeenCalled();

      expect(finalizarPedidoMock).toHaveBeenCalledWith(conn, 10);

      expect(liberarMesaPedidoMock).toHaveBeenCalledWith(conn, 10);

      expect(conn.commit).toHaveBeenCalled();
      expect(conn.rollback).not.toHaveBeenCalled();
      expect(conn.release).toHaveBeenCalled();
    });
  });

  describe("obtenerComprobante", () => {
    const pedido = {
      idPedidos: 10,
      idUsuarios: 4,
      estado: "Pagado",
      total: 40000,
    };

    const comprobante = {
      idPagos: 25,
      idPedidos: 10,
      metodoPago: "Efectivo",
      total: 40000,
      dineroRecibido: 50000,
      cambio: 10000,
    };

    const detalle = [
      {
        idDetalle_pedido: 1,
        idProductos: 5,
        nombre: "Hamburguesa",
        cantidad: 2,
        precioUnitario: 20000,
        subtotal: 40000,
      },
    ];

    it("debe rechazar si el pedido no existe", async () => {
      obtenerPedidoIdMock.mockResolvedValue(null);

      await expect(obtenerComprobante(10, 4, "mesero")).rejects.toMatchObject({
        message: "El pedido no existe.",
        statusCode: 404,
      });

      expect(obtenerComprobantePagoMock).not.toHaveBeenCalled();
      expect(obtenerDetalleComprobanteMock).not.toHaveBeenCalled();
    });

    it("debe rechazar si el mesero no pertenece al pedido", async () => {
      obtenerPedidoIdMock.mockResolvedValue(pedido);

      await expect(obtenerComprobante(10, 8, "mesero")).rejects.toMatchObject({
        message: "No tienes permiso para consultar este comprobante.",
        statusCode: 403,
      });

      expect(obtenerComprobantePagoMock).not.toHaveBeenCalled();
      expect(obtenerDetalleComprobanteMock).not.toHaveBeenCalled();
    });

    it("debe rechazar si no existe el comprobante", async () => {
      obtenerPedidoIdMock.mockResolvedValue(pedido);
      obtenerComprobantePagoMock.mockResolvedValue(null);

      await expect(obtenerComprobante(10, 4, "mesero")).rejects.toMatchObject({
        message: "No se encontró el comprobante.",
        statusCode: 404,
      });

      expect(obtenerComprobantePagoMock).toHaveBeenCalledWith(10);
      expect(obtenerDetalleComprobanteMock).not.toHaveBeenCalled();
    });

    it("debe devolver el comprobante y el detalle correctamente", async () => {
      obtenerPedidoIdMock.mockResolvedValue(pedido);
      obtenerComprobantePagoMock.mockResolvedValue(comprobante);
      obtenerDetalleComprobanteMock.mockResolvedValue(detalle);

      const resultado = await obtenerComprobante(10, 4, "mesero");

      expect(resultado).toEqual({
        comprobante,
        detalle,
      });

      expect(obtenerPedidoIdMock).toHaveBeenCalledWith(10);
      expect(obtenerComprobantePagoMock).toHaveBeenCalledWith(10);
      expect(obtenerDetalleComprobanteMock).toHaveBeenCalledWith(10);
    });

    it("debe permitir al administrador consultar el comprobante de otro usuario", async () => {
      obtenerPedidoIdMock.mockResolvedValue(pedido);
      obtenerComprobantePagoMock.mockResolvedValue(comprobante);
      obtenerDetalleComprobanteMock.mockResolvedValue(detalle);

      const resultado = await obtenerComprobante(10, 8, "admin");

      expect(resultado).toEqual({
        comprobante,
        detalle,
      });

      expect(obtenerComprobantePagoMock).toHaveBeenCalledWith(10);
      expect(obtenerDetalleComprobanteMock).toHaveBeenCalledWith(10);
    });
  });
});
