import API from "../api/api.js";

export const mostrarResumen = async () => {
  const respuesta = await API.get("/dashboard/resumen");
  return respuesta.data;
};

export const mostrarVentasDia = async (fechaInicio, fechaFin) => {
  const params = { fechaInicio, fechaFin };

  const respuesta = await API.get("/dashboard/ventas-dia", { params });
  return respuesta.data;
};

export const mostrarVentasSemana = async (fechaInicio, fechaFin) => {
  const params = { fechaInicio, fechaFin };

  const respuesta = await API.get("/dashboard/ventas-semana", { params });

  return respuesta.data;
};

export const mostrarVentasMes = async (fechaInicio, fechaFin) => {
  const params = { fechaInicio, fechaFin };

  const respuesta = await API.get("/dashboard/ventas-mes", { params });

  return respuesta.data;
};

export const mostrarUltimosProductos = async () => {
  const respuesta = await API.get("/dashboard/ultimos-pedidos");
  return respuesta.data;
};

export const mostrarProductosTop = async () => {
  const respuesta = await API.get("/dashboard/productos-top");

  return respuesta.data;
};

export const mostrarTopMeseros = async () => {
  const respuesta = await API.get("/dashboard/top-meseros");

  return respuesta.data;
};
