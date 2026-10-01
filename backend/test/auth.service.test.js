import { describe, it, expect, vi, beforeEach } from "vitest";

const { obtenerUsuarioPorEmailMock, compareMock, signMock } = vi.hoisted(
  () => ({
    obtenerUsuarioPorEmailMock: vi.fn(),
    compareMock: vi.fn(),
    signMock: vi.fn(),
  }),
);

vi.mock("../src/models/usuario.model.js", () => ({
  obtenerUsuarioPorEmail: obtenerUsuarioPorEmailMock,
}));

vi.mock("bcrypt", () => ({
  default: {
    compare: compareMock,
  },
}));

vi.mock("jsonwebtoken", () => ({
  default: {
    sign: signMock,
  },
}));

import { login } from "../src/services/auth.service.js";

describe("auth.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.JWT_SECRET = "secreto-prueba";
  });

  describe("login", () => {
    it("debe rechazar si email o contraseña son inválidos", async () => {
      await expect(login("", "")).rejects.toMatchObject({
        message: "Email y contraseña son obligatorios.",
        statusCode: 400,
      });

      expect(obtenerUsuarioPorEmailMock).not.toHaveBeenCalled();
    });

    it("debe normalizar el email antes de buscar el usuario", async () => {
      obtenerUsuarioPorEmailMock.mockResolvedValue(null);

      await expect(
        login("  USUARIO@EMAIL.COM  ", "123456"),
      ).rejects.toMatchObject({
        message: "Credenciales incorrectas.",
        statusCode: 401,
      });

      expect(obtenerUsuarioPorEmailMock).toHaveBeenCalledWith(
        "usuario@email.com",
      );
    });

    it("debe rechazar si el usuario no existe", async () => {
      obtenerUsuarioPorEmailMock.mockResolvedValue(null);

      await expect(login("usuario@email.com", "123456")).rejects.toMatchObject({
        message: "Credenciales incorrectas.",
        statusCode: 401,
      });

      expect(compareMock).not.toHaveBeenCalled();
    });

    it("debe rechazar si el usuario está inactivo", async () => {
      obtenerUsuarioPorEmailMock.mockResolvedValue({
        idUsuarios: 1,
        rol: "admin",
        estado: "Inactivo",
        contraseña: "hash",
      });

      await expect(login("usuario@email.com", "123456")).rejects.toMatchObject({
        message: "Credenciales incorrectas.",
        statusCode: 401,
      });

      expect(compareMock).not.toHaveBeenCalled();
    });

    it("debe rechazar si el usuario no tiene contraseña", async () => {
      obtenerUsuarioPorEmailMock.mockResolvedValue({
        idUsuarios: 1,
        rol: "admin",
        estado: "Activo",
        contraseña: null,
      });

      await expect(login("usuario@email.com", "123456")).rejects.toMatchObject({
        statusCode: 500,
      });

      expect(compareMock).not.toHaveBeenCalled();
    });

    it("debe rechazar si la contraseña es incorrecta", async () => {
      obtenerUsuarioPorEmailMock.mockResolvedValue({
        idUsuarios: 1,
        rol: "admin",
        estado: "Activo",
        contraseña: "hash",
      });

      compareMock.mockResolvedValue(false);

      await expect(login("usuario@email.com", "123456")).rejects.toMatchObject({
        message: "Credenciales incorrectas.",
        statusCode: 401,
      });

      expect(compareMock).toHaveBeenCalledWith("123456", "hash");
      expect(signMock).not.toHaveBeenCalled();
    });

    it("debe iniciar sesión correctamente y generar el JWT", async () => {
      obtenerUsuarioPorEmailMock.mockResolvedValue({
        idUsuarios: 4,
        rol: "admin",
        estado: "Activo",
        contraseña: "hash",
      });

      compareMock.mockResolvedValue(true);
      signMock.mockReturnValue("token-prueba");

      const resultado = await login("  ADMIN@EMAIL.COM ", "123456");

      expect(compareMock).toHaveBeenCalledWith("123456", "hash");

      expect(signMock).toHaveBeenCalledWith(
        {
          idUsuarios: 4,
          rol: "admin",
        },
        "secreto-prueba",
        {
          expiresIn: "4h",
        },
      );

      expect(resultado).toEqual({
        token: "token-prueba",
        usuario: {
          id: 4,
          rol: "admin",
        },
      });
    });
  });
});
