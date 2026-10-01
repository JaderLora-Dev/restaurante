import API from "../api/api.js";

//obtener productos
export const mostrarProductos = async ({
  buscar = "",
  page = 1,
  limit = 10,
  categoria,
  estado,
  orden,
} = {}) => {
  const params = { page, limit, categoria, estado, orden };

  if (buscar.trim() !== "") {
    params.buscar = buscar;
  }
  const respuesta = await API.get("/productos", { params });
  return respuesta.data;
};

//mostrar productos disponible
export const obtenerProductosDisponible = async ({
  buscar = "",
  page = 1,
  limit = 10,
  categoria,
} = {}) => {
  const params = { page, limit, categoria };

  if (buscar.trim() !== "") {
    params.buscar = buscar;
  }

  const respuesta = await API.get("/productos/disponible", { params });

  return respuesta.data;
};

//mostrar por id
export const mostrarProductoId = async (id) => {
  const respuesta = await API.get(`/productos/${id}`);

  return respuesta.data;
};

//crear productos
export const crearProductos = async (data) => {
  const respuesta = await API.post("/productos", data);

  return respuesta.data;
};

// actualizar productos
export const actualizarProducto = async (id, data) => {
  const respuesta = await API.put(`/productos/${id}`, data);

  return respuesta.data;
};

//actualizar productos
export const cambiarEstadoProducto = async (id, estado) => {
  const respuesta = await API.patch(`/productos/${id}/estado`, { estado });

  return respuesta.data;
};

// eliminar prodictos
export const eliminarProducto = async (id) => {
  const respuesta = await API.delete(`/productos/${id}`);

  return respuesta.data;
};
