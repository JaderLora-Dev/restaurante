import { describe, it, expect, vi, beforeEach } from "vitest";

const {
  obtenerMesasMock,
  obtenerMesaIdMock,
  obtenerMesaPorNumeroMock,
  crearMesaMock,
  actualizarMesaMock,
  cambiarEstadoMesaMock,
  mesaTienePedidosMock,
  eliminarMesaMock,
} = vi.hoisted(() => ({
  obtenerMesasMock: vi.fn(),
  obtenerMesaIdMock: vi.fn(),
  obtenerMesaPorNumeroMock: vi.fn(),
  crearMesaMock: vi.fn(),
  actualizarMesaMock: vi.fn(),
  cambiarEstadoMesaMock: vi.fn(),
  mesaTienePedidosMock: vi.fn(),
  eliminarMesaMock: vi.fn(),
}));

vi.mock("../src/models/mesa.model.js", () => ({
  obtenerMesas: obtenerMesasMock,
  obtenerMesaId: obtenerMesaIdMock,
  obtenerMesaPorNumero: obtenerMesaPorNumeroMock,
  crearMesa: crearMesaMock,
  actualizarMesa: actualizarMesaMock,
  cambiarEstadoMesa: cambiarEstadoMesaMock,
  mesaTienePedidos: mesaTienePedidosMock,
  eliminarMesa: eliminarMesaMock,
}));

import {
  obtenerMesas,
  obtenerMesaId,
  crearMesa,
  actualizarMesa,
  cambiarEstadoMesa,
  eliminarMesa,
} from "../src/services/mesas.service.js";

