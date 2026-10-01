import { connection } from "../config/db.js";

//obtener pedidos
export const obtenerPedidos = async (page, limit, estado, mesero, mesa) => {
  let query = `
  SELECT
    p.idPedidos,
    p.estado,
    p.total,
    p.fecha,
    p.idUsuarios,
    m.numero AS mesa,
    u.nombre AS mesero
  FROM pedido p
  INNER JOIN mesas m 
    ON p.idMesas = m.idMesas
  INNER JOIN usuarios u 
    ON p.idUsuarios = u.idUsuarios
  `;

  let totalQuery = `
  SELECT COUNT(*) AS total
  FROM pedido p
  INNER JOIN mesas m
    ON p.idMesas = m.idMesas
  INNER JOIN usuarios u
    ON p.idUsuarios = u.idUsuarios

  `;

  const filtros = [];
  const valores = [];
  const totalValores = [];

  //por estados
  if (estado) {
    filtros.push("p.estado = ?");

    valores.push(estado);
    totalValores.push(estado);
  }

  // por mesero
  if (mesero) {
    filtros.push("p.idUsuarios = ? ");

    valores.push(mesero);
    totalValores.push(mesero);
  }

  //por mesa
  if (mesa) {
    filtros.push("p.idMesas = ?");

    valores.push(mesa);
    totalValores.push(mesa);
  }

  //where
  if (filtros.length > 0) {
    const where = `
    WHERE ${filtros.join(" AND ")}`;

    query += where;

    totalQuery += where;
  }

  //ordenar
  query += `
  ORDER BY p.idPedidos DESC
  `;

  //Paginacion
  const offset = (page - 1) * limit;

  query += `
  LIMIT ?
  OFFSET ?`;

  valores.push(limit, offset);

  //obtener pedidos
  const [pedidos] = await connection.query(query, valores);

  //obtener cantidad total
  const [totalRows] = await connection.query(totalQuery, totalValores);

  return { pedidos, total: totalRows[0].total };
};

//validar estado
export const obtenerPedidoId = async (id, conn = connection) => {
  const [rows] = await conn.query(
    `SELECT 
      p.idPedidos,
      p.idMesas,
      p.idUsuarios,
      p.estado,
      p.total,
      p.fecha,
      m.numero AS mesa,
      u.nombre AS mesero
      FROM pedido p
      INNER JOIN mesas m 
       ON p.idMesas = m.idMesas
      INNER JOIN usuarios u 
      ON p.idUsuarios = u.idUsuarios
      WHERE p.idPedidos = ?
      LIMIT 1`,
    [id],
  );
  return rows[0] || null;
};

export const obtenerPedidoIdForUpdate = async (id, conn) => {
  const [rows] = await conn.query(
    `
    SELECT
      p.idPedidos,
      p.idMesas,
      p.idUsuarios,
      p.estado,
      p.total,
      p.fecha,
      m.numero AS mesa,
      u.nombre AS mesero
    FROM pedido p
    INNER JOIN mesas m
      ON p.idMesas = m.idMesas
    INNER JOIN usuarios u
      ON p.idUsuarios = u.idUsuarios
    WHERE p.idPedidos = ?
    LIMIT 1
    FOR UPDATE
    `,
    [id],
  );

  return rows[0] || null;
};

//finalizar pedido
export const finalizarPedido = async (conn, idPedido) => {
  const [result] = await conn.query(
    `
    UPDATE pedido
    SET estado = 'Finalizado'
    WHERE idPedidos = ?
      AND estado = 'Activo'`,
    [idPedido],
  );

  return result.affectedRows;
};

//obtener pedido activo
export const obtenerPedidoActivoMesa = async (idMesa, conn = connection) => {
  const [rows] = await conn.query(
    `
    SELECT 
    p.idPedidos,
    p.idMesas,
    p.idUsuarios,
    m.numero AS mesa,
    u.nombre AS mesero,
    p.estado,
    p.total,
    p.fecha
    FROM pedido p
    INNER JOIN mesas m
    ON p.idMesas = m.idMesas
    INNER JOIN usuarios u 
    ON p.idUsuarios = u.idUsuarios
    WHERE p.idMesas = ?
    AND p.estado = 'Activo'
    `,
    [idMesa],
  );

  return rows[0] || null;
};

//obtener pedidos activos
export const obtenerPedidosActivos = async (idUsuario) => {
  const [rows] = await connection.query(
    `
     SELECT 
      p.idPedidos,
      p.idMesas,
      m.numero AS numeroMesa,
      p.idUsuarios,
      p.estado,
      p.total,
      p.fecha
    FROM pedido p
    INNER JOIN mesas m
      ON p.idMesas = m.idMesas
    WHERE p.idUsuarios = ?
    AND p.estado = 'Activo'
    ORDER BY p.fecha DESC`,
    [idUsuario],
  );

  return rows;
};

//crear pedido
export const crearPedido = async (conn, pedido) => {
  const [result] = await conn.query(
    `INSERT INTO pedido (
      idMesas,
      idUsuarios, 
      estado, 
      total
     )
     VALUES (?, ?, ?, ?)
     `,
    [pedido.idMesas, pedido.idUsuarios, pedido.estado, pedido.total],
  );

  return await obtenerPedidoId(result.insertId, conn);
};

//cambiar estado
export const cambiarEstadoPedido = async (conn, estado, id) => {
  await conn.query(
    `UPDATE pedido 
    SET estado = ? 
    WHERE idPedidos=?`,
    [estado, id],
  );

  return await obtenerPedidoId(id, conn);
};
