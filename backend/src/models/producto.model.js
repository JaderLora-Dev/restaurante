import { connection } from "../config/db.js";

//obtener Producto
export const obtenerProductos = async (
  buscar,
  page,
  limit,
  categoria,
  estado,
  orden,
) => {
  let query = `
  SELECT
  p.idProductos,
  p.nombre,
  p.precio,
  p.imagen_url,
  p.imagen_public_id,
  p.estado,
  p.stock,
  p.detalle,
  p.categorias_id,
  c.nombre AS categoria
  FROM productos p
  INNER JOIN categorias c
  ON p.categorias_id = c.id`;

  let totalQuery = `
  SELECT COUNT(*) AS total
  FROM productos p
  INNER JOIN categorias c
  ON p.categorias_id = c.id

  `;

  const busqueda = [];
  const filtros = [];

  const valores = [];
  const totalValores = [];

  //busqueda
  if (buscar) {
    busqueda.push("p.nombre LIKE ?", "c.nombre LIKE ? ");

    valores.push(`%${buscar}%`, `%${buscar}%`);

    totalValores.push(`%${buscar}%`, `%${buscar}%`);
  }
  //==========================

  //categoria
  if (categoria) {
    filtros.push("p.categorias_id = ?");

    valores.push(categoria);
    totalValores.push(categoria);
  }

  //
  if (estado) {
    filtros.push("p.estado = ?");

    valores.push(estado);
    totalValores.push(estado);
  }

  //Agregar WHERE solo si hay filtro
  const condiciones = [];

  if (busqueda.length > 0) {
    condiciones.push(`(${busqueda.join(" OR ")})`);
  }

  if (filtros.length > 0) {
    condiciones.push(filtros.join(" AND "));
  }

  if (condiciones.length > 0) {
    const where = ` 
    WHERE ${condiciones.join(" AND ")}`;

    query += where;

    totalQuery += where;
  }

  let orderBy = "";

  switch (orden) {
    case "nombre_asc":
      orderBy = " ORDER BY p.nombre ASC";
      break;

    case "nombre_desc":
      orderBy = " ORDER BY p.nombre DESC";
      break;

    case "precio_asc":
      orderBy = " ORDER BY p.precio ASC";
      break;

    case "precio_desc":
      orderBy = " ORDER BY p.precio DESC";
      break;

    case "reciente":
      orderBy = " ORDER BY p.idProductos DESC";
      break;

    case "antiguo":
      orderBy = " ORDER BY p.idProductos ASC";
      break;

    default:
      orderBy = "";
  }

  //Paginacion
  const offset = (page - 1) * limit;

  query += orderBy;

  query += `
  LIMIT ?
  OFFSET ?`;

  valores.push(limit, offset);

  const [productos] = await connection.query(query, valores);
  const [totalRows] = await connection.query(totalQuery, totalValores);

  return { productos, total: totalRows[0].total };
};
//========================================

//obtener por id
export const obtenerProductoId = async (id, conn = connection) => {
  const [rows] = await conn.query(
    `
    SELECT
    idProductos,
    nombre,
    precio,
    detalle,
    imagen_url,
    imagen_public_id,
    estado,
    stock,
    categorias_id
    FROM productos 
    WHERE idProductos = ?
    LIMIT 1`,
    [id],
  );

  return rows[0] || null;
};

//obtener producto Disponible
export const obtenerProductosDisponible = async (
  buscar,
  page,
  limit,
  categoria,
) => {
  let query = `
    SELECT
      p.idProductos,
      p.nombre,
      p.precio,
      p.imagen_url,
      p.estado,
      p.stock,
      p.detalle,
      p.categorias_id,
      c.nombre AS categoria
    FROM productos p
    INNER JOIN categorias c
      ON p.categorias_id = c.id
    WHERE p.estado = 'Disponible'
  `;

  let totalQuery = `
    SELECT COUNT(*) AS total
    FROM productos p
    INNER JOIN categorias c
      ON p.categorias_id = c.id
    WHERE p.estado = 'Disponible'
  `;

  const valores = [];
  const totalValores = [];

  //busqueda
  if (buscar) {
    query += ` AND p.nombre LIKE ? `;
    totalQuery += ` AND p.nombre LIKE ?`;

    const valorBusqueda = `%${buscar}%`;

    valores.push(valorBusqueda);
    totalValores.push(valorBusqueda);
  }

  // filtro por categoría
  if (categoria) {
    query += ` AND p.categorias_id = ?`;
    totalQuery += ` AND p.categorias_id = ?`;

    valores.push(categoria);
    totalValores.push(categoria);
  }

  //Paginacion
  const offset = (page - 1) * limit;

  query += `
  ORDER BY p.nombre ASC
  LIMIT ?
  OFFSET ?`;

  valores.push(limit, offset);

  const [productos] = await connection.query(query, valores);
  const [totalRows] = await connection.query(totalQuery, totalValores);

  return { productos, total: totalRows[0].total };
};

