import "../Estilos/MeserosTop.css";
import { User2Icon } from "lucide-react";

export default function MeserosTop({ meseros = [] }) {
  return (
    <section className="card-mesero-dashboard">
      <h3 className="titulo-meseroo">Actividad de meseros</h3>

      {meseros.length === 0 ? (
        <p>Sin datos</p>
      ) : (
        meseros.map((mesero, index) => (
          <div
            className={`card-interno-mesero ${index === 0 ? "primer-lugar" : ""}`}
            key={mesero.idUsuarios || mesero.nombre}
          >
            <span className={"icono-meseroo "}>
              <User2Icon />
            </span>

            <span className="nombre-meseroo">{mesero.nombre}</span>

            <div className="container-meseroo-cantidad">
              <span className="cantidad-meseroo">{mesero.pedidos}</span>

              <span className="text-mesero">Pedidos</span>
            </div>
          </div>
        ))
      )}
    </section>
  );
}
