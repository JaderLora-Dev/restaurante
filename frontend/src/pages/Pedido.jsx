import { useNavigate, useParams } from "react-router-dom";
import "../Estilos/Pedido.css";
import ProductoPedido from "../components/ProductoPedido";
import DetallePedido from "../components/DetallePedido";
import { useEffect, useState } from "react";
import { obtenerPedidoMesa } from "../services/pedidosService";
import { ArrowLeft, ChevronDown, ChevronUp, Circle } from "lucide-react";
import Spinner from "../components/Spinner";
import { mostrarError } from "../utils/alertas";

function Pedido() {
  const { idMesa } = useParams();
  const [pedido, setPedido] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [versionStock, setVersionStock] = useState(0);
  const [mostrarDetalle, setMostrarDetalle] = useState(false);
  const navigate = useNavigate();

  const cargarPedido = async () => {
    try {
      const pedidoActivo = await obtenerPedidoMesa(idMesa);

      if (pedidoActivo) {
        setPedido(pedidoActivo);
      } else {
        setPedido(null);
      }
    } catch (error) {
      console.error(error);
      mostrarError(
        error?.response?.data.mensaje ||
          "No tienes permiso para acceder a esta mesa.",
      );
    }
  };

  useEffect(() => {
    const cargaInicial = async () => {
      try {
        setCargando(true);

        await cargarPedido();
      } finally {
        setCargando(false);
      }
    };

    cargaInicial();
  }, [idMesa]);

  const actualizarStock = () => {
    setVersionStock((prev) => prev + 1);
  };

  return (
    <div className="container-crearpedido">
      <header className="header-crearPedido">
        <h2> Mesa {pedido?.mesa}</h2>
        <button
          className="btn-atras"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft />
          Atrás
        </button>
      </header>
      {cargando ? (
        <Spinner />
      ) : (
        <section className="contenedor-pedidos-padre">
          <div className="contenedor-productos-en-pedidos">
            <ProductoPedido
              pedido={pedido}
              idMesa={idMesa}
              cargarPedido={cargarPedido}
              versionStock={versionStock}
            />
          </div>
          <div className="contenedor-detalle-pedido">
            <div className="contenedor-detalle-en-pedidos">
              {pedido ? (
                <div className="container-estado-del-pedido">
                  <h3>Pedido #{pedido.idPedidos}</h3>
                  <span className="icono-estado-detalle">
                    <Circle />
                    {pedido.estado}
                  </span>
                  <button
                    type="button"
                    className="btn-ver-detalle"
                    onClick={() => setMostrarDetalle(!mostrarDetalle)}
                  >
                    <span>
                      {mostrarDetalle ? "Ocultar Detalle" : "Ver Detalle"}
                    </span>
                    {mostrarDetalle ? (
                      <ChevronUp size={20} />
                    ) : (
                      <ChevronDown size={20} />
                    )}
                  </button>
                </div>
              ) : (
                <div className="info-pedido">
                  <h3>No existe un pedido activo</h3>
                  <p>Seleccione un producto para iniciar el pedido.</p>
                </div>
              )}

              <div
                className={`detalle-desplegable ${mostrarDetalle ? "mostrar" : ""}`}
              >
                <DetallePedido
                  idPedido={pedido?.idPedidos}
                  total={pedido?.total}
                  pedido={pedido}
                  cargarPedido={cargarPedido}
                  actualizarStock={actualizarStock}
                  modo="mesero"
                />
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

export default Pedido;
