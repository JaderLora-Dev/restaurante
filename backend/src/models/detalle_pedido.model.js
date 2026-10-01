import { connection } from "../config/db.js";
import { obtenerPedidoId } from "./pedido.model.js";

//obtener detalle completo
export const obtenerDetallePedido = async (idPedido) => {
  const [rows] = await connection.query(
    `SELECT 
      dp.idDetalle_pedido,
      dp.idPedidos,
      dp.idProductos,
      p.imagen_url,
      p.nombre,
      p.stock,
      dp.cantidad,
      dp.precioUnitario,
      dp.subtotal,
      dp.observaciones
    FROM detalle_pedido dp
    INNER JOIN productos p
      ON dp.idProductos = p.idProductos
    WHERE dp.idPedidos = ?
    ORDER BY dp.idDetalle_pedido ASC`,
    [idPedido],
  );
  return rows;
};

export const obtenerDetallesPedidoTransaccion = async (conn, idPedido) => {
  const [rows] = await conn.query(
    `SELECT 
      dp.idDetalle_pedido,
      dp.idPedidos,
      dp.idProductos,
      dp.cantidad
    FROM detalle_pedido dp
    WHERE dp.idPedidos = ?
    ORDER BY dp.idDetalle_pedido ASC`,
    [idPedido],
  );

  return rows;
};

//obtener detalle por id
export const obtenerDetallePedidoId = async (id, conn = connection) => {
  const [rows] = await conn.query(
    `SELECT 
      dp.idDetalle_pedido,
      dp.idPedidos,
      dp.idProductos,
      p.imagen_url,
      p.nombre,
      p.stock,
      dp.cantidad,
      dp.precioUnitario,
      dp.subtotal,
      dp.observaciones
    FROM detalle_pedido dp
    INNER JOIN productos p
      ON dp.idProductos = p.idProductos
    WHERE dp.idDetalle_pedido = ?`,
    [id],
  );

  return rows[0];
};

//obtener detalle por id
export const obtenerDetallePedidoPorPedido = async (id, conn = connection) => {
  const [rows] = await conn.query(
    `
    SELECT 
      dp.idDetalle_pedido,
      dp.idPedidos,
      dp.idProductos,
      p.imagen_url,
      p.nombre,
      p.stock,
      dp.cantidad,
      dp.precioUnitario,
      dp.subtotal,
      dp.observaciones
    FROM detalle_pedido dp
    INNER JOIN productos p
      ON dp.idProductos = p.idProductos
    WHERE dp.idPedidos = ?
    ORDER BY dp.idDetalle_pedido ASC
    `,
    [id],
  );

  return rows;
};

//verificar si el producto esta en el pedido
export const existeProductoEnPedido = async (conn, idPedido, idProducto) => {
  const [rows] = await conn.query(
    `SELECT 
      idDetalle_pedido,
      idPedidos,
      idProductos,
      cantidad,
      precioUnitario,
      subtotal
    FROM detalle_pedido
    WHERE idPedidos = ? 
     AND idProductos = ?`,
    [idPedido, idProducto],
  );
  return rows[0];
};

//crear detalle
export const crearDetallePedido = async (conn, detallePedido) => {
  const [result] = await conn.query(
    `INSERT INTO detalle_pedido 
    (idPedidos, idProductos, cantidad, precioUnitario, subtotal, observaciones)
    VALUES (?, ?, ?, ?, ?, ?)`,
    [
      detallePedido.idPedidos,
      detallePedido.idProductos,
      detallePedido.cantidad,
      detallePedido.precioUnitario,
      detallePedido.subtotal,
      detallePedido.observaciones,
    ],
  );

  return await obtenerDetallePedidoId(result.insertId, conn);
};

// actualizar detalle pedido
export const actualizarDetallePedido = async (
  conn,
  idDetalle,
  cantidad,
  subtotal,
  observaciones,
) => {
  await conn.query(
    `UPDATE detalle_pedido
    SET 
        cantidad = ?,
        subtotal = ?,
        observaciones = ?
    WHERE idDetalle_pedido = ?`,
    [cantidad, subtotal, observaciones, idDetalle],
  );
  return await obtenerDetallePedidoId(idDetalle, conn);
};

//eliminar detalle
export const eliminarDetallePedido = async (conn, idDetalle) => {
  await conn.query(
    `DELETE FROM detalle_pedido 
    WHERE idDetalle_pedido = ?`,
    [idDetalle],
  );
  return true;
};

//calcular total del pedido
export const calcularTotalPedido = async (conn, idPedido) => {
  const [rows] = await conn.query(
    `
    SELECT COALESCE(SUM(subtotal), 0) AS total
    FROM detalle_pedido
    WHERE idPedidos = ?`,
    [idPedido],
  );
  return rows[0].total || 0;
};

// actualizar total del pedido
export const actualizarTotalPedido = async (conn, idPedido, total) => {
  await conn.query(
    `
    UPDATE pedido
    SET total = ?
    WHERE idPedidos = ?
    `,
    [total, idPedido],
  );

  return await obtenerPedidoId(idPedido, conn);
};
