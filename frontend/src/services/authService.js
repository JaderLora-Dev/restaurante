import API from "../api/api.js";

export const login = async (email, contraseña) => {
  const res = await API.post("/login", {
    email,
    contraseña,
  });

  return res.data;
};

export const obtenerUsuarioActual = async () => {
  const respuesta = await API.get("/me");

  return respuesta.data;
};

//cerrar sesion
export const cerrarSesion = async () => {
  const respuesta = await API.post("/logout");

  return respuesta.data;
};
