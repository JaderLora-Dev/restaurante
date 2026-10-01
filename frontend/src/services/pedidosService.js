import API from "../api/api.js";

export const mostrarPedidos = async ({
  page = 1,
  limit = 10,
  estado = "",
  mesero = "",
  mesa = "",
} = {}) => {
  const params = { page, limit, estado, mesero, mesa };
  const res = await API.get("/pedidos", { params });

  return res.data;
};

export const mostrarPedidoId = async (idPedido) => {
  const res = await API.get(`/pedidos/${idPedido}`);

  return res.data;
};

//crear pedidos
export const crearPedido = async (data) => {
  const res = await API.post("/pedidos", data);

  return res.data;
};

//obtener pedido activo mesa
export const obtenerPedidoMesa = async (idMesa) => {
  const res = await API.get(`/pedidos/mesa/${idMesa}`);

  return res.data;
};

//obtener pedidos activos
export const obtenerPedidosActivos = async () => {
  const res = await API.get("/pedidos/activos");

  return res.data;
};

export const cambiarEstadoPedido = async (id, estado) => {
  const res = await API.patch(`/pedidos/${id}/estado`, { estado });

  return res.data;
};
//cambiar estado

//eliminar
export const eliminarPedido = async (id) => {
  const res = await API.delete(`/pedidos/${id}`);

  return res.data;
};