//obtener por nombre
export const obtenerPorNombre = async (nombre, conn) => {
  const [rows] = await conn.query(
    `
    SELECT
      idProductos,
      nombre
    FROM productos
    WHERE nombre = ?
    LIMIT 1`,
    [nombre],
  );

  return rows[0] || null;
};
//=====================================

//verificar si el producto tiene pedidos
export const productoTienePedido = async (id, conn) => {
  const [rows] = await conn.query(
    `
    SELECT COUNT(*) AS total
    FROM detalle_pedido
    WHERE idProductos = ?`,
    [id],
  );

  return rows[0].total > 0;
};
//=======================================

//crear producto
export const crearProducto = async (nuevoProducto, conn) => {
  const {
    nombre,
    precio,
    detalle,
    imagen_url,
    imagen_public_id,
    estado,
    stock,
    categorias_id,
  } = nuevoProducto;
  const [result] = await conn.query(
    `
    INSERT INTO productos 
    (nombre, precio, detalle, imagen_url, imagen_public_id, estado, stock, categorias_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      nombre,
      precio,
      detalle,
      imagen_url,
      imagen_public_id,
      estado,
      stock,
      categorias_id,
    ],
  );

  return obtenerProductoId(result.insertId, conn);
};
//========================================

//actualizar producto
export const actualizarProducto = async (id, producto, conn) => {
  const {
    nombre,
    precio,
    detalle,
    imagen_url,
    imagen_public_id,
    estado,
    stock,
    categorias_id,
  } = producto;

  await conn.query(
    `
    UPDATE productos
    SET 
    nombre = ?, 
    precio = ?,
    detalle = ?,
    imagen_url = ?, 
    imagen_public_id = ?,
    estado = ?, 
    stock = ?, 
    categorias_id = ? 
    WHERE idProductos = ?`,
    [
      nombre,
      precio,
      detalle,
      imagen_url,
      imagen_public_id,
      estado,
      stock,
      categorias_id,
      id,
    ],
  );

  return obtenerProductoId(id, conn);
};
//=============================================

//actualizar stock
export const actualizarStock = async (conn, idProducto, stock) => {
  await conn.query(
    `
    UPDATE productos
    SET stock = ?
    WHERE idProductos = ?`,
    [stock, idProducto],
  );

  return await obtenerProductoId(idProducto, conn);
};

//restar stock
export const restarStock = async (conn, idProducto, cantidad) => {
  await conn.query(
    `
    UPDATE productos
    SET stock = stock - ?
    WHERE idProductos = ?`,
    [cantidad, idProducto],
  );

  return await obtenerProductoId(idProducto, conn);
};

//sumar stock
export const sumarStock = async (conn, idProducto, cantidad) => {
  await conn.query(
    `
    UPDATE productos
    SET stock = stock + ?
    WHERE idProductos = ?`,
    [cantidad, idProducto],
  );

  return await obtenerProductoId(idProducto, conn);
};

// cambiar estado
export const cambiarEstadoProducto = async (id, estado, conn = connection) => {
  await conn.query(
    `
    UPDATE productos
    SET estado = ?
    WHERE idProductos = ?
    `,
    [estado, id],
  );
  return obtenerProductoId(id, conn);
};

//eliminar
export const eliminarProducto = async (id, conn) => {
  await conn.query(
    `DELETE FROM productos 
    WHERE idProductos = ?`,
    [id],
  );

  return true;
};
