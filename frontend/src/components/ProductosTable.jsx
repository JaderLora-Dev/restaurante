import {
  ClipboardCheck,
  ClipboardX,
  Lock,
  SquarePen,
  Trash2,
} from "lucide-react";
import "../Estilos/ProductosTable.css";
function ProductoTable({
  productos,
  handleCambiarEstado,
  handleEditar,
  handleEliminar,
  actualizandoId,
}) {
  return (
    <div>
      {/* listado */}
      <section className="contendor-de-productoTable">
        <div className="filas-productos">
          {productos.length === 0 ? (
            <p>No hay productos</p>
          ) : (
            productos.map((producto) => (
              <div
                className="contenedor-interno-productos"
                key={producto.idProductos}
              >
                <div className="container-inter-produc">
                  <img
                    src={producto.imagen_url}
                    alt={producto.nombre}
                    width="150"
                  />
                  <div className="contenedor-detalles-produc">
                    <div className="interno-detalles-produc">
                      <span className="nombre-detalles-produc">
                        {producto.nombre}
                      </span>

                      <span className="precio-detalles-produc">
                        ${Number(producto.precio).toLocaleString("es-CO")}
                      </span>

                      <span className="categoria-detalles-produc">
                        Categoria: {producto.categoria}
                      </span>
                      <span className="categoria-detalles-produc">
                        Stock: {producto.stock}
                      </span>
                      <span className="detalle-detalle-produc">
                        Detalle: {producto.detalle}
                      </span>
                    </div>
                    <div className="estado-detalles-produ">
                      <span className={`estado-text-produ ${producto.estado}`}>
                        {producto.estado}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="contendor-de-botones">
                  <button
                    className="boton-editar-produc"
                    onClick={() => handleEditar(producto)}
                  >
                    {" "}
                    <SquarePen /> Editar
                  </button>

                  <button
                    disabled={actualizandoId === producto.idProductos}
                    className={`boton-estado-produc ${producto.estado}`}
                    onClick={() =>
                      handleCambiarEstado(
                        producto.idProductos,
                        producto.estado === "Disponible"
                          ? "Agotado"
                          : "Disponible",
                      )
                    }
                  >
                    {actualizandoId === producto.idProductos ? (
                      "Actualizando..."
                    ) : producto.estado === "Disponible" ? (
                      <>
                        <ClipboardX /> Agotado
                      </>
                    ) : (
                      <>
                        <ClipboardCheck /> Disponible
                      </>
                    )}
                  </button>
                  <button
                    disabled={producto.estado === "Inactivo"}
                    className="boton-eliminar-produc"
                    onClick={() => handleEliminar(producto.idProductos)}
                  >
                    {producto.estado === "Inactivo" ? (
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
        </div>
      </section>
    </div>
  );
}

export default ProductoTable;
