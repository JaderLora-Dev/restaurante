import {
  CircleCheck,
  CircleX,
  Lock,
  Pencil,
  Trash2,
  UserRound,
} from "lucide-react";
import "../Estilos/UsuarioTable.css";

function UsuarioTable({
  usuarios,
  handleEditar,
  handleEliminar,
  handleCambiarEstado,
  actualizandoId,
}) {
  return (
    <section className="container-padre-usuarios">
      {usuarios.length === 0 ? (
        <p>No hay usuarios registrados...</p>
      ) : (
        usuarios.map((u) => (
          <div
            className="container-interno-usuario"
            key={u.idUsuarios}
          >
            <div className="contenido-usuarios">
              <span className={`icono-usuario icon-rol-${u.rol}`}>
                <UserRound />
              </span>
              <div className="contenido-n-e-rol">
                <span className="nombre-usuario"> {u.nombre} </span>
                <span className="email-usuario"> {u.email} </span>
                <span className="rol-usuario"> {u.rol} </span>
              </div>
              <span className={`estado-usuario usuario-${u.estado}`}>
                {u.estado}
              </span>
            </div>

            <div className="container-btn-usuarios">
              <button
                className="btn-editar-usuario"
                onClick={() => handleEditar(u)}
              >
                <Pencil /> Editar
              </button>

              <button
                className={`btn-estado-usuario boton-${u.estado} `}
                disabled={actualizandoId === u.idUsuarios}
                onClick={() =>
                  handleCambiarEstado(
                    u.idUsuarios,
                    u.estado === "Activo" ? "Inactivo" : "Activo",
                  )
                }
              >
                {actualizandoId === u.idUsuarios ? (
                  "Actualinzado..."
                ) : u.estado === "Activo" ? (
                  <>
                    <CircleX /> Inactivo
                  </>
                ) : (
                  <>
                    <CircleCheck /> Activo
                  </>
                )}
              </button>
              <button
                className="btn-eliminar-usuario"
                disabled={u.estado === "Inactivo"}
                onClick={() => handleEliminar(u.idUsuarios)}
              >
                {u.estado === "Inactivo" ? (
                  <>
                    <Lock /> No eliminable
                  </>
                ) : (
                  <>
                    <Trash2 /> Eliminar
                  </>
                )}
              </button>
            </div>
          </div>
        ))
      )}
    </section>
  );
}

export default UsuarioTable;
