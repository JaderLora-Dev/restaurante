import "../Estilos/ProductosTop.css";
export default function ProductoTop({ productos = [] }) {
  return (
    <section className="card-productosTop">
      <h3 className="titulo-productoTop">Productos más vendidos</h3>

      {productos.length === 0 ? (
        <h3>Sin datos</h3>
      ) : (
        productos.map((producto) => (
          <div
            className="card-interno-productosTop"
            key={producto.idProductos || producto.nombre}
          >
            <div>
              <img
                src={producto.imagen_url}
                alt={producto.nombre}
              />
            </div>
            <div>
              <span className="nombre-productoTop">{producto.nombre}</span>
            </div>

            <div>
              <span className="numero-productoTop">{producto.vendidos}</span>
              <span className="vendidos">Vendidos</span>
            </div>
          </div>
        ))
      )}
    </section>
  );
}
