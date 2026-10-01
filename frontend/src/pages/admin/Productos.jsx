import { useEffect, useState } from "react";
import Modal from "../../components/Modal.jsx";
import Spinner from "../../components/Spinner.jsx";
import ProductoTable from "../../components/ProductosTable.jsx";
import ProductosForm from "../../components/ProductosForm.jsx";
import BuscarInput from "../../components/BuscarInput.jsx";

import {
  cambiarEstadoProducto,
  eliminarProducto,
  mostrarProductos,
} from "../../services/productosService.js";
import "../../Estilos/Productos.css";
import { Plus } from "lucide-react";
import Paginacion from "../../components/Paginacion.jsx";
import SelectLimit from "../../components/SelectLimit.jsx";
import {
  cerrarAlerta,
  confirmar,
  mostrarCarga,
  mostrarError,
  mostrarExito,
} from "../../utils/alertas.js";
import { obtenerCategorias } from "../../services/categoriasService.js";

function Productos() {
  const [productos, setProductos] = useState([]);
  const [actualizandoId, setActualizandoId] = useState(null);

  const [editarProductos, setEditarProductos] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);

  //buscador
  const [buscar, setBuscar] = useState("");
  const [textoBuscar, setTextoBuscar] = useState("");
  const [estado, setEstado] = useState("");
  const [orden, setOrden] = useState("");
  //paginacion
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [categoria, setCategoria] = useState("");
  const [categorias, setCategorias] = useState([]);
  const [totalPaginas, setTotalPaginas] = useState(1);

  const [cargando, setCargando] = useState(false);

  const cargarProductos = async () => {
    try {
      setCargando(true);
      const respuesta = await mostrarProductos({
        buscar,
        page,
        limit,
        categoria,
        estado,
        orden,
      });

      setProductos(respuesta.productos);
      setTotalPaginas(respuesta.totalPages);
    } catch (error) {
      console.error(error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarProductos();
  }, [buscar, page, limit, categoria, estado, orden]);

  const cargarCategorias = async () => {
    try {
      const respuesta = await obtenerCategorias();

      setCategorias(respuesta);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    cargarCategorias();
  }, []);

  //useEffect para que dure 5 segundo para la busqueda
  useEffect(() => {
    const tiempo = setTimeout(() => {
      setBuscar(textoBuscar);
    }, 500);

    return () => clearTimeout(tiempo);
  }, [textoBuscar]);

  const nuevoProducto = () => {
    setEditarProductos(null);

    setMostrarModal(true);
  };

  const handleEditar = (producto) => {
    setEditarProductos(producto);

    setMostrarModal(true);
  };

  const cerrarModal = () => {
    setMostrarModal(false);

    setEditarProductos(null);
  };

  const handleCambiarEstado = async (id, estado) => {
    if (actualizandoId === id) return;

    const respuesta = await confirmar({
      titulo: "¿Cambiar estado?",
      texto: `El producto pasará a "${estado}".`,
      confirmText: "Sí, cambiar.",
    });

    if (!respuesta.isConfirmed) return;
    try {
      setActualizandoId(id);

      mostrarCarga("Actualizando estado...");

      await cambiarEstadoProducto(id, estado);

      await cargarProductos();

      cerrarAlerta();

      await mostrarExito("Estado actualizado");
    } catch (error) {
      cerrarAlerta();

      mostrarError(
        error?.response?.data?.mensaje || "No fue posible cambiar el estado.",
      );
    } finally {
      setActualizandoId(null);
    }
  };

  //eliminar
  const handleEliminar = async (id) => {
    const resultado = await confirmar({
      titulo: "¿Eliminar producto?",
      texto: "Esta acción no se puede deshacer.",
      icono: "warning",
      showCancelButton: true,
      confirmText: "Sí, eliminar",
    });

    if (!resultado.isConfirmed) {
      return;
    }
    try {
      mostrarCarga("Eliminar producto");

      const respuesta = await eliminarProducto(id);

      cargarProductos();

      cerrarAlerta();

      await mostrarExito(respuesta.mensaje);
    } catch (error) {
      console.error(error);

      mostrarError(
        error?.response?.data?.mensaje || "No se pudo eliminar el producto.",
      );
    }
  };
  const limpiarFiltros = () => {
    setTextoBuscar("");
    setBuscar("");

    setCategoria("");
    setEstado("");
    setOrden("");

    setPage(1);
  };

  return (
    <div>
      <header className="header-productos">
        <h2>Productos</h2>
      </header>

      <div className="contenedor-productos-encabezado">
        <div className="container-listaP-btn">
          <h2>Lista de Productos</h2>
          <button
            className="btn-nuevo-producto"
            onClick={nuevoProducto}
          >
            <Plus /> Nuevo Producto
          </button>
        </div>
        <div className="container-buscar-limpiar-filtro">
          <div className="buscarproductos">
            <BuscarInput
              value={textoBuscar}
              onChange={setTextoBuscar}
              placeholder="Buscar productos..."
            />
          </div>

          <div className="container-btn-limpiar">
            <button
              className="btn-limpiar-filtros"
              onClick={limpiarFiltros}
            >
              Limpiar filtros
            </button>
          </div>
          <div className="container-filtros-select">
            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
            >
              <option value="">Todas las categorias</option>
              {categorias.map((cat) => (
                <option
                  key={cat.id}
                  value={cat.id}
                >
                  {cat.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="container-filtros-select">
            <select
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
            >
              <option value="">Todos los estados</option>
              <option value="Disponible">Disponible</option>
              <option value="Agotado">Agotado</option>
              <option value="Inactivo">Inactivo</option>
            </select>
          </div>

          <div className="container-filtros-select">
            <select
              value={orden}
              onChange={(e) => setOrden(e.target.value)}
            >
              <option value="">Ordenar</option>
              <option value="nombre_asc">Nombre A-Z</option>
              <option value="nombre_desc">Nombre Z-A</option>
              <option value="precio_asc">Precio menor</option>
              <option value="precio_desc">Precio mayor</option>
              <option value="reciente">Más recientes</option>
              <option value="antiguo">Más antiguos</option>
            </select>
          </div>
        </div>
      </div>
      {cargando ? (
        <Spinner />
      ) : (
        <div>
          <ProductoTable
            productos={productos}
            handleCambiarEstado={handleCambiarEstado}
            handleEditar={handleEditar}
            handleEliminar={handleEliminar}
            actualizandoId={actualizandoId}
          />

          <div className="container-page-limit">
            <div className="container-selectLimit">
              <SelectLimit
                value={limit}
                onChange={setLimit}
              />
            </div>
            <Paginacion
              pagina={page}
              totalPaginas={totalPaginas}
              onPageChange={setPage}
            />
          </div>
        </div>
      )}
      <Modal
        abierto={mostrarModal}
        cerrar={cerrarModal}
        titulo={editarProductos ? "Editar Producto" : "Nuevo Producto"}
      >
        <ProductosForm
          editarProductos={editarProductos}
          cargarProductos={cargarProductos}
          cerrarModal={cerrarModal}
        />
      </Modal>
    </div>
  );
}

export default Productos;
