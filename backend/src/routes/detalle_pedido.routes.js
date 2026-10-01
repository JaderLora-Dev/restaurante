import { Router } from "express";
import {
  agregarDetallePedido,
  borrarDetallePedido,
  editarDetallePedido,
  mostrarDetallePedido,
  mostrarDetallePedidoId,
  mostrarDetallePedidoPorPedido,
} from "../controllers/detalle_pedido.controller.js";

import { verificarToken } from "../middlewares/auth.js";
import { permitirRoles } from "../middlewares/roles.js";
import { validarId } from "../middlewares/validarId.js";
import {
  validarDetallePost,
  validarDetallePut,
} from "../middlewares/validarDetallePedido.js";

const router = Router();

router.get(
  "/detalle-pedido",
  verificarToken,
  permitirRoles("mesero", "admin"),
  mostrarDetallePedido,
);

router.get(
  "/detalle-pedido/pedido/:idPedido",
  verificarToken,
  permitirRoles("mesero", "admin"),
  validarId("idPedido"),
  mostrarDetallePedidoPorPedido,
);

//mostrar por id
router.get(
  "/detalle-pedido/:id",
  verificarToken,
  permitirRoles("admin", "mesero"),
  validarId(),
  mostrarDetallePedidoId,
);
//crear detalle
router.post(
  "/detalle-pedido",
  verificarToken,
  permitirRoles("mesero"),
  validarDetallePost,
  agregarDetallePedido,
);

//actualizar
router.put(
  "/detalle-pedido/:id",
  verificarToken,
  permitirRoles("mesero"),
  validarId(),
  validarDetallePut,
  editarDetallePedido,
);

//eliminar producto del pedido
router.delete(
  "/detalle-pedido/:id",
  verificarToken,
  permitirRoles("mesero", "admin"),
  validarId(),
  borrarDetallePedido,
);

export default router;
