import { useEffect, useState } from "react";
import { obtenerProductosDisponible } from "../services/productosService.js";
import BuscarInput from "../components/BuscarInput.jsx";
import { crearDetallePedido } from "../services/detallePedidoService.js";
import { Plus } from "lucide-react";
import { obtenerCategorias } from "../services/categoriasService.js";
import Paginacion from "./Paginacion.jsx";
import SelectLimit from "./SelectLimit.jsx";
import { mostrarError } from "../utils/alertas.js";
import "../Estilos/ProductoPedido.css";

function ProductoPedido({ idMesa, cargarPedido, versionStock }) {
  const [productos, setProductos] = useState([]);
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [limit, setLimit] = useState(10);
  const [buscar, setBuscar] = useState("");
  const [textoBuscar, setTextoBuscar] = useState("");
  const [categorias, setCategorias] = useState([]);
  const [categoria, setCategoria] = useState("");

  useEffect(() => {
    const tiempo = setTimeout(() => {
      setBuscar(textoBuscar);
      setPagina(1);
    }, 500);
    return () => clearTimeout(tiempo);
  }, [textoBuscar]);

  //cargar categorias
  useEffect(() => {
    const cargarCategorias = async () => {
      try {
        const respuesta = await obtenerCategorias();

        setCategorias(respuesta);
      } catch (error) {
        console.error(error);
      }
    };

    cargarCategorias();
  }, []);

  const cargarProductos = async () => {
    try {
      const respuesta = await obtenerProductosDisponible({
        buscar,
        page: pagina,
        limit,
        categoria,
      });

      setProductos(respuesta.productos);
      setTotalPaginas(respuesta.totalPages);
    } catch (error) {
      console.error(error);
    }
  };
  useEffect(() => {
    cargarProductos();
  }, [buscar, pagina, limit, categoria, versionStock]);

  const handleAgregarProducto = async (producto) => {
    try {
      //Agregar producto al detalle
      await crearDetallePedido({
        idMesas: idMesa,
        idProductos: producto.idProductos,
        cantidad: 1,
      });

      //recargar el pedido
      await cargarProductos();
      await cargarPedido();
    } catch (error) {
      console.error(error);
      mostrarError(
        error?.response?.data?.mensaje || "No se puede agregar un producto",
      );
    }
  };

  return (
    <section className="container-padre-productoPedido">
      <div className="container-buscar-producto-pedido">
        <BuscarInput
          value={textoBuscar}
          onChange={setTextoBuscar}
          placeholder="Buscar Productos..."
        />
      </div>
      <div className="categorias-productosPedido">
        <button
          className={categoria === "" ? "activo" : ""}
          onClick={() => {
            setCategoria("");
            setPagina(1);
          }}
        >
          Todas
        </button>

        {categorias
          .filter((cat) => cat.estado === "Activo")
          .map((cat) => (
            <button
              className={categoria === cat.id ? "activo" : ""}
              key={cat.id}
              onClick={() => {
                setCategoria(cat.id);
                setPagina(1);
              }}
            >
              {cat.nombre}
            </button>
          ))}
      </div>
      <div className="productos-pedido-container">
        {productos.length === 0 ? (
          <p>No hay productos disponibles...</p>
        ) : (
          productos.map((producto) => (
            <div
              className="productosPedido"
              key={producto.idProductos}
            >
              <img
                src={producto.imagen_url}
                alt={producto.nombre}
                width="150"
              />
              <span className="productoPedido-nombre">{producto.nombre}</span>
              <span className="productoPedido-precio">
                ${Number(producto.precio).toLocaleString("es-CO")}
              </span>

              <button
                type="button"
                disabled={producto.stock <= 0}
                onClick={() => handleAgregarProducto(producto)}
              >
                <Plus /> {producto.stock <= 0 ? "Sin stock" : "Agregar"}
              </button>
            </div>
          ))
        )}
      </div>

      <div className="container-page-limit">
        <div className="container-selectLimit">
          <SelectLimit
            value={limit}
            onChange={setLimit}
          />
        </div>

        <Paginacion
          pagina={pagina}
          totalPaginas={totalPaginas}
          onPageChange={setPagina}
        />
      </div>
    </section>
  );
}

export default ProductoPedido;
