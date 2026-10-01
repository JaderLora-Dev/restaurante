import { Router } from "express";
import {
  agregaPedido,
  cambiarEstadoPedido,
  mostrarPedidoActivoMesa,
  mostrarPedidoId,
  mostrarPedidos,
  mostrarPedidosActivos,
} from "../controllers/pedidos.controller.js";

import { verificarToken } from "../middlewares/auth.js";
import { permitirRoles } from "../middlewares/roles.js";
import {
  validarEstadoPedido,
  validarPedido,
} from "../middlewares/validarPedido.js";
import { validarId } from "../middlewares/validarId.js";

const router = Router();

//mostrar pedidos activos
router.get(
  "/pedidos/activos",
  verificarToken,
  permitirRoles("admin", "mesero"),
  mostrarPedidosActivos,
);

//Ver pedidos admin, mesero

router.get(
  "/pedidos",
  verificarToken,
  permitirRoles("admin", "mesero"),
  mostrarPedidos,
);

router.get(
  "/pedidos/mesa/:id",
  verificarToken,
  permitirRoles("admin", "mesero"),
  validarId(),
  mostrarPedidoActivoMesa,
);

router.get(
  "/pedidos/:id",
  verificarToken,
  permitirRoles("admin", "mesero"),
  validarId(),
  mostrarPedidoId,
);

//crear pedido
router.post(
  "/pedidos",
  verificarToken,
  permitirRoles("mesero", "admin"),
  validarPedido,
  agregaPedido,
);

//cambiar estado de pedido
router.patch(
  "/pedidos/:id/estado",
  verificarToken,
  permitirRoles("mesero", "admin"),
  validarId(),
  validarEstadoPedido,
  cambiarEstadoPedido,
);

export default router;
