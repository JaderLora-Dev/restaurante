import API from "../api/api.js";

//mostrar mesas
export const mostrarMesas = async (buscar = "", estado, orden) => {
  const params = { estado, orden };

  if (buscar.trim() !== "") {
    params.buscar = buscar;
  }

  const respuesta = await API.get("/mesas", { params });
  return respuesta.data;
};

// mostrar por id
export const mostrarMesaId = async (id) => {
  const respuesta = await API.get(`/mesas/${id}`);

  return respuesta.data;
};

//crear
export const agregarMesa = async (data) => {
  const respuesta = await API.post("/mesas", data);
  return respuesta.data;
};

//actualizar
export const editarMesa = async (id, data) => {
  const respuesta = await API.put(`/mesas/${id}`, data);
  return respuesta.data;
};

//cambiar estado
export const cambiarEstadoMesa = async (id, estado) => {
  const respuesta = await API.patch(`/mesas/${id}/estado`, { estado });

  return respuesta.data;
};

//eliminar
export const borrarMesa = async (id) => {
  const respuesta = await API.delete(`/mesas/${id}`);
  return respuesta.data;
};
