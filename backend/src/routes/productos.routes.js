import express from "express";
import {
  agregarProducto,
  borrarProducto,
  cambiarEstadoProducto,
  editarProducto,
  mostrarProductoId,
  mostrarProductos,
  obtenerProductosDisponible,
} from "../controllers/productos.controller.js";
import upload from "../middlewares/upload.js";
import { verificarToken } from "../middlewares/auth.js";
import { permitirRoles } from "../middlewares/roles.js";
import {
  validarProducto,
  validarProductoEstado,
} from "../middlewares/validarProducto.js";
import { validarId } from "../middlewares/validarId.js";
import { validarImagen } from "../middlewares/validarImagen.js";
const router = express.Router();

//mostrar productos
router.get(
  "/",
  verificarToken,
  permitirRoles("admin", "mesero"),
  mostrarProductos,
);

// productos disponible
router.get(
  "/disponible",
  verificarToken,
  permitirRoles("mesero"),
  obtenerProductosDisponible,
);

//mostrar por id
router.get(
  "/:id",
  verificarToken,
  permitirRoles("admin", "mesero"),
  validarId(),
  mostrarProductoId,
);

//crear productos
router.post(
  "/",
  verificarToken,
  permitirRoles("admin"),
  upload.single("imagen"),
  validarImagen,
  validarProducto,
  agregarProducto,
);

//actualizar productos
router.put(
  "/:id",
  verificarToken,
  permitirRoles("admin"),
  validarId(),
  upload.single("imagen"),
  validarImagen,
  validarProducto,
  editarProducto,
);

//cambiar estado
router.patch(
  "/:id/estado",
  verificarToken,
  permitirRoles("admin"),
  validarId(),
  validarProductoEstado,
  cambiarEstadoProducto,
);

//eliminar productos
router.delete(
  "/:id",
  verificarToken,
  permitirRoles("admin"),
  validarId(),
  borrarProducto,
);

export default router;
