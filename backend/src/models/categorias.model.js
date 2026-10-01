import { connection } from "../config/db.js";

//obtener categorias
export const obtenerCategorias = async (buscar, estado, orden) => {
  let query = `
  SELECT 
  id,
  nombre,
  estado
  FROM categorias`;

  const condiciones = [];
  const valores = [];

  //busqueda
  if (buscar) {
    condiciones.push("nombre LIKE ?");
    valores.push(`%${buscar}%`);
  }

  //estados
  if (estado) {
    condiciones.push("estado = ?");
    valores.push(estado);
  }

  //where
  if (condiciones.length > 0) {
    query += ` WHERE ${condiciones.join(" AND ")}`;
  }

  //ORDEN
  switch (orden) {
    case "nombre_asc":
      query += " ORDER BY nombre ASC";
      break;

    case "nombre_desc":
      query += " ORDER BY nombre DESC";
      break;

    case "reciente":
      query += " ORDER BY id DESC";
      break;

    case "antiguo":
      query += " ORDER BY id ASC";
      break;

    default:
      break;
  }
  const [rows] = await connection.query(query, valores);

  return rows;
};

//obtener por id
export const obtenerCategoriaId = async (id, conn = connection) => {
  const [rows] = await conn.query(
    `SELECT 
    id,
    nombre,
    estado
    FROM categorias
      WHERE id = ?
      LIMIT 1`,
    [id],
  );

  return rows[0] || null;
};

//obtener por nombre
export const obtenerCategoriaNombre = async (nombre) => {
  const [rows] = await connection.query(
    `
    SELECT 
    id,
    nombre
    FROM categorias
    WHERE nombre = ?
    LIMIT 1`,
    [nombre],
  );

  return rows[0] || null;
};

//validar si tiene productos
export const categoriaTieneProducto = async (categorias_id) => {
  const [rows] = await connection.query(
    `
    SELECT COUNT(*) AS total
    FROM productos
    WHERE categorias_id = ?`,
    [categorias_id],
  );

  return rows[0].total > 0;
};

// crear categorias
export const crearCategoria = async (categoria) => {
  const [result] = await connection.query(
    `
        INSERT INTO categorias (nombre, estado)
        VALUES(?, ?)`,
    [categoria.nombre, categoria.estado],
  );

  return await obtenerCategoriaId(result.insertId);
};

// actualizar categoria
export const actualizarCategoria = async (id, categoria) => {
  await connection.query(
    `
        UPDATE categorias
        SET nombre = ?, estado = ?
        WHERE id = ?`,
    [categoria.nombre, categoria.estado, id],
  );

  return obtenerCategoriaId(id);
};

//cambiar estado
export const cambiarEstadoCategoria = async (id, estado) => {
  await connection.query(
    `
    UPDATE categorias
    SET estado = ?
    WHERE id = ?`,
    [estado, id],
  );

  return obtenerCategoriaId(id);
};

//eliminar
export const eliminarCategoria = async (id) => {
  await connection.query(
    `
    DELETE FROM categorias
    WHERE id = ?`,
    [id],
  );

  return true;
};
