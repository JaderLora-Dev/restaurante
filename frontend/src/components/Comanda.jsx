import { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import "../Estilos/Comanda.css";

function Comanda({ pedido }) {
  const comprobanteRef = useRef(null);
  const imprimir = useReactToPrint({
    contentRef: comprobanteRef,
    documentTitle: `Comprobante-${pedido}`,
  });
  return (
    <section>
      <div
        className="comanda"
        ref={comprobanteRef}
      >
        <div className="comanda-encabezado">
          <h2>COMANDA</h2>
          <p>
            <strong>Pedido:</strong> #{pedido?.idPedidos}
          </p>

          <p>
            <strong>Mesa:</strong> {pedido?.mesa}
          </p>

          <p>
            <strong>Mesero:</strong> {pedido?.mesero}
          </p>

          <p>
            <strong>Fecha:</strong>{" "}
            {pedido?.fecha
              ? new Date(pedido.fecha).toLocaleString("es-CO")
              : ""}
          </p>
        </div>

        <div className="comanda-linea" />
        <div className="comanda-detalles">
          {pedido?.detalle?.map((producto) => (
            <div
              className="comanda-producto"
              key={producto.idDetalle_pedido}
            >
              <div className="comanda-producto-principal">
                <strong className="comanda-cantidad">
                  {producto.cantidad}x
                </strong>

                <strong className="comanda-nombre">{producto.nombre}</strong>
              </div>

              {producto.observaciones && (
                <p className="comanda-observacion">
                  <strong>Observación:</strong> {producto.observaciones}
                </p>
              )}
            </div>
          ))}
        </div>

        <p className="comanda-total-productos">
          Total de productos:{" "}
          {pedido?.detalle?.reduce(
            (total, producto) => total + Number(producto.cantidad),
            0,
          )}
        </p>
      </div>
      <div className="acciones-comanda">
        <button
          className="btn-imprimir-comanda"
          type="button"
          onClick={imprimir}
        >
          Imprimir comanda
        </button>
      </div>
    </section>
  );
}

export default Comanda;
