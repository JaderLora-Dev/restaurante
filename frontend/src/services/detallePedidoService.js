import API from "../api/api";

export const mostrarDetallePedido = async (idPedido) => {
  const respuesta = await API.get(`/detalle-pedido/pedido/${idPedido}`);

  return respuesta.data;
};

export const crearDetallePedido = async (data) => {
  const respuesta = await API.post("/detalle-pedido", data);

  return respuesta.data;
};

//actualizar pedido
export const actualizarDetallePedido = async (idPedido, data) => {
  const respuesta = await API.put(`/detalle-pedido/${idPedido}`, data);

  return respuesta.data;
};

//eliminar
export const eliminarDetallePedido = async (id) => {
  const respuesta = await API.delete(`/detalle-Pedido/${id}`);

  return respuesta.data;
};
