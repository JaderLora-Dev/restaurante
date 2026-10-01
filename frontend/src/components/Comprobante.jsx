import { useRef } from "react";
import "../Estilos/Comprobante.css";
import { useReactToPrint } from "react-to-print";
function Comprobante({ datos, cerrar }) {
  const { comprobante, detalle } = datos;
  const comprobanteRef = useRef(null);

  const total = Number(comprobante?.total || 0);

  const fecha = new Date(comprobante?.fecha);

  const imprimir = useReactToPrint({
    contentRef: comprobanteRef,
    documentTitle: `Comprobante-${datos.comprobante.idPedidos}`,
  });

  return (
    <section>
      <div
        className="comprobante"
        ref={comprobanteRef}
      >
        <div className="comprobante-encabezado">
          <h2>RESTAUTANTE</h2>
          <p>Comprobante de pago</p>
          <p>Pedido #{comprobante?.idPedidos}</p>
        </div>
        <div className="comprobante-datos">
          <p>
            <strong>Fecha:</strong>{" "}
            {new Date(comprobante.fecha).toLocaleString("es-CO")}
          </p>
          <p>
            <strong>Mesa: </strong> {comprobante?.mesa}
          </p>

          <p>
            <strong>Mesero: </strong>
            {comprobante?.mesero}
          </p>
        </div>

        <div className="comprobante-linea" />

        <div className="comprobante-productos">
          <div className="producto-encabezado">
            <span>Productos</span>
            <span>Cant.</span>
            <span className="subtotal-comprobante">Subtotal</span>
          </div>
          {detalle?.map((item) => (
            <div
              className="producto-fila"
              key={item.idDetalle_pedido}
            >
              <span> {item.nombre} </span>
              <span> {item.cantidad} </span>

              <span> $ {Number(item.subtotal).toLocaleString("es-CO")} </span>
            </div>
          ))}
        </div>

        <div className="comprobante-linea" />

        <div className="comprobante-total">
          <span>
            <strong>Total:</strong>
          </span>

          <strong>${total.toLocaleString("es-CO")}</strong>
        </div>

        <div className="comprobante-pago">
          <p>
            <strong>Método de pago:</strong> {comprobante?.metodoPago}
          </p>

          {comprobante.metodoPago === "Efectivo" && (
            <div>
              <p>
                <strong>Recibido: </strong>
                {Number(comprobante?.dineroRecibido).toLocaleString("es-CO")}
              </p>

              <p>
                <strong>Cambio: </strong>
                {Number(comprobante?.cambio).toLocaleString("es-CO")}
              </p>
            </div>
          )}
        </div>

        <div className="comprobante-footer">
          <p>Gracias por su compra</p>
          <p>! Esperamos verlo nuevamente !</p>
        </div>
      </div>
      <div className="acciones-comprobante">
        <button
          type="button"
          className="btn-imprimir-comprobante"
          onClick={imprimir}
        >
          Imprimir comprobante
        </button>

        <button
          type="button"
          className="btn-cerrar-comprobante"
          onClick={cerrar}
        >
          Cerrar
        </button>
      </div>
    </section>
  );
}

export default Comprobante;
