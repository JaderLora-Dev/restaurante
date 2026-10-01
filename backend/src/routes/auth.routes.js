import { Router } from "express";
import {
  login,
  logout,
  obtenerUsuarioActual,
} from "../controllers/auth.controller.js";
import { validarLogin } from "../middlewares/validaciones.js";
import { loginRateLimiter } from "../middlewares/rateLimit.js";
import { verificarToken } from "../middlewares/auth.js";

const router = Router();

router.post("/login", loginRateLimiter, validarLogin, login);

router.get("/me", verificarToken, obtenerUsuarioActual);

router.post("/logout", logout);

export default router;
