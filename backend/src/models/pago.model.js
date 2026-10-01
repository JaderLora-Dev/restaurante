import { connection } from "../config/db.js";

//obtener pagos
export const obtenerPagos = async (
  page,
  limit,
  metodoPago,
  fechaInicio,
  fechaFin,
) => {
  let query = `
  SELECT
  pg.idPagos,
  pg.idPedidos,
  pg.metodoPago,
  pg.monto,
  pg.dineroRecibido,
  pg.cambio,
  p.fecha,
  m.numero AS mesa,
  u.nombre AS mesero
  FROM pagos pg
  INNER JOIN pedido p
    ON pg.idPedidos = p.idPedidos
  INNER JOIN mesas m
    ON p.idMesas = m.idMesas
  INNER JOIN usuarios u
    ON p.idUsuarios = u.idUsuarios
    `;

  let totalQuery = `
  SELECT COUNT(*) AS total
  FROM pagos pg
  INNER JOIN pedido p
    ON pg.idPedidos = p.idPedidos
  INNER JOIN mesas m
    ON p.idMesas = m.idMesas
  INNER JOIN usuarios u
    ON p.idUsuarios = u.idUsuarios
    `;
  const filtros = [];
  const valores = [];
  const totalValores = [];

  //filtro
  if (metodoPago) {
    filtros.push("pg.metodoPago = ?");
    valores.push(metodoPago);
    totalValores.push(metodoPago);
  }

  if (fechaInicio) {
    filtros.push("DATE(p.fecha) >= ?");
    valores.push(fechaInicio);
    totalValores.push(fechaInicio);
  }

  if (fechaFin) {
    filtros.push("DATE(p.fecha) <= ?");
    valores.push(fechaFin);
    totalValores.push(fechaFin);
  }

  if (filtros.length > 0) {
    const where = ` WHERE ${filtros.join(" AND ")}`;

    query += where;
    totalQuery += where;
  }

  query += `
  ORDER BY pg.idPagos DESC
  LIMIT ?
  OFFSET ?
  `;

  const offset = (page - 1) * limit;

  valores.push(limit, offset);

  const [pagos] = await connection.query(query, valores);

  const [totalRows] = await connection.query(totalQuery, totalValores);

  return {
    pagos,
    total: totalRows[0].total,
  };
};

//crear
export const crearPago = async (
  conn,
  idPedido,
  metodoPago,
  monto,
  dineroRecibido,
  cambio,
) => {
  const [result] = await conn.query(
    `
        INSERT INTO pagos
        (idPedidos, metodoPago, monto, dineroRecibido, cambio) 
        VALUES (?, ?, ?, ?, ?)`,
    [idPedido, metodoPago, monto, dineroRecibido, cambio],
  );

  return result.insertId;
};

//obtenerComprobante
export const obtenerComprobantePago = async (idPedido) => {
  const [rows] = await connection.query(
    `
    SELECT
    p.idPedidos,
    p.fecha,
    p.total,
    p.estado,
    m.numero AS mesa,
    u.nombre AS mesero,
    pg.idPagos,
    pg.metodoPago,
    pg.monto,
    pg.dineroRecibido,
    pg.cambio
FROM pedido p
INNER JOIN mesas m
    ON p.idMesas = m.idMesas
INNER JOIN usuarios u
    ON p.idUsuarios = u.idUsuarios
INNER JOIN pagos pg
    ON p.idPedidos = pg.idPedidos
WHERE p.idPedidos = ?
`,
    [idPedido],
  );

  return rows[0];
};

//detalles del comprobante
export const obtenerDetalleComprobante = async (idPedido) => {
  const [rows] = await connection.query(
    `
    SELECT
    dp.idDetalle_pedido,
    dp.cantidad,
    dp.observaciones,
    dp.subtotal,
    
    pr.nombre,
    pr.precio
    
    FROM detalle_pedido dp
    
    INNER JOIN productos pr
      ON dp.idProductos = pr.idProductos
      
    WHERE dp.idPedidos = ? 
    
    ORDER BY dp.idDetalle_pedido ASC
    `,
    [idPedido],
  );

  return rows;
};
