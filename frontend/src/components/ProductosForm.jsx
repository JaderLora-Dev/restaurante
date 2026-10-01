import { useEffect, useState } from "react";
import {
  actualizarProducto,
  crearProductos,
} from "../services/productosService";
import { obtenerCategorias } from "../services/categoriasService";
import "../Estilos/ProductosForm.css";
import {
  cerrarAlerta,
  mostrarCarga,
  mostrarError,
  mostrarExito,
} from "../utils/alertas";

function ProductosForm({ editarProductos, cerrarModal, cargarProductos }) {
  const [nombre, setNombre] = useState("");

  const [precio, setPrecio] = useState("");

  const [categorias, setCategorias] = useState([]);
  const [categoriaId, setCategoriaId] = useState("");

  const [imagen, setImagen] = useState(null);
  const [imagenActual, setImagenActual] = useState("");

  const [detalle, setDetalle] = useState("");

  const [estado, setEstado] = useState("Disponible");

  const [stock, setStock] = useState("");

  //cargar categorias
  const cargarCategorias = async () => {
    try {
      const respuesta = await obtenerCategorias();

      setCategorias(respuesta);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    cargarCategorias();
  }, []);

  //===================================
  useEffect(() => {
    if (editarProductos) {
      setNombre(editarProductos.nombre);
      setPrecio(editarProductos.precio);
      setCategoriaId(Number(editarProductos.categorias_id));
      setImagenActual(editarProductos.imagen_url);
      setDetalle(editarProductos.detalle);
      setEstado(editarProductos.estado);
      setStock(editarProductos.stock);
      setImagen(null);
    } else {
      setNombre("");
      setPrecio("");
      setCategoriaId("");
      setDetalle("");
      setEstado("");
      setStock("");
      setImagen(null);
    }
  }, [editarProductos]);

  const guadarProductos = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append("nombre", nombre);
      formData.append("precio", precio);
      formData.append("categorias_id", categoriaId);

      //solo cambia si suben una imagen nueva
      if (imagen) {
        formData.append("imagen", imagen);
      }
      formData.append("detalle", detalle);
      formData.append("estado", estado);
      formData.append("stock", stock);
      if (editarProductos) {
        mostrarCarga("Actualizando producto...");

        await actualizarProducto(editarProductos.idProductos, formData);

        cerrarAlerta();

        mostrarExito("Producto actualizado correctamente.");
      } else {
        mostrarCarga("Guardando producto...");

        await crearProductos(formData);

        cerrarAlerta();

        mostrarExito("Producto creado correctamente");
      }
      await cargarProductos();

      cerrarModal();
    } catch (error) {
      cerrarAlerta();
      mostrarError(
        error?.response?.data?.mensaje || "No se pudo guardar el producto.",
      );
      console.error(error);
    }
  };

  return (
    <div className="padres-productos">
      {/* formulario */}
      <form
        className="container-formulario-crear"
        onSubmit={guadarProductos}
      >
        <div className="contenedor-interno-crear">
          <label>Nombre</label>

          <input
            type="text"
            placeholder="Nombre del producto"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />

          <label>Precio</label>

          <input
            type="number"
            placeholder="Precio (COP)"
            value={precio}
            onChange={(e) => setPrecio(e.target.value)}
            required
          />

          <label>Stock</label>
          <input
            type="number"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
          />

          <label>Imagen</label>
          <input
            className="imagen-produc"
            type="file"
            accept=".jpg,.jpeg,.png,.webp"
            onChange={(e) => setImagen(e.target.files[0])}
          />

          {imagenActual && (
            <img
              src={imagenActual}
              alt="Producto"
              width="100"
            />
          )}

          <label>Categoria</label>
          <select
            name="categorias_id"
            value={categoriaId || ""}
            onChange={(e) => setCategoriaId(Number(e.target.value))}
          >
            <option value="">Seleccione</option>

            {categorias.map((categoria) => (
              <option
                key={categoria.id}
                value={categoria.id}
              >
                {categoria.id} {""}
                {categoria.nombre}
              </option>
            ))}
          </select>

          <label>Detalle</label>

          <input
            type="text"
            placeholder="Ej. queso, jamon"
            value={detalle}
            onChange={(e) => setDetalle(e.target.value)}
          />

          <label>Estado</label>

          <select
            value={estado}
            onChange={(e) => setEstado(e.target.value)}
            required
          >
            <option value="">Seleccione</option>
            <option value="Disponible">Disponible</option>
            <option value="Agotado">Agotado</option>
          </select>
        </div>

        <button
          className="btn-crear-producto"
          type="submit"
        >
          {editarProductos ? "Actualizar Producto" : "Guardar Producto"}
        </button>
      </form>
    </div>
  );
}

export default ProductosForm;
