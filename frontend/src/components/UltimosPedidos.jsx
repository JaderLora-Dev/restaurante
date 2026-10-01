import { formatearHora } from "../utils/hora.js";
import "../Estilos/UltimosPedidos.css";
export default function UltimosPedidos({ pedidos = [] }) {
  return (
    <section className="ultimos-pedidos">
      <h2 className="titulo-ultimos-pedido">Últimos pedidos</h2>

      {pedidos.length === 0 ? (
        <p>Sin datos</p>
      ) : (
        pedidos.map((pedido) => (
          <div
            className="card-ultimos-pedidos"
            key={pedido.idPedidos}
          >
            <span className={`numero-ultimo-pedido ${pedido.estado}`}>
              #{pedido.idPedidos}
            </span>

            <div className="container-mesero-mesa">
              <span className="mesaTexto-ultimo-pedido">
                Mesa {pedido.mesa}
              </span>
              <span>{pedido.mesero}</span>
            </div>

            <span className="hora-Ultimo-pedidos">
              {formatearHora(pedido.fecha)}
            </span>

            <span className={`estado-ultimo-pedido ${pedido.estado}`}>
              {pedido.estado}
            </span>
          </div>
        ))
      )}
    </section>
  );
}
