import { useEffect, useState } from "react";
import {
  cerrarAlerta,
  mostrarCarga,
  mostrarError,
  mostrarExito,
} from "../utils/alertas.js";
import { agregarMesa, editarMesa } from "../services/mesasService.js";
import "../Estilos/MesaForm.css";
function MesaForm({ cargarMesas, cerrarModal, mesaEditar }) {
  const [numero, setNumero] = useState("");
  const [estado, setEstado] = useState("Disponible");

  useEffect(() => {
    if (mesaEditar) {
      setNumero(mesaEditar.numero);
      setEstado(mesaEditar.estado);
    } else {
      setNumero("");
      setEstado("Disponible");
    }
  }, [mesaEditar]);

  const guardarMesa = async (e) => {
    e.preventDefault();

    try {
      if (mesaEditar) {
        mostrarCarga("Actualizando mesa...");

        await editarMesa(mesaEditar.idMesas, { numero, estado });

        cerrarAlerta();

        mostrarExito("Mesa actualizada correctamente.");
      } else {
        mostrarCarga("Guardando mesa...");

        await agregarMesa({ numero, estado });

        cerrarAlerta();

        mostrarExito("Mesa guardada correctamente.");
      }

      await cargarMesas();

      cerrarModal();
    } catch (error) {
      cerrarAlerta();

      mostrarError(
        error?.response?.data.mensaje || "No se pudo guardar la mesa",
      );
    }
  };

  return (
    <div>
      {/* formulario */}
      <form
        className="container-formulario-mesa"
        onSubmit={guardarMesa}
      >
        <div className="formulario-mesa">
          <label>Numero</label>
          <input
            type="number"
            min={1}
            value={numero}
            onChange={(e) => setNumero(e.target.value)}
            required
          />

          <label>Estado</label>
          <select
            value={estado}
            disabled={mesaEditar && mesaEditar.estado === "Ocupada"}
            onChange={(e) => setEstado(e.target.value)}
          >
            <option value="">Seleciona</option>
            <option value="Disponible">Disponible</option>
            <option value="Inactiva">Inactiva</option>
            <option value="Ocupada">Ocupada</option>
          </select>

          <button
            className="buton-crear-mesa"
            type="submit"
          >
            {mesaEditar ? "Actualizar" : "Guardar"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default MesaForm;
