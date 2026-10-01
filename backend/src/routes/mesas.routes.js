import { Router } from "express";
import {
  agregarMesa,
  borrarMesa,
  cambiarEstadoMesa,
  editarMesa,
  mostrarMesaId,
  mostrarMesas,
} from "../controllers/mesas.controller.js";
import { verificarToken } from "../middlewares/auth.js";
import { permitirRoles } from "../middlewares/roles.js";
import { validarMesa, validarMesaEstado } from "../middlewares/validarMesa.js";
import { validarId } from "../middlewares/validarId.js";

const router = Router();

//  ver
router.get(
  "/mesas",
  verificarToken,
  permitirRoles("admin", "mesero"),
  mostrarMesas,
);

//mostrar por id
router.get(
  "/mesas/:id",
  verificarToken,
  permitirRoles("admin"),
  validarId(),
  mostrarMesaId,
);

//ruta crear
router.post(
  "/mesas",
  verificarToken,
  permitirRoles("admin"),
  validarMesa,
  agregarMesa,
);

//actualizar
router.put(
  "/mesas/:id",
  verificarToken,
  permitirRoles("admin"),
  validarId(),
  validarMesa,
  editarMesa,
);

//cambiar estado
router.patch(
  "/mesas/:id/estado",
  verificarToken,
  permitirRoles("admin", "mesero"),
  validarId(),
  validarMesaEstado,
  cambiarEstadoMesa,
);

router.delete(
  "/mesas/:id",
  verificarToken,
  permitirRoles("admin"),
  validarId(),
  borrarMesa,
);

export default router;
