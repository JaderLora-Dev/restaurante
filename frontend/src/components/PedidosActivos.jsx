import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { obtenerPedidosActivos } from "../services/pedidosService.js";
import Spinner from "./Spinner.jsx";
import "../Estilos/PedidosActivos.css";
import { ClipboardList } from "lucide-react";

function PedidosActivos() {
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();

  const cargarPedidos = async () => {
    try {
      setCargando(true);
      const respuesta = await obtenerPedidosActivos();

      setPedidos(respuesta);
    } catch (error) {
      console.error("Error al cargar pedidos activos:", error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarPedidos();
  }, []);

  const handleVerPedido = (pedido) => {
    navigate(`/pedido/${pedido.idMesas}`);
  };

  return (
    <div className="pedidos-activos-container">
      <header className="header-pedidosActivos">
        <h2>Pedidos Activos</h2>
      </header>
      <h2 className="list-pedidoActivo">Lista de pedidos activos</h2>

      {cargando ? (
        <Spinner />
      ) : (
        <div>
          {pedidos.length === 0 ? (
            <div className="sin-pedidos">
              <h3>No tienes pedidos activos</h3>
              <p>Los pedidos que crees aparecerán aquí.</p>
            </div>
          ) : (
            <div className="pedidos-activos-lista">
              {pedidos.map((pedido) => (
                <div
                  className="card-pedido-activo"
                  key={pedido.idPedidos}
                >
                  <h3 className="titulo-pedidoActivo">
                    Pedido #{pedido.idPedidos}
                  </h3>

                  <div className="contenido-pedidoActivo">
                    <span>Mesa:</span>
                    <span className="span-valores">{pedido.numeroMesa}</span>
                  </div>
                  <div className="contenido-pedidoActivo">
                    <span>Total:</span>
                    <span className="span-valores">
                      ${Number(pedido.total).toLocaleString("es-CO")}
                    </span>
                  </div>
                  <div className="contenido-pedidoActivo">
                    <span>Fecha:</span>

                    <span className="span-valores">
                      {new Date(pedido.fecha).toLocaleString("es-CO")}
                    </span>
                  </div>

                  <button
                    className="btn-verPedido"
                    onClick={() => handleVerPedido(pedido)}
                  >
                    <ClipboardList /> Ver pedido
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default PedidosActivos;
