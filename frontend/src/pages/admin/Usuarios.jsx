import { useState, useEffect } from "react";
import {
  cambiarEstadoUsuario,
  eliminarUsuario,
  mostrarUsuarios,
} from "../../services/usuarioService";
import UsuarioTable from "../../components/UsuarioTable.jsx";
import UsuarioForm from "../../components/UsuarioForm.jsx";
import Modal from "../../components/Modal";
import {
  cerrarAlerta,
  confirmar,
  mostrarCarga,
  mostrarError,
  mostrarExito,
} from "../../utils/alertas";
import { Plus } from "lucide-react";
import Spinner from "../../components/Spinner.jsx";
import "../../Estilos/Usuarios.css";

function Usuarios() {
  const [usuaraios, setUsuarios] = useState([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [usuarioEditar, setUsuarioEditar] = useState(null);
  const [actualizandoId, setActualizandoId] = useState(null);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const cargarUsuarios = async () => {
    setCargando(true);
    try {
      const respuesta = await mostrarUsuarios();

      setUsuarios(respuesta);
    } catch (error) {
      console.error(error);
    } finally {
      setCargando(false);
    }
  };

  const nuevoUsuario = () => {
    setUsuarioEditar(null);

    setMostrarModal(true);
  };

  const editarUsuario = (u) => {
    setUsuarioEditar(u);

    setMostrarModal(true);
  };

  const cerrarModal = () => {
    setMostrarModal(false);

    setUsuarioEditar(null);
  };

  const handleCambiarEstado = async (id, estado) => {
    if (actualizandoId === id) return;

    const respuesta = await confirmar({
      titulo: "¿Cambiar estado?",
      texto: `El usuario pasará a "${estado}".`,
      confirmText: "sí, cambiar",
    });

    if (!respuesta.isConfirmed) return;
    try {
      setActualizandoId(id);

      mostrarCarga("Actualizando estado...");

      await cambiarEstadoUsuario(id, estado);

      await cargarUsuarios();

      cerrarAlerta();

      await mostrarExito("Estado actualizado");
    } catch (error) {
      cerrarAlerta();

      mostrarError(
        error?.response?.data.mensaje || "No se puede cambiar el estado.",
      );
    } finally {
      setActualizandoId(null);
    }
  };

  const handleEliminarUsuario = async (id) => {
    const respuesta = await confirmar({
      titulo: "¿Eliminar usuario?",
      texto: "Esta acción no se puede desahacer.",
      icono: "warning",
      showCancelButton: true,
      confirmText: "Sí, eliminar",
    });

    if (!respuesta.isConfirmed) {
      return;
    }
    try {
      mostrarCarga("Eliminar usuario...");

      const resultado = await eliminarUsuario(id);

      await cargarUsuarios();

      cerrarAlerta();

      await mostrarExito(resultado.mensaje);
    } catch (error) {
      cerrarAlerta();

      mostrarError(
        error?.response?.data.mensaje || "No se pudo eliminar el usuario.",
      );
    }
  };

  return (
    <section>
      <header className="header-usuarios">
        <h2>Usuarios</h2>
      </header>
      <div className="container-titulos-usuarios">
        <h2>Lista de usuarios</h2>

        <button
          className="btn-nuevo-usuario"
          onClick={nuevoUsuario}
        >
          <Plus />
          Nuevo usuario
        </button>
      </div>

      {cargando ? (
        <Spinner />
      ) : (
        <UsuarioTable
          usuarios={usuaraios}
          handleCambiarEstado={handleCambiarEstado}
          handleEditar={editarUsuario}
          handleEliminar={handleEliminarUsuario}
          actualizandoId={actualizandoId}
        />
      )}

      <Modal
        abierto={mostrarModal}
        cerrar={cerrarModal}
        titulo={usuarioEditar ? "Editar usuarios" : "Nuevo usuario"}
      >
        <UsuarioForm
          usuarioEditar={usuarioEditar}
          cerrarModel={cerrarModal}
          cargarUsuarios={cargarUsuarios}
        />
      </Modal>
    </section>
  );
}

export default Usuarios;
