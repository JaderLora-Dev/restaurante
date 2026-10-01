import { ClipboardCheck, ClipboardX, Pencil, Trash2 } from "lucide-react";
import "../Estilos/CategoriaTable.css";

function CategoriaTable({
  categorias,
  btnEditar,
  btnEditarEstado,
  btnEliminar,
  actualizandoId,
}) {
  return (
    <div className="categoria-padre">
      {categorias.length === 0 ? (
        <p>No hay categorías disponibles</p>
      ) : (
        categorias.map((categoria) => (
          <div
            className="container-categoria-padre"
            key={categoria.id}
          >
            <div className="contenedor-2dos-categoria">
              <span className="id-numero"> ID {categoria.id}</span>
              <span className="nombre-categoria"> {categoria.nombre}</span>
              <span
                className={`estado-categoria ${
                  categoria.estado === "Activo"
                    ? "estado-activo"
                    : "estado-inactivo"
                }`}
              >
                {categoria.estado}
              </span>
            </div>
            <div className="contenedor-3ro-categoria">
              <button
                className="btn-editar"
                onClick={() => btnEditar(categoria)}
              >
                <Pencil /> Editar
              </button>
              <button
                disabled={actualizandoId === categoria.id}
                className={`btn-estado-categoria  ${
                  categoria.estado === "Activo" ? "btn-inactivo" : "btn-activo"
                }`}
                onClick={() =>
                  btnEditarEstado(
                    categoria.id,
                    categoria.estado === "Activo" ? "Inactivo" : "Activo",
                  )
                }
              >
                {actualizandoId === categoria.id ? (
                  "Actualizando.."
                ) : categoria.estado === "Activo" ? (
                  <>
                    <ClipboardX />
                    Inactivo
                  </>
                ) : (
                  <>
                    <ClipboardCheck />
                    Activo
                  </>
                )}
              </button>

              <button
                disabled={categoria.estado === "Inactivo"}
                className="boton-eliminar"
                onClick={() => btnEliminar(categoria.id)}
              >
                <Trash2 /> Eliminar
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default CategoriaTable;
