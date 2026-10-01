import { useState } from "react";
import "../Estilos/Pago.css";
import {
  Banknote,
  BanknoteX,
  CircleDollarSign,
  ClipboardList,
  HandCoins,
  Lock,
  Wallet,
} from "lucide-react";
function Pago({ pedido, handlePagar }) {
  const [metodoPago, setMetodoPago] = useState("Efectivo");
  const [dineroRecibido, setDineroRecibido] = useState("");

  const confirmarPago = () => {
    handlePagar(
      pedido.idPedidos,
      metodoPago,
      metodoPago === "Efectivo" ? Number(dineroRecibido) : null,
    );
  };

  const total = Number(pedido?.total || 0);

  const cambio = Math.max(Number(dineroRecibido || 0) - total, 0);

  //falta dinero
  const faltaDinero =
    metodoPago === "Efectivo" && Number(dineroRecibido || 0) < total;
  return (
    <section className="contenido-pago">
      <div className="container-pago-info">
        <div className="pago-info">
          <span>
            <ClipboardList />
          </span>
          <span>
            {" "}
            Pedido <strong>#{pedido?.idPedidos}</strong>
          </span>
        </div>
        <div className="pago-info">
          <span>
            <CircleDollarSign />
          </span>
          <span>Total a pagar </span>
          <span>
            <strong>${Number(pedido?.total).toLocaleString("es-CO")}</strong>
          </span>
        </div>
      </div>

      {metodoPago === "Efectivo" && (
        <div className="container-los-pagos">
          <div className="recibido-pago">
            <span>
              <Banknote />
            </span>

            <span>Recibido</span>

            <input
              type="number"
              value={dineroRecibido}
              onChange={(e) => setDineroRecibido(e.target.value)}
              min="0"
            />
          </div>

          <div className="cambio-pago">
            <span>
              <HandCoins />
            </span>
            <span>Cambio</span>
            <span>${cambio.toLocaleString("es-CO")} </span>
          </div>
        </div>
      )}

      {faltaDinero && (
        <div className="falta-pago">
          <span>
            <BanknoteX />
          </span>
          <span>Falta</span>
          <span>
            ${(total - Number(dineroRecibido || 0)).toLocaleString("es-CO")}
          </span>
        </div>
      )}
      <div className="metodo-pago">
        <span>
          <Wallet />
        </span>

        <span>Método de pago</span>

        <select
          value={metodoPago}
          onChange={(e) => setMetodoPago(e.target.value)}
        >
          <option value="Efectivo">Efectivo</option>
          <option value="Nequi">Nequi</option>
          <option value="Transferencia">Transferencia</option>
          <option value="Tarjeta">Tarjeta</option>
        </select>
      </div>

      <div className="btn-confirmar-pago">
        <button>Cancelar</button>
        <button
          disabled={faltaDinero}
          onClick={confirmarPago}
        >
          <Lock /> Confirmar pago
        </button>
      </div>
    </section>
  );
}

export default Pago;
