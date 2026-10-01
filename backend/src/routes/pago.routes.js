import { Router } from "express";
import { verificarToken } from "../middlewares/auth.js";
import { permitirRoles } from "../middlewares/roles.js";
import {
  crearPago,
  mostrarComprobante,
  obtenerPagos,
} from "../controllers/pago.controller.js";
import { validarId } from "../middlewares/validarId.js";
import { validarPago } from "../middlewares/validarPagos.js";

const router = Router();

router.post(
  "/pagos",
  verificarToken,
  permitirRoles("admin", "mesero"),
  validarPago,
  crearPago,
);

router.get(
  "/pagos/comprobante/:id",
  verificarToken,
  permitirRoles("admin", "mesero"),
  validarId(),
  mostrarComprobante,
);

router.get("/pagos", verificarToken, permitirRoles("admin"), obtenerPagos);

export default router;
