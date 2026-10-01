import { Pencil, Table, Trash2 } from "lucide-react";
import "../Estilos/MesaTable.css";

function MesaTable({ mesas, handleEditar, handleEliminar }) {
  return (
    <section className="container-padre-mesa">
      {mesas.length === 0 ? (
        <p>No hay mesas registradas</p>
      ) : (
        mesas.map((mesa) => (
          <div
            className="container-interno-mesas"
            key={mesa.idMesas}
          >
            <div className="container-mesas-table">
              <div className={`icono-mesa estado-${mesa.estado.toLowerCase()}`}>
                <Table />
              </div>
              <div className="mesaTable-id-numero">
                <span className="Id-mesa">ID: {mesa.idMesas}</span>

                <span className="numero-de-mesa">Mesa {mesa.numero}</span>
              </div>
              <div className="estado-mesa-contenedor">
                <span
                  className={`estado-mesa estado-${mesa.estado.toLowerCase()}`}
                >
                  {mesa.estado}
                </span>
              </div>
            </div>
            <div className="contenedor-mesa-botones">
              <button
                className="boton-editar-mesa"
                onClick={() => handleEditar(mesa)}
              >
                <Pencil /> Editar
              </button>

              <button
                disabled={mesa.estado === "Inactiva"}
                className="btn-eliminar-mesa"
                onClick={() => handleEliminar(mesa.idMesas)}
              >
                <Trash2 /> Eliminar
              </button>
            </div>
          </div>
        ))
      )}
    </section>
  );
}

export default MesaTable;
