import * as dashboardService from "../services/dashboard.service.js";

//ventas del dia
export const VentasDia = async (req, res, next) => {
  try {
    const { fechaInicio, fechaFin } = req.query;

    const datos = await dashboardService.mostrarVentasDia(
      fechaInicio,
      fechaFin,
    );

    return res.status(200).json(datos);
  } catch (error) {
    next(error);
  }
};

// ventas por semana
export const ventasSemana = async (req, res, next) => {
  try {
    // capturar las fechas que vienen de la url
    const { fechaInicio, fechaFin } = req.query;

    const data = await dashboardService.mostrarVentasSemana(
      fechaInicio,
      fechaFin,
    );

    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

//ventas por mes
export const ventasMes = async (req, res, next) => {
  try {
    const { fechaInicio, fechaFin } = req.query;

    const datos = await dashboardService.mostrarVentasMes(
      fechaInicio,
      fechaFin,
    );

    return res.status(200).json(datos);
  } catch (error) {
    next(error);
  }
};

//ultimos productos
export const ultimosPedidos = async (req, res, next) => {
  try {
    const data = await dashboardService.mostrarUltimosPedidos();

    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

//productos top
export const productosTop = async (req, res, next) => {
  try {
    const data = await dashboardService.mostrarProductoTop();

    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

//top meseros
export const topMeseros = async (req, res, next) => {
  try {
    const data = await dashboardService.mostrarTopMesero();

    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

//resumen
export const resumenDashboard = async (req, res, next) => {
  try {
    const data = await dashboardService.mostrarResumen();

    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};
