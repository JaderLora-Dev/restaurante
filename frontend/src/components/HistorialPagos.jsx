import { useEffect, useState } from "react";
import { mostrarPagos, obtenerComprobante } from "../services/pagos.service.js";
import Modal from "./Modal.jsx";
import Comprobante from "./Comprobante.jsx";
import SelectLimit from "./SelectLimit.jsx";
import Paginacion from "./Paginacion.jsx";
import { mostrarExito } from "../utils/alertas.js";
import "../Estilos/HistorialPagos.css";
import { Table } from "lucide-react";

function HistorialPagos() {
  const [pagos, setPagos] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [metodoPago, setMetodoPago] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [comprobante, setComprobante] = useState(null);
  const [mostrarComprobante, setMostrarComprobante] = useState(false);

  useEffect(() => {
    cargarPagos();
  }, [page, limit, metodoPago, fechaInicio, fechaFin]);

  const cargarPagos = async () => {
    try {
      const respuesta = await mostrarPagos({
        page,
        limit,
        metodoPago,
        fechaInicio,
        fechaFin,
      });

      setPagos(respuesta.pagos);
      setTotalPaginas(respuesta.totalPages);
    } catch (error) {
      console.error(error);
    }
  };

  const handleVerComprobante = async (idPedido) => {
    try {
      const respuesta = await obtenerComprobante(idPedido);

      setComprobante(respuesta);
      setMostrarComprobante(true);
    } catch (error) {
      mostrarExito(
        error?.response?.data.mensaje || "No se pudo obtener el comprobante.",
      );
    }
  };

  return (
    <section>
      <header className="header-historial-pagos">
        <h2>Historial de pagos</h2>
      </header>
      <div className="container-filtro-historial-pagos">
        <h2>Historial de pagos</h2>
        <div className="filtros-historial-Pagos">
          <div>
            <select
              value={metodoPago}
              onChange={(e) => {
                setMetodoPago(e.target.value);
                setPage(1);
              }}
            >
              <option value="">Método de pago</option>
              <option value="Efectivo">Efectivo</option>
              <option value="Nequi">Nequi</option>
              <option value="Transferencia">Transferencia</option>
              <option value="Tarjeta">Tarjeta</option>
            </select>
          </div>

          <div>
            <button
              onClick={() => {
                (setMetodoPago(""), setFechaInicio(""), setFechaFin(""));
              }}
            >
              Limpiar filtros
            </button>
          </div>
          <div className="container-fecha-pagos">
            <label>Desde</label>

            <input
              type="date"
              value={fechaInicio}
              onChange={(e) => {
                setFechaInicio(e.target.value);
                setPage(1);
              }}
            />
          </div>

          <div className="container-fecha-pagos">
            <label>Hasta</label>

            <input
              type="date"
              value={fechaFin}
              onChange={(e) => {
                setFechaFin(e.target.value);
                setPage(1);
              }}
            />
          </div>
        </div>
      </div>

      <div className="container-historial-pagos">
        <div className="historial-encabezado-pagos">
          <span>ID Pagos</span>
          <span>ID Pedidos</span>
          <span>Fecha</span>
          <span>Mesa</span>
          <span>Mesero</span>
          <span>Método</span>
          <span>Total</span>
          <span>Acciones</span>
        </div>

        {pagos.length === 0 ? (
          <p>No hay pagos registrados</p>
        ) : (
          pagos.map((p) => (
            <div key={p.idPagos}>
              <div className="container-historial-movil">
                <div className="pagosH-filas-1">
                  <span>#{p.idPagos} </span>
                  <span>${Number(p.monto).toLocaleString("es-CO")} </span>
                  <span className={`metodo-${p.metodoPago}`}>
                    {p.metodoPago}
                  </span>
                </div>
                <div className="pagosH-filas-2">
                  <span> Mesa {p.mesa} </span>

                  <span> Mesero {p.mesero} </span>
                </div>

                <div className="pagosH-filas-3">
                  <span>
                    Fecha {new Date(p.fecha).toLocaleDateString("es-CO")}{" "}
                  </span>
                  <span> ID Pedidos {p.idPedidos} </span>
                </div>

                <div>
                  <button
                    type="button"
                    className="pagosH-boton"
                    onClick={() => handleVerComprobante(p.idPedidos)}
                  >
                    Ver comprobante
                  </button>
                </div>
              </div>

              <div className="container-historial-pc">
                <span> {p.idPagos} </span>
                <span> {p.idPedidos} </span>
                <div>
                  <strong>
                    {new Date(p.fecha).toLocaleDateString("es-CO")}
                  </strong>
                  {new Date(p.fecha).toLocaleTimeString("es-CO")}
                </div>
                <span>
                  <Table /> {p.mesa}
                </span>
                <span>{p.mesero}</span>
                <span className={`metodo-${p.metodoPago}`}>{p.metodoPago}</span>
                <span> ${Number(p.monto).toLocaleString("es-CO")} </span>
                <button
                  type="button"
                  onClick={() => handleVerComprobante(p.idPedidos)}
                >
                  Ver comprobante
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="historial-selec-paginacion">
        <div className="historial-limit">
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

      {comprobante && (
        <Modal
          abierto={mostrarComprobante}
          cerrar={() => {
            setMostrarComprobante(false);
            setComprobante(null);
          }}
        >
          <Comprobante
            datos={comprobante}
            cerrar={() => {
              setMostrarComprobante(false);
              setComprobante(null);
            }}
          />
        </Modal>
      )}
    </section>
  );
}

export default HistorialPagos;
