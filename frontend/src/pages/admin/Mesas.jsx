import { useEffect, useState } from "react";
import "../../Estilos/Mesas.css";
import { borrarMesa, mostrarMesas } from "../../services/mesasService";
import {
  cerrarAlerta,
  confirmar,
  mostrarCarga,
  mostrarError,
  mostrarExito,
} from "../../utils/alertas";
import MesaTable from "../../components/MesaTable";
import Modal from "../../components/Modal";
import BuscarInput from "../../components/BuscarInput.jsx";
import MesaForm from "../../components/MesaForm";
import { Plus } from "lucide-react";
import Spinner from "../../components/Spinner.jsx";

function Mesas() {
  const [mesas, setMesas] = useState([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [buscar, setBuscar] = useState("");
  const [textoBuscar, setTextoBuscar] = useState("");
  const [estado, setEstado] = useState("");
  const [orden, setOrden] = useState("");
  const [mesaEditar, setMesaEditar] = useState(null);
  const [cargando, setCargando] = useState(false);

  /* useEfe para el buscador*/
  useEffect(() => {
    const tiempo = setTimeout(() => {
      setBuscar(textoBuscar);
    }, 500);
    return () => clearTimeout(tiempo);
  }, [textoBuscar]);

  useEffect(() => {
    cargarMesas();
  }, [buscar, estado, orden]);

  const cargarMesas = async () => {
    setCargando(true);
    try {
      const respuesta = await mostrarMesas(buscar, estado, orden);

      setMesas(respuesta);
    } catch (error) {
      console.error(error);
    } finally {
      setCargando(false);
    }
  };

  const nuevaMesa = () => {
    setMesaEditar(null);

    setMostrarModal(true);
  };

  const editarMesa = (mesa) => {
    setMesaEditar(mesa);

    setMostrarModal(true);
  };

  const cerrarModal = () => {
    setMostrarModal(false);

    setMesaEditar(null);
  };

  const eliminarMesa = async (id) => {
    const respuesta = await confirmar({
      titulo: "¿Eliminar mesa?",
      texto: "Esta acción no se puede desahacer.",
      icono: "warning",
      showCancelButton: true,
      confirmText: "Sí, eliminar",
    });

    if (!respuesta.isConfirmed) {
      return;
    }

    try {
      mostrarCarga("Eliminar mesa...");

      const resultado = await borrarMesa(id);

      await cargarMesas();

      cerrarAlerta();

      await mostrarExito(resultado.mensaje);
    } catch (error) {
      cerrarAlerta();
      mostrarError(
        error.response?.data?.mensaje || "No se pudo eliminar la mesa",
      );
    }
  };

  return (
    <div>
      <header className="header-mesas">
        <h2>Mesas</h2>
      </header>

      <div className="container-padre-mesas">
        <div className="container-titulos-mesas">
          <h2>Lista de mesas</h2>
          <button
            className="btn-nueva-mesas"
            onClick={nuevaMesa}
          >
            <Plus />
            Nueva mesa
          </button>
        </div>

        <div className="contenido-estado-buscar">
          <div>
            <BuscarInput
              value={textoBuscar}
              onChange={setTextoBuscar}
              placeholder="Buscar mesas..."
            />
          </div>

          <div className="container-button-mesa">
            <button
              className="btn-filtro-mesa"
              onClick={() => {
                setTextoBuscar("");
                setEstado("");
                setOrden("");
              }}
            >
              Limpiar filtros
            </button>
          </div>

          <div className="container-selec-mesas">
            <select
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
            >
              <option value="">Todos los estados</option>
              <option value="Disponible">Disponible</option>
              <option value="Ocupada">Ocupada</option>
              <option value="Inactiva">Inactiva</option>
            </select>
          </div>
          <div className="container-selec-mesas">
            <select
              value={orden}
              onChange={(e) => setOrden(e.target.value)}
            >
              <option value="">Ordenes</option>
              <option value="recientes">Más recientes</option>
              <option value="antiguas">Más antiguas</option>
              <option value="numero_asc">Número ascendente</option>
              <option value="numero_desc">Número descendente</option>
            </select>
          </div>
        </div>
      </div>
      {cargando ? (
        <Spinner />
      ) : (
        <MesaTable
          mesas={mesas}
          handleEditar={editarMesa}
          handleEliminar={eliminarMesa}
        />
      )}

      <Modal
        abierto={mostrarModal}
        cerrar={cerrarModal}
        titulo={mesaEditar ? "Editar mesa" : "Nueva mesa"}
      >
        <MesaForm
          mesaEditar={mesaEditar}
          cerrarModal={cerrarModal}
          cargarMesas={cargarMesas}
        />
      </Modal>
    </div>
  );
}

export default Mesas;
