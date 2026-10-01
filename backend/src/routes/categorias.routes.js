import { Router } from "express";
import {
  agregarCategoria,
  borrarCategoria,
  cambiarEstadoCategoria,
  editarCategoria,
  mostrarCategoriaId,
  mostrarCategorias,
} from "../controllers/categorias.controller.js";
import { verificarToken } from "../middlewares/auth.js";
import { permitirRoles } from "../middlewares/roles.js";
import {
  validarCategoria,
  validarEstadoCategoria,
} from "../middlewares/validarCategoria.js";
import { validarId } from "../middlewares/validarId.js";

const routes = Router();

routes.get(
  "/categorias",
  verificarToken,
  permitirRoles("admin", "mesero"),
  mostrarCategorias,
);

routes.get(
  "/categorias/:id",
  verificarToken,
  permitirRoles("admin", "mesero"),
  validarId(),
  mostrarCategoriaId,
);

routes.post(
  "/categorias",
  verificarToken,
  permitirRoles("admin"),
  validarCategoria,
  agregarCategoria,
);

routes.put(
  "/categorias/:id",
  verificarToken,
  permitirRoles("admin"),
  validarId(),
  validarCategoria,
  editarCategoria,
);

routes.patch(
  "/categorias/:id/estado",
  verificarToken,

  permitirRoles("admin"),
  validarId(),
  validarEstadoCategoria,
  cambiarEstadoCategoria,
);

routes.delete(
  "/categorias/:id",
  verificarToken,
  permitirRoles("admin"),
  validarId(),
  borrarCategoria,
);

export default routes;
