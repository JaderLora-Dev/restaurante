import express from "express";
import cors from "cors";
import helmet from "helmet";
import usuariosRouter from "./routes/usuarios.routes.js";
import authRoutes from "./routes/auth.routes.js";
import pedidosRoutes from "./routes/pedidos.routes.js";
import detalleRouter from "./routes/detalle_pedido.routes.js";
import productosRouter from "./routes/productos.routes.js";
import categoriaRouter from "./routes/categorias.routes.js";
import mesasRouter from "./routes/mesas.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import pagoRouter from "./routes/pago.routes.js";
import cookieParser from "cookie-parser";
import errorMiddleware from "./middlewares/error.middleware.js";

const app = express();
app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: "cross-origin",
    },
  }),
);
app.use(express.json());

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:4173",
    credentials: true,
  }),
);

app.use(cookieParser());

//rutas auth
app.use("/api", authRoutes);

//conectar rutas
app.use("/api", usuariosRouter);

//rutas productos
app.use("/api/productos", productosRouter);

//ruta pagos
app.use("/api", pagoRouter);

//mesas
app.use("/api", mesasRouter);

//categorias
app.use("/api", categoriaRouter);

//rutas pedidos
app.use("/api", pedidosRoutes);

// rutas detalle
app.use("/api", detalleRouter);

//dashboard

app.use("/api/dashboard", dashboardRoutes);

app.get("/", (req, res) => {
  res.send("Servidor funcionando");
});

//ruta no encontrada
app.use((req, res, next) => {
  res.status(404).json({
    mensaje: "Ruta no encontrada.",
  });
});

//maddleware de errores
app.use(errorMiddleware);

export default app;
