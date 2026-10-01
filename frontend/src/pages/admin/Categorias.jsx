import { useEffect, useState } from "react";
import Modal from "../../components/Modal.jsx";
import CategoriaForm from "../../components/CategoriaForm.jsx";
import CategoriaTable from "../../components/CategoriaTable.jsx";

import {
  cambiarEstadoCategoria,
  eliminarCategoria,
  obtenerCategorias,
} from "../../services/categoriasService.js";

import "../../Estilos/Categorias.css";
import { Plus } from "lucide-react";
import {
  cerrarAlerta,
  confirmar,
  mostrarCarga,
  mostrarError,
  mostrarExito,
} from "../../utils/alertas.js";
import Spinner from "../../components/Spinner.jsx";
import BuscarInput from "../../components/BuscarInput.jsx";

function Categorias() {
  const [categorias, setCategorias] = useState([]);
  const [actualizandoId, setActualizandoId] = useState(null);

  const [mostrarModal, setMostrarModal] = useState(false);

  const [buscar, setBuscar] = useState("");
  const [estado, setEstado] = useState("");
  const [orden, setOrden] = useState("");

  const [categoriaEditar, setCategoriaEditar] = useState(null);
  const [cargando, setCargando] = useState(false);

  const cargarCategorias = async () => {
    try {
      setCargando(true);
      const respuesta = await obtenerCategorias(buscar, estado, orden);

      setCategorias(respuesta);
    } catch (error) {
      console.error(error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarCategorias();
  }, [buscar, estado, orden]);

  const nuevaCategoria = () => {
    setCategoriaEditar(null);

    setMostrarModal(true);
  };

  const editarCategoria = (categoria) => {
    setCategoriaEditar(categoria);

    setMostrarModal(true);
  };

  const cerrarModal = () => {
    setMostrarModal(false);

    setCategoriaEditar(null);
  };

  const estadoCategoria = async (id, estado) => {
    if (actualizandoId === id) return;
    const respuesta = await confirmar({
      titulo: "¿Cambiar estado?",
      texto: `La categoría pasará a "${estado}".`,
      confirmText: "Sí, cambiar.",
    });

    if (!respuesta.isConfirmed) return;

    try {
      setActualizandoId(id);

      mostrarCarga("Cambiando estado...");

      await cambiarEstadoCategoria(id, estado);

      await cargarCategorias();

      cerrarAlerta();

      await mostrarExito("Estado actualizado.");
    } catch (error) {
      cerrarAlerta();

      mostrarError(
        error?.response?.data?.mensaje || "No fue posible el cambio.",
      );
    } finally {
      setActualizandoId(null);
    }
  };

  const borrarCategoria = async (id) => {
    const respuesta = await confirmar({
      titulo: "¿Eliminar categoría?",
      texto: "Esta acción no se puede desahacer",
      icono: "warning",
      showCancelButton: true,
      confirmText: "Sí, eliminar",
    });
    if (!respuesta.isConfirmed) return;

    try {
      mostrarCarga("Eliminar producto");

      const resultado = await eliminarCategoria(id);

      await cargarCategorias();

      cerrarAlerta();

      await mostrarExito(resultado.mensaje);
    } catch (error) {
      console.error(error);
      mostrarError(
        error.response?.data?.mensaje || "No se puedo eliminar la categoria",
      );
    }
  };

  return (
    <div>
      <header className="header-categoria">
        <h2>Categorias</h2>
      </header>

      <div className="container-categorias-filtros">
        <div className="container-titulos">
          <h2>Lista de categorias</h2>
          <button
            className="btn-nueva-categoria"
            onClick={nuevaCategoria}
          >
            <Plus /> Nueva Categoria
          </button>
        </div>

        <div className="container-de-filtros-categoria">
          <div>
            <BuscarInput
              value={buscar}
              onChange={setBuscar}
              placeholder="Buscar categoria"
            />
          </div>
          <div>
            <button
              className="btn-limpiar-categoria"
              onClick={() => {
                setBuscar("");
                setEstado("");
                setOrden("");
              }}
            >
              Limpiar filtros
            </button>
          </div>
          <div className="select-filtros-categorias">
            <select
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
            >
              <option value="">Estados</option>
              <option value="Activo">Activo</option>
              <option value="Inactivo">Inactivo</option>
            </select>
          </div>
          <div className="select-filtros-categorias">
            <select
              value={orden}
              onChange={(e) => setOrden(e.target.value)}
            >
              <option value="">Ordenar</option>
              <option value="nombre_asc">Nombre A-Z</option>
              <option value="nombre_desc">Nombre Z-A</option>
              <option value="reciente">Más recientes</option>
              <option value="antiguo">Más antiguos</option>
            </select>
          </div>
        </div>
      </div>

      {cargando ? (
        <Spinner />
      ) : (
        <div className="categoria-contenedor">
          <CategoriaTable
            categorias={categorias}
            btnEditarEstado={estadoCategoria}
            btnEditar={editarCategoria}
            btnEliminar={borrarCategoria}
            actualizandoId={actualizandoId}
          />
        </div>
      )}

      <Modal
        abierto={mostrarModal}
        cerrar={cerrarModal}
        titulo={categoriaEditar ? "Editar categoria" : "Nueva categoria"}
      >
        <CategoriaForm
          categoriaEditar={categoriaEditar}
          cerrarModal={cerrarModal}
          cargarCategorias={cargarCategorias}
        />
      </Modal>
    </div>
  );
}

export default Categorias;
