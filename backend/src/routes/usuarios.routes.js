import { Router } from "express";
import {
  actualizarUsuario,
  cambiarEstadoUsuario,
  crearUsuario,
  eliminarUsuario,
  mostrarUsuarios,
} from "../controllers/usuarios.controller.js";
import { verificarToken } from "../middlewares/auth.js";
import { permitirRoles } from "../middlewares/roles.js";
import {
  validarEstadoUsuario,
  validarUsuario,
} from "../middlewares/validaciones.js";
import { validarId } from "../middlewares/validarId.js";

const router = Router();

//tutas protegidas
router.get(
  "/usuarios",
  verificarToken,
  permitirRoles("admin"),
  mostrarUsuarios,
);
router.post(
  "/usuarios",
  verificarToken,
  permitirRoles("admin"),
  validarUsuario,
  crearUsuario,
);

router.put(
  "/usuarios/:id",
  verificarToken,
  permitirRoles("admin"),
  validarId(),
  validarUsuario,
  actualizarUsuario,
);

router.patch(
  "/usuarios/:id/estado",
  verificarToken,
  permitirRoles("admin"),
  validarId(),
  validarEstadoUsuario,
  cambiarEstadoUsuario,
);

router.delete(
  "/usuarios/:id",
  verificarToken,
  permitirRoles("admin"),
  validarId(),
  eliminarUsuario,
);

export default router;
