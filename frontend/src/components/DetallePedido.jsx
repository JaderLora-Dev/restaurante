import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { cambiarEstadoPedido } from "../services/pedidosService.js";
import {
  actualizarDetallePedido,
  eliminarDetallePedido,
  mostrarDetallePedido,
} from "../services/detallePedidoService.js";
import {
  cerrarAlerta,
  confirmar,
  mostrarCarga,
  mostrarError,
  mostrarExito,
} from "../utils/alertas.js";
import {
  CircleCheck,
  CircleX,
  MessageCircleMore,
  Minus,
  Plus,
  Printer,
  Trash2,
} from "lucide-react";
import "../Estilos/DetallePedido.css";
import Pago from "./Pago.jsx";
import Modal from "./Modal.jsx";
import { crearPago, obtenerComprobante } from "../services/pagos.service.js";
import Comprobante from "./Comprobante.jsx";
import Comanda from "./Comanda.jsx";
function DetallePedido({
  total,
  idPedido,
  pedido,
  cargarPedido,
  actualizarStock,
  modo = "mesero",
}) {
  const [detalle, setDetalle] = useState([]);
  const [observacion, setObservacion] = useState("");
  const [editandoObservacion, setEditandoObservacion] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [comprobante, setComprobante] = useState(null);
  const [comanda, setComanda] = useState(null);
  const [mostrarComanda, setMostrarComanda] = useState(false);
  const [mostrarComprobante, setMostrarComprobante] = useState(false);
  const navigate = useNavigate();

  const cargarDetalle = async () => {
    if (!idPedido) return;

    try {
      const respuesta = await mostrarDetallePedido(idPedido);

      setDetalle(respuesta);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    cargarDetalle();
  }, [idPedido, total]);

  //funcion para sumar la cantidad
  const handleSumar = async (item) => {
    try {
      await actualizarDetallePedido(item.idDetalle_pedido, {
        cantidad: item.cantidad + 1,
      });

      await cargarDetalle();
      await cargarPedido();
      await actualizarStock();
    } catch (error) {
      console.error(error);
      mostrarError(
        error?.response?.data?.mensaje || "No se puede agregar un producto",
      );
    }
  };

  //funcion para restar la cantidad
  const handleRestar = async (item) => {
    try {
      if (item.cantidad === 1) {
        await eliminarDetallePedido(item.idDetalle_pedido);
      } else {
        await actualizarDetallePedido(item.idDetalle_pedido, {
          cantidad: item.cantidad - 1,
        });
      }

      await cargarDetalle();
      await cargarPedido();
      await actualizarStock();
    } catch (error) {
      console.error(error);
      mostrarError(
        error?.response?.data.mensaje || "No se puede eliminar el producto",
      );
    }
  };

  //funcion eliminar
  const handleEliminar = async (item) => {
    const respuesta = await confirmar({
      titulo: "¿Eliminar producto?",
      texto: `Se eliminarán todas las ${item.cantidad} unidades de ${item.nombre}.`,
      icono: "warning",
      showCancelButton: true,
      confirmText: "Sí, eliminar",
    });
    if (!respuesta.isConfirmed) return;
    try {
      await eliminarDetallePedido(item.idDetalle_pedido);

      await cargarDetalle();
      await cargarPedido();
      await actualizarStock();

      await mostrarExito("Producto eliminado del pedido.");
    } catch (error) {
      mostrarError(
        error.response?.data?.mensaje || "No se pudo eliminar el producto.",
      );
    }
  };

  //funcion cancelar pedido
  const handleCancelarPedido = async () => {
    if (!idPedido) return;

    const respuesta = await confirmar({
      titulo: "¿Cancelar pedido?",
      texto: "Esta acción devolverá el stock y liberará la mesa.",
      icono: "warning",
      showCancelButton: true,
      confirmText: "Sí, cancelar",
    });

    if (!respuesta.isConfirmed) return;
    try {
      mostrarCarga("Cancelar pedido...");

      const resultado = await cambiarEstadoPedido(idPedido, "Cancelado");

      cerrarAlerta();

      await mostrarExito(resultado.mensaje);

      navigate("/mesero/mesas");
    } catch (error) {
      mostrarError(
        error.response?.data?.mensaje || "No se pudo cancelar el pedido.",
      );
    }
  };

  //funcion finalizar pedido
  const handleFinalizarPedido = async () => {
    if (!idPedido) return;
    const respuesta = await confirmar({
      titulo: "¿Finalizar pedido?",
      texto: "Se procederá a registrar el pago del pedido.",
      icono: "question",
      showCancelButton: true,
      confirmText: "Sí, finalizar",
    });

    if (!respuesta.isConfirmed) return;

    setMostrarModal(true);
  };

  const handlePagar = async (idPedidos, metodoPago, dineroRecibido) => {
    if (!idPedidos) return;

    try {
      mostrarCarga("Procesando pago...");
      const resultado = await crearPago({
        idPedidos,
        metodoPago,
        dineroRecibido,
      });

      const datosComprobante = await obtenerComprobante(idPedidos);

      cerrarAlerta();

      await mostrarExito(resultado.mensaje);

      cerrarModal();

      setComprobante(datosComprobante);
      setMostrarComprobante(true);
    } catch (error) {
      cerrarAlerta();
      console.error(error);

      mostrarError(
        error.response?.data?.mensaje || "Error al realizar el pago",
      );
    }
  };

  //funcion observaciones
  const handleAbrirObservacion = (item) => {
    setEditandoObservacion(item.idDetalle_pedido);
    setObservacion(item.observaciones || "");
  };

  const handleCancelarObservacion = () => {
    setEditandoObservacion(null);

    setObservacion("");
  };

  const handleGuardarObservacion = async (item) => {
    try {
      await actualizarDetallePedido(item.idDetalle_pedido, {
        cantidad: item.cantidad,
        observaciones: observacion,
      });

      await cargarDetalle();
      await cargarPedido();

      setEditandoObservacion(null);
      setObservacion("");
      await mostrarExito("Observación guardada.");
    } catch (error) {
      mostrarError(
        error.response?.data?.mensaje || "No se pudo guardar la observación.",
      );
    }
  };

  const cerrarModal = () => {
    setMostrarModal(false);
  };

  const abrirComanda = () => {
    setComanda({ ...pedido, detalle });
    setMostrarComanda(true);
  };

  const cerrarComprobante = () => {
    setMostrarComprobante(false);

    setComprobante(null);
    navigate("/mesero/mesas");
  };
  return (
    <section>
      <div className="detallePedido-container">
        <div className="contenedor-filas-detallePedido">
          {detalle.length === 0 ? (
            <div>
              <p>No hay productos agregados.</p>
              <p>Seleccione un producto para comenzar el pedido.</p>
            </div>
          ) : (
            detalle.map((item) => (
              <div
                className="card-detallePedido"
                key={item.idDetalle_pedido}
              >
                <div className="card-interno-detallePedido">
                  <img
                    src={item.imagen_url}
                    alt={item.nombre}
                    width="150"
                  />
                  <div className="container-cantidad-nombre">
                    <div className="nombre-precio-detalle">
                      <span>{item.nombre}</span>
                      <span>
                        ${Number(item.subtotal).toLocaleString("es-CO")}
                      </span>
                    </div>

                    <div className="acciones-detalle">
                      {modo === "mesero" ? (
                        <>
                          <button
                            className="btn-restar-detalle"
                            onClick={() => handleRestar(item)}
                          >
                            <Minus />
                          </button>
                          <span className="cantidad-detalle">
                            {item.cantidad}
                          </span>
                          <button
                            disabled={item.stock <= 0}
                            className="btn-sumar-detalle"
                            onClick={() => handleSumar(item)}
                          >
                            <Plus />
                          </button>
                          <div className="container-btn-eliminar-detalle">
                            <button
                              className="btn-eliminar-detalle"
                              onClick={() => handleEliminar(item)}
                            >
                              <Trash2 />
                            </button>
                          </div>
                        </>
                      ) : (
                        <span className="cantidad-detalle">
                          {item.cantidad}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {modo === "mesero" ? (
                  <>
                    {editandoObservacion === item.idDetalle_pedido ? (
                      <div className="contenedor-obs-detalle">
                        <textarea
                          value={observacion}
                          onChange={(e) => setObservacion(e.target.value)}
                          placeholder="Escriba una observación..."
                        />

                        <button
                          className="btn-guardar-obs-detalle"
                          onClick={() => handleGuardarObservacion(item)}
                        >
                          Guardar
                        </button>

                        <button
                          className="btn-cancelar-obs-detalle"
                          onClick={handleCancelarObservacion}
                        >
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <div className="contenedor-obs-btn-detalle">
                        {item.observaciones && (
                          <span className="texto-observacion">
                            <strong>Observación:</strong> {item.observaciones}
                          </span>
                        )}

                        <button
                          className="btn-agregar-editar-detalle"
                          onClick={() => handleAbrirObservacion(item)}
                        >
                          {item.observaciones ? (
                            <>
                              <MessageCircleMore /> Editar observación
                            </>
                          ) : (
                            <>
                              <MessageCircleMore /> Agregar observación
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <span className="texto-observacion">
                    <strong>Observación:</strong>{" "}
                    {item.observaciones || "Sin observacion"}
                  </span>
                )}
              </div>
            ))
          )}
        </div>
        <div className="container-total-botones-finalizar">
          <div className="detalle-total">
            <h2>Total del pedido</h2>
            <p className="total-del-pedido-detalle">
              $ {Number(total || 0).toLocaleString("es-CO")}
            </p>
          </div>

          {modo === "mesero" && (
            <div className="contenedor-btn-calcelar-finalizar">
              <button
                className="btn-comanda-imprimir"
                type="button"
                onClick={abrirComanda}
              >
                <Printer /> Imprimir comanda
              </button>
              <button
                className="btn-cancelar-detalle"
                onClick={() => handleCancelarPedido()}
              >
                <CircleX /> Cancelar pedido
              </button>

              <button
                className="btn-finalizar-detalle"
                onClick={handleFinalizarPedido}
              >
                <CircleCheck /> Finalizar pedido
              </button>
            </div>
          )}
        </div>
      </div>

      <Modal
        abierto={mostrarModal}
        cerrar={cerrarModal}
        titulo={"Realizar pago"}
      >
        <Pago
          pedido={{ idPedidos: idPedido, total: total }}
          handlePagar={handlePagar}
        />
      </Modal>

      {comprobante && (
        <Modal
          abierto={mostrarComprobante}
          cerrar={() => setMostrarComprobante(false)}
        >
          <Comprobante
            datos={comprobante}
            cerrar={cerrarComprobante}
          />
        </Modal>
      )}

      {mostrarComanda && (
        <Modal
          abierto={mostrarComanda}
          cerrar={() => setMostrarComanda(false)}
        >
          <Comanda pedido={comanda} />
        </Modal>
      )}
    </section>
  );
}

export default DetallePedido;
