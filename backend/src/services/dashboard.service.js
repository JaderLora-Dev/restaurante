import * as dashboardModal from "../models/dashboard.model.js";
import AppError from "../utils/AppError.js";

//funciona para validar fechas
const validarFechas = (fechaInicio, fechaFin) => {
  if (!fechaInicio || !fechaFin) {
    throw new AppError(
      "Faltan los parámetros requeridos: fechaInicio y fechaFin.",
      400,
    );
  }

  const inicio = new Date(fechaInicio);
  const fin = new Date(fechaFin);

  if (Number.isNaN(inicio.getTime()) || Number.isNaN(fin.getTime())) {
    throw new AppError("Las fechas proporcionadas no son válidas.", 400);
  }

  if (inicio > fin) {
    throw new AppError(
      "La fecha inicio no puede ser mayor que la fecha final.",
      400,
    );
  }
};

//ventas por dia
export const mostrarVentasDia = async (fechaInicio, fechaFin) => {
  validarFechas(fechaInicio, fechaFin);
  return await dashboardModal.obtenerVentasDia(fechaInicio, fechaFin);
};

//ventas por semana
export const mostrarVentasSemana = async (fechaInicio, fechaFin) => {
  validarFechas(fechaInicio, fechaFin);

  return await dashboardModal.obtenerVentasSemana(fechaInicio, fechaFin);
};

//ventas por mes
export const mostrarVentasMes = async (fechaInicio, fechaFin) => {
  validarFechas(fechaInicio, fechaFin);

  return await dashboardModal.obtenerVentasMes(fechaInicio, fechaFin);
};

//últimos pedidos
export const mostrarUltimosPedidos = async () => {
  return await dashboardModal.obtenerUltimosPedidos();
};

//productos más vendido
export const mostrarProductoTop = async () => {
  return await dashboardModal.obtenerProductosTop();
};

//mesero con mas ventas
export const mostrarTopMesero = async () => {
  return await dashboardModal.obtenerTopMeseros();
};

// resumen
export const mostrarResumen = async () => {
  return await dashboardModal.obtenerResumen();
};
