import API from "../../src/api/api.js";

//mostrar pagos
export const mostrarPagos = async ({
  page = 1,
  limit = 10,
  metodoPago,
  fechaInicio,
  fechaFin,
} = {}) => {
  const params = { page, limit, metodoPago, fechaInicio, fechaFin };

  const res = await API.get("/pagos", { params });
  return res.data;
};
//crear pagos
export const crearPago = async (data) => {
  const res = await API.post("/pagos", data);

  return res.data;
};

//comprobante
export const obtenerComprobante = async (idPedido) => {
  const res = await API.get(`/pagos/comprobante/${idPedido}`);

  return res.data;
};