describe("mesas.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("obtenerMesas", () => {
    it("debe devolver las mesas obtenidas del modelo", async () => {
      const mesas = [
        {
          idMesas: 1,
          numero: 1,
          estado: "Disponible",
        },
        {
          idMesas: 2,
          numero: 2,
          estado: "Ocupada",
        },
      ];

      obtenerMesasMock.mockResolvedValue(mesas);

      const resultado = await obtenerMesas("1", "Disponible", "ASC");

      expect(resultado).toEqual(mesas);

      expect(obtenerMesasMock).toHaveBeenCalledWith("1", "Disponible", "ASC");
    });
  });

  describe("obtenerMesaId", () => {
    it("debe devolver la mesa cuando existe", async () => {
      const mesa = {
        idMesas: 1,
        numero: 1,
        estado: "Disponible",
      };

      obtenerMesaIdMock.mockResolvedValue(mesa);

      const resultado = await obtenerMesaId(1);

      expect(resultado).toEqual(mesa);
      expect(obtenerMesaIdMock).toHaveBeenCalledWith(1);
    });

    it("debe lanzar error si la mesa no existe", async () => {
      obtenerMesaIdMock.mockResolvedValue(null);

      await expect(obtenerMesaId(99)).rejects.toMatchObject({
        message: "Mesa no encontrada.",
        statusCode: 404,
      });
    });
  });

  describe("crearMesa", () => {
    it("debe rechazar si el número no existe", async () => {
      await expect(
        crearMesa({
          estado: "Disponible",
        }),
      ).rejects.toMatchObject({
        message: "El número es obligatorio.",
        statusCode: 400,
      });

      expect(obtenerMesaPorNumeroMock).not.toHaveBeenCalled();
    });

    it("debe rechazar si el número es null", async () => {
      await expect(
        crearMesa({
          numero: null,
          estado: "Disponible",
        }),
      ).rejects.toMatchObject({
        message: "El número es obligatorio.",
        statusCode: 400,
      });
    });

    it("debe rechazar si el número es una cadena vacía", async () => {
      await expect(
        crearMesa({
          numero: "",
          estado: "Disponible",
        }),
      ).rejects.toMatchObject({
        message: "El número es obligatorio.",
        statusCode: 400,
      });
    });

    it("debe rechazar si el número no es entero", async () => {
      await expect(
        crearMesa({
          numero: 1.5,
          estado: "Disponible",
        }),
      ).rejects.toMatchObject({
        message: "El número de la mesa debe ser un entero mayor que cero.",
        statusCode: 400,
      });

      expect(obtenerMesaPorNumeroMock).not.toHaveBeenCalled();
    });

    it("debe rechazar si el número es menor o igual a cero", async () => {
      await expect(
        crearMesa({
          numero: 0,
          estado: "Disponible",
        }),
      ).rejects.toMatchObject({
        message: "El número de la mesa debe ser un entero mayor que cero.",
        statusCode: 400,
      });
    });

    it("debe rechazar si el número ya existe", async () => {
      obtenerMesaPorNumeroMock.mockResolvedValue({
        idMesas: 1,
        numero: 5,
        estado: "Disponible",
      });

      await expect(
        crearMesa({
          numero: 5,
          estado: "Disponible",
        }),
      ).rejects.toMatchObject({
        message: "EL número ya existe.",
        statusCode: 400,
      });

      expect(crearMesaMock).not.toHaveBeenCalled();
    });

    it("debe rechazar un estado inválido", async () => {
      obtenerMesaPorNumeroMock.mockResolvedValue(null);

      await expect(
        crearMesa({
          numero: 5,
          estado: "Reservada",
        }),
      ).rejects.toMatchObject({
        message: "El estado debe ser Disponible, Ocupada o Inactiva.",
        statusCode: 400,
      });

      expect(crearMesaMock).not.toHaveBeenCalled();
    });

    it("debe crear la mesa correctamente", async () => {
      const mesa = {
        numero: "5",
        estado: "Disponible",
      };

      const resultadoEsperado = {
        idMesas: 5,
        numero: 5,
        estado: "Disponible",
      };

      obtenerMesaPorNumeroMock.mockResolvedValue(null);
      crearMesaMock.mockResolvedValue(resultadoEsperado);

      const resultado = await crearMesa(mesa);

      expect(resultado).toEqual(resultadoEsperado);

      expect(obtenerMesaPorNumeroMock).toHaveBeenCalledWith(5);

      expect(crearMesaMock).toHaveBeenCalledWith({
        ...mesa,
        numero: 5,
      });
    });
  });

  describe("actualizarMesa", () => {
    it("debe rechazar si el número es obligatorio", async () => {
      await expect(
        actualizarMesa(1, {
          estado: "Disponible",
        }),
      ).rejects.toMatchObject({
        message: "El número es obligatorio.",
        statusCode: 400,
      });

      expect(obtenerMesaIdMock).not.toHaveBeenCalled();
    });

    it("debe rechazar si el número no es entero", async () => {
      await expect(
        actualizarMesa(1, {
          numero: 1.5,
          estado: "Disponible",
        }),
      ).rejects.toMatchObject({
        message: "El número de la mesa debe ser un entero mayor que cero.",
        statusCode: 400,
      });
    });

    it("debe rechazar un estado inválido", async () => {
      await expect(
        actualizarMesa(1, {
          numero: 5,
          estado: "Reservada",
        }),
      ).rejects.toMatchObject({
        message: "El estado debe ser Disponible, Ocupada o Inactiva",
        statusCode: 400,
      });
    });

    it("debe rechazar si la mesa no existe", async () => {
      obtenerMesaIdMock.mockResolvedValue(null);

      await expect(
        actualizarMesa(99, {
          numero: 5,
          estado: "Disponible",
        }),
      ).rejects.toMatchObject({
        message: "Esta mesa no existe.",
        statusCode: 404,
      });

      expect(obtenerMesaPorNumeroMock).not.toHaveBeenCalled();
    });

    it("debe rechazar el cambio de estado de una mesa ocupada", async () => {
      obtenerMesaIdMock.mockResolvedValue({
        idMesas: 1,
        numero: 5,
        estado: "Ocupada",
      });

      await expect(
        actualizarMesa(1, {
          numero: 5,
          estado: "Disponible",
        }),
      ).rejects.toMatchObject({
        message: "No se puede cambiar el estado de una mesa ocupada.",
        statusCode: 400,
      });

      expect(obtenerMesaPorNumeroMock).not.toHaveBeenCalled();
      expect(actualizarMesaMock).not.toHaveBeenCalled();
    });

    it("debe rechazar si el número pertenece a otra mesa", async () => {
      obtenerMesaIdMock.mockResolvedValue({
        idMesas: 1,
        numero: 5,
        estado: "Disponible",
      });

      obtenerMesaPorNumeroMock.mockResolvedValue({
        idMesas: 2,
        numero: 10,
        estado: "Disponible",
      });

      await expect(
        actualizarMesa(1, {
          numero: 10,
          estado: "Disponible",
        }),
      ).rejects.toMatchObject({
        message: "El número ya está registrado.",
        statusCode: 400,
      });

      expect(actualizarMesaMock).not.toHaveBeenCalled();
    });

    it("debe actualizar la mesa correctamente", async () => {
      const mesa = {
        numero: "10",
        estado: "Disponible",
      };

      const resultadoEsperado = {
        idMesas: 1,
        numero: 10,
        estado: "Disponible",
      };

      obtenerMesaIdMock.mockResolvedValue({
        idMesas: 1,
        numero: 5,
        estado: "Disponible",
      });

      obtenerMesaPorNumeroMock.mockResolvedValue(null);
      actualizarMesaMock.mockResolvedValue(resultadoEsperado);

      const resultado = await actualizarMesa(1, mesa);

      expect(resultado).toEqual(resultadoEsperado);

      expect(actualizarMesaMock).toHaveBeenCalledWith(1, {
        ...mesa,
        numero: 10,
      });
    });
  });

  describe("cambiarEstadoMesa", () => {
    it("debe rechazar un estado inválido", async () => {
      await expect(
        cambiarEstadoMesa(1, "Reservada", "admin"),
      ).rejects.toMatchObject({
        message: "El estado debe ser Disponible, Ocupada o Inactiva.",
        statusCode: 400,
      });

      expect(obtenerMesaIdMock).not.toHaveBeenCalled();
    });

    it("debe impedir que un mesero marque una mesa como Inactiva", async () => {
      await expect(
        cambiarEstadoMesa(1, "Inactiva", "mesero"),
      ).rejects.toMatchObject({
        message: "Solo el administrador puede marcar una mesa como Inactiva",
        statusCode: 403,
      });

      expect(obtenerMesaIdMock).not.toHaveBeenCalled();
    });

    it("debe rechazar si la mesa no existe", async () => {
      obtenerMesaIdMock.mockResolvedValue(null);

      await expect(
        cambiarEstadoMesa(99, "Disponible", "mesero"),
      ).rejects.toMatchObject({
        message: "La mesa no existe.",
        statusCode: 404,
      });

      expect(cambiarEstadoMesaMock).not.toHaveBeenCalled();
    });

    it("debe cambiar el estado correctamente", async () => {
      const resultadoEsperado = {
        mensaje: "Estado actualizado",
      };

      obtenerMesaIdMock.mockResolvedValue({
        idMesas: 1,
        numero: 5,
        estado: "Ocupada",
      });

      cambiarEstadoMesaMock.mockResolvedValue(resultadoEsperado);

      const resultado = await cambiarEstadoMesa(1, "Disponible", "mesero");

      expect(resultado).toEqual(resultadoEsperado);

      expect(cambiarEstadoMesaMock).toHaveBeenCalledWith(1, "Disponible");
    });

    it("debe permitir al administrador marcar una mesa como Inactiva", async () => {
      obtenerMesaIdMock.mockResolvedValue({
        idMesas: 1,
        numero: 5,
        estado: "Disponible",
      });

      cambiarEstadoMesaMock.mockResolvedValue({
        mensaje: "Estado actualizado",
      });

      const resultado = await cambiarEstadoMesa(1, "Inactiva", "admin");

      expect(resultado).toEqual({
        mensaje: "Estado actualizado",
      });

      expect(cambiarEstadoMesaMock).toHaveBeenCalledWith(1, "Inactiva");
    });
  });

  describe("eliminarMesa", () => {
    it("debe rechazar si la mesa no existe", async () => {
      obtenerMesaIdMock.mockResolvedValue(null);

      await expect(eliminarMesa(99, "admin")).rejects.toMatchObject({
        message: "Mesa no encontrada.",
        statusCode: 404,
      });

      expect(mesaTienePedidosMock).not.toHaveBeenCalled();
    });

    it("debe marcar como Inactiva si la mesa tiene pedidos", async () => {
      obtenerMesaIdMock.mockResolvedValue({
        idMesas: 1,
        numero: 5,
        estado: "Disponible",
      });

      mesaTienePedidosMock.mockResolvedValue(true);
      cambiarEstadoMesaMock.mockResolvedValue({
        mensaje: "Estado actualizado",
      });

      const resultado = await eliminarMesa(1, "admin");

      expect(resultado).toEqual({
        eliminado: false,
        mensaje: "La mesa tiene pedido y fue marcada como Inactiva.",
      });

      expect(mesaTienePedidosMock).toHaveBeenCalledWith(1);

      expect(cambiarEstadoMesaMock).toHaveBeenCalledWith(1, "Inactiva");

      expect(eliminarMesaMock).not.toHaveBeenCalled();
    });

    it("debe eliminar si la mesa no tiene pedidos", async () => {
      obtenerMesaIdMock.mockResolvedValue({
        idMesas: 1,
        numero: 5,
        estado: "Disponible",
      });

      mesaTienePedidosMock.mockResolvedValue(false);
      eliminarMesaMock.mockResolvedValue({
        affectedRows: 1,
      });

      const resultado = await eliminarMesa(1, "admin");

      expect(resultado).toEqual({
        eliminado: true,
        mensaje: "La mesa fue eliminada correctamente.",
      });

      expect(mesaTienePedidosMock).toHaveBeenCalledWith(1);
      expect(eliminarMesaMock).toHaveBeenCalledWith(1);
    });
  });
});
