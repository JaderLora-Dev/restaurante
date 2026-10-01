import { useState, useEffect } from "react";
import {
  cerrarAlerta,
  mostrarCarga,
  mostrarError,
  mostrarExito,
} from "../utils/alertas.js";
import { actualizarUsuario, crearUsuario } from "../services/usuarioService.js";
import "../Estilos/UsuariosForm.css";
function UsuarioForm({ usuarioEditar, cerrarModel, cargarUsuarios }) {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [contraseña, setContraseña] = useState("");
  const [rol, setRol] = useState("mesero");

  useEffect(() => {
    if (usuarioEditar) {
      setNombre(usuarioEditar.nombre);
      setEmail(usuarioEditar.email);
      setContraseña("");
      setRol(usuarioEditar.rol);
    } else {
      setNombre("");
      setEmail("");
      setContraseña("");
      setRol("mesero");
    }
  }, [usuarioEditar]);

  const guardarUsuarios = async (e) => {
    e.preventDefault();

    try {
      if (usuarioEditar) {
        mostrarCarga("Actualizando usuario...");

        await actualizarUsuario(usuarioEditar.idUsuarios, {
          nombre,
          email,
          contraseña,
          rol,
        });

        cerrarAlerta();

        await mostrarExito("Usuario actualizado correctamente.");
      } else {
        mostrarCarga("Guardando usuario..");

        await crearUsuario({ nombre, email, contraseña, rol });

        cerrarAlerta();

        await mostrarExito("Usuario guardado correctamente.");
      }

      await cargarUsuarios();

      cerrarModel();
    } catch (error) {
      cerrarAlerta();

      mostrarError(
        error?.response?.data.mensaje || "No se pudo guardar el usuario.",
      );
    }
  };

  return (
    <section>
      <form
        className="container-formulario-usuario"
        onSubmit={guardarUsuarios}
      >
        <div className="contenedor-interno-usuario">
          <label>Nombre</label>
          <input
            type="text"
            placeholder="Nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />

          <label>Correo electronico</label>
          <input
            type="email"
            placeholder="Correo electronico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label> {usuarioEditar ? "Nueva contraseña" : "Contraseña"}</label>
          <input
            type="password"
            placeholder={
              usuarioEditar ? "Dejar vacío para conservarla" : "Contraseña"
            }
            value={contraseña}
            onChange={(e) => setContraseña(e.target.value)}
            required={!usuarioEditar}
          />

          <label>Rol</label>
          <select
            name="rol"
            value={rol}
            onChange={(e) => setRol(e.target.value)}
          >
            <option value="mesero">Mesero</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <button
          className="btn-crear-usuario"
          type="submit"
        >
          {" "}
          {usuarioEditar ? "Actualizar" : "Guardar"}
        </button>
      </form>
    </section>
  );
}

export default UsuarioForm;
