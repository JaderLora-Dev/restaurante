import API from "../api/api.js";

//obtener
export const mostrarUsuarios = async () => {
  const res = await API.get("/usuarios");
  return res.data;
};

//crear
export const crearUsuario = async (data) => {
  const res = await API.post("/usuarios", data);
  return res.data;
};

//actualizar
export const actualizarUsuario = async (id, data) => {
  const res = await API.put(`/usuarios/${id}`, data);

  return res.data;
};

export const cambiarEstadoUsuario = async (id, estado) => {
  const res = await API.patch(`/usuarios/${id}/estado`, { estado });

  return res.data;
};

//eliminar
export const eliminarUsuario = async (id) => {
  const res = await API.delete(`/usuarios/${id}`);
  return res.data;
};
