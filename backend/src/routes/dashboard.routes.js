import { Router } from "express";
import {
  ventasSemana,
  VentasDia,
  ventasMes,
  ultimosPedidos,
  productosTop,
  topMeseros,
  resumenDashboard,
} from "../controllers/dashboard.controller.js";

const router = Router();

router.get("/resumen", resumenDashboard);

router.get("/ultimos-pedidos", ultimosPedidos);

router.get("/ventas-dia", VentasDia);

router.get("/ventas-semana", ventasSemana);

router.get("/ventas-mes", ventasMes);

router.get("/productos-top", productosTop);

router.get("/top-meseros", topMeseros);

export default router;
