import { useState, useEffect } from "react";
import { mostrarPedidos } from "../../services/pedidosService.js";
import SelectLimit from "../../components/SelectLimit.jsx";
import Paginacion from "../../components/Paginacion.jsx";
import { mostrarUsuarios } from "../../services/usuarioService.js";
import { mostrarMesas } from "../../services/mesasService.js";
import "../../Estilos/Pedidos.css";
import { Calendar1, Circle } from "lucide-react";
import Modal from "../../components/Modal.jsx";
import DetallePedido from "../../components/DetallePedido.jsx";
import Spinner from "../../components/Spinner.jsx";
function Pedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [estado, setEstado] = useState("");
  const [cargando, setCargando] = useState(false);
  const [meseros, setMeseros] = useState([]);
  const [mesero, setMesero] = useState("");
  const [mesas, setMesas] = useState([]);
  const [mesa, setMesa] = useState("");
  const [mostrarModal, setMostrarModal] = useState(false);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);

  useEffect(() => {
    const cargarFiltros = async () => {
      try {
        const usuarios = await mostrarUsuarios();
        const mesasRespuessta = await mostrarMesas();

        setMeseros(usuarios.filter((usuario) => usuario.rol === "mesero"));

        setMesas(mesasRespuessta);
      } catch (error) {
        console.error("error al cargar el filtro", error);
      }
    };

    cargarFiltros();
  }, []);

  const cargarPedidos = async () => {
    setCargando(true);
    try {
      const respuesta = await mostrarPedidos({
        page,
        limit,
        estado,
        mesero,
        mesa,
      });

      setPedidos(respuesta.pedidos);
      setTotalPaginas(respuesta.totalPages);
    } catch (error) {
      console.error(error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarPedidos();
  }, [page, limit, estado, mesero, mesa]);

  //mostrar detalle
  const verDetalle = (pedido) => {
    setPedidoSeleccionado(pedido);
    setMostrarModal(true);
  };

  //cerrar modal
  const cerrarModal = () => {
    setMostrarModal(false);

    setPedidoSeleccionado(null);
  };

  return (
    <section>
      <header className="header-pedidos-admin">
        <h2>Lista de pedidos</h2>
      </header>
      <div className="container-filtros-pedidos-admin">
        <h2 className="titulo-listaPedidos">Lista de pedidos</h2>
        <div className="filtros-pedidos-admin">
          <select
            value={estado}
            onChange={(e) => {
              setEstado(e.target.value);
              setPage(1);
            }}
          >
            <option value="">Todos los estados</option>
            <option value="Activo">Activos</option>
            <option value="Finalizado">Finalizados</option>
            <option value="Cancelado">Cancelados</option>
          </select>

          <select
            value={mesero}
            onChange={(e) => {
              setMesero(e.target.value);
              setPage(1);
            }}
          >
            <option value="">Todos los meseros</option>

            {meseros.map((usuario) => (
              <option
                key={usuario.idUsuarios}
                value={usuario.idUsuarios}
              >
                {usuario.nombre}
              </option>
            ))}
          </select>

          <select
            value={mesa}
            onChange={(e) => {
              setMesa(e.target.value);
              setPage(1);
            }}
          >
            <option value="">Todas las mesas</option>

            {mesas.map((mesaItem) => (
              <option
                key={mesaItem.idMesas}
                value={mesaItem.idMesas}
              >
                mesa {mesaItem.numero}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="container-pedidos-administrador">
        <div className="encabezado-pedidos-admin">
          <div>ID</div>
          <div>Mesa</div>
          <div>Estado</div>
          <div>Mesero</div>
          <div>Total</div>
          <div>Fecha</div>
          <div>Accion</div>
        </div>
        {cargando ? (
          <Spinner />
        ) : (
          <div className="container-pedidos-admin">
            {pedidos.length === 0 ? (
              <p>No hay pedidos registrados</p>
            ) : (
              pedidos.map((pedido) => (
                <div
                  className="container-pedidos-admin-hijo"
                  key={pedido.idPedidos}
                >
                  <div className="pedidos-telefono-admin">
                    <div className="conenido-del-pedido-1rows">
                      <span className="num-pedidos-admin">
                        #{pedido.idPedidos}{" "}
                      </span>
                      <span
                        className={`estado-admin-p pedi-esta-${pedido.estado}`}
                      >
                        <Circle /> {pedido.estado}
                      </span>
                      <span
                        className={`total-pedido-admin total-${pedido.estado}`}
                      >
                        ${Number(pedido.total).toLocaleString("es-CO")}
                      </span>
                    </div>
                    <div className="contenido-mesa-mesero">
                      <span> Mesa {pedido.mesa} </span>
                      <span> Mesero {pedido.mesero} </span>
                    </div>
                    <span className="fecha-pedidos-admin">
                      <Calendar1 /> Fecha{" "}
                      {new Date(pedido.fecha).toLocaleString("es-CO")}
                    </span>

                    <button
                      className="btn-VerDetalle-admin"
                      onClick={() => verDetalle(pedido)}
                    >
                      Ver detalle
                    </button>
                  </div>

                  <div className="pedidos-pc-admin">
                    <div className="num-pedidos-admin">
                      {" "}
                      {pedido.idPedidos}{" "}
                    </div>
                    <div className="mesa-pedidos-admin">
                      {" "}
                      Mesa {pedido.mesa}{" "}
                    </div>
                    <div
                      className={`estado-admin-p pedi-esta-${pedido.estado}`}
                    >
                      <Circle /> {pedido.estado}{" "}
                    </div>
                    <div className="mesero-pedidos-admin">
                      {" "}
                      {pedido.mesero}{" "}
                    </div>
                    <div
                      className={`total-pedido-admin total-${pedido.estado}`}
                    >
                      ${Number(pedido.total).toLocaleString("es-CO")}
                    </div>
                    <div className="fecha-pedidos-admin">
                      <strong>
                        {new Date(pedido.fecha).toLocaleDateString("es-CO")}
                      </strong>
                      {new Date(pedido.fecha).toLocaleTimeString("es-CO")}
                    </div>
                    <div>
                      <button
                        className="btn-VerDetalle-admin"
                        onClick={() => verDetalle(pedido)}
                      >
                        Ver detalle
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {pedidoSeleccionado && (
        <Modal
          abierto={mostrarModal}
          cerrar={cerrarModal}
          titulo={`Detalle del pedido #${pedidoSeleccionado.idPedidos}`}
        >
          <DetallePedido
            total={pedidoSeleccionado.total}
            idPedido={pedidoSeleccionado.idPedidos}
            modo="admin"
          />
        </Modal>
      )}
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
    </section>
  );
}

export default Pedidos;
