import API from "../api/api.js";

export const obtenerCategorias = async (buscar = "", estado, orden) => {
  const params = { estado, orden };

  if (buscar.trim() !== "") {
    params.buscar = buscar;
  }

  const respuesta = await API.get("/categorias", { params });

  return respuesta.data;
};

//crear
export const crearCategoria = async (data) => {
  const respuesta = await API.post("/categorias", data);

  return respuesta.data;
};

//actualizar
export const actualizarCategoria = async (id, data) => {
  const respuesta = await API.put(`/categorias/${id}`, data);

  return respuesta.data;
};

//cambiar estado
export const cambiarEstadoCategoria = async (id, estado) => {
  const respuesta = await API.patch(`/categorias/${id}/estado`, { estado });

  return respuesta.data;
};

//eliminar
export const eliminarCategoria = async (id) => {
  const respuesta = await API.delete(`/categorias/${id}`);

  return respuesta.data;
};
