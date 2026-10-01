import { useEffect, useState } from "react";
import {
  actualizarCategoria,
  crearCategoria,
} from "../services/categoriasService.js";
import "../Estilos/CategoriaForm.css";
import {
  cerrarAlerta,
  mostrarCarga,
  mostrarError,
  mostrarExito,
} from "../utils/alertas.js";

function CategoriaForm({ categoriaEditar, cerrarModal, cargarCategorias }) {
  const [nombre, setNombre] = useState("");
  const [estado, setEstado] = useState("Activo");
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (categoriaEditar) {
      setNombre(categoriaEditar.nombre);
      setEstado(categoriaEditar.estado);
    } else {
      setNombre("");
      setEstado("Activo");
    }
  }, [categoriaEditar]);

  const guardarCategoria = async (e) => {
    e.preventDefault();

    if (guardando) setGuardando(true);
    try {
      if (categoriaEditar) {
        mostrarCarga("Actualizando categoria...");

        await actualizarCategoria(categoriaEditar.id, { nombre, estado });

        cerrarAlerta();

        mostrarExito("Categoria actualizada correctamente.");
      } else {
        mostrarCarga("Guardando categoria...");

        await crearCategoria({ nombre, estado });

        cerrarAlerta();

        mostrarExito("Categoria guardada correctamente.");
      }
      await cargarCategorias();

      cerrarModal();
    } catch (error) {
      cerrarAlerta();

      mostrarError(
        error?.response?.data?.mensaje || "No se pudo guardar la categoria",
      );
      console.error(error);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div>
      <form
        className="contenedor-formuario"
        onSubmit={guardarCategoria}
      >
        <div className="contenedor-interno">
          <label> Nombre</label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
        </div>

        <select
          value={estado}
          onChange={(e) => setEstado(e.target.value)}
          required
        >
          <option value="">Seleccione</option>
          <option value="Activo">Activo</option>
          <option value="Inactivo">Inactivo</option>
        </select>

        <button
          className="btn-formulario"
          type="submit"
          disabled={guardando}
        >
          {guardando ? "Guardando" : categoriaEditar ? "Actualizar" : "Guardar"}
        </button>
      </form>
    </div>
  );
}

export default CategoriaForm;
