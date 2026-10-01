import { connection } from "../config/db.js";

//obtener mesa
export const obtenerMesas = async (buscar, estado, orden) => {
  let query = `
  SELECT 
  idMesas,
  numero,
  estado
  FROM mesas`;

  const valores = [];
  const condiciones = [];

  //buscar
  if (buscar) {
    condiciones.push("numero LIKE ?");
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
    case "recientes":
      query += " ORDER BY idMesas DESC";
      break;

    case "antiguas":
      query += " ORDER BY idMesas ASC";
      break;

    case "numero_asc":
      query += " ORDER BY numero ASC";
      break;

    case "numero_desc":
      query += " ORDER BY numero DESC";
      break;

    default:
      break;
  }
  const [rows] = await connection.query(query, valores);

  return rows;
};

//obtener por id
export const obtenerMesaId = async (id, conn = connection) => {
  const [rows] = await conn.query(
    `SELECT
     idMesas,
     numero,
     estado
     FROM mesas
    WHERE idMesas = ?`,
    [id],
  );

  return rows[0];
};

//liberar mesa
export const liberarMesaPedido = async (conn, idPedido) => {
  await conn.query(
    `
    UPDATE mesas m
    INNER JOIN pedido p
       ON p.idMesas = m.idMesas
     SET m.estado = 'Disponible' 
     WHERE p.idPedidos = ?
     `,
    [idPedido],
  );
};

//obtener mesa por numero
export const obtenerMesaPorNumero = async (numero) => {
  const [rows] = await connection.query(
    `
    SELECT 
    idMesas,
    numero,
    estado
    FROM mesas
    WHERE numero = ?`,
    [numero],
  );

  return rows[0];
};

export const obtenerMesaIdForUpdate = async (id, conn) => {
  const [rows] = await conn.query(
    `SELECT
      idMesas,
      numero,
      estado
    FROM mesas
    WHERE idMesas = ?
    FOR UPDATE`,
    [id],
  );

  return rows[0];
};

//obtner si tiene pedido
export const mesaTienePedidos = async (idMesas) => {
  const [rows] = await connection.query(
    `
    SELECT COUNT(*) AS total
    FROM pedido
    WHERE idMesas = ?`,
    [idMesas],
  );

  return rows[0].total > 0;
};

// crear mesa
export const crearMesa = async (mesa) => {
  const [result] = await connection.query(
    `INSERT INTO mesas (numero, estado) 
     VALUES (?, ?)`,
    [mesa.numero, mesa.estado],
  );

  return obtenerMesaId(result.insertId);
};

//actualizar mesa
export const actualizarMesa = async (idMesas, mesa) => {
  await connection.query(
    `UPDATE mesas 
    SET numero=?, estado=? 
    WHERE idMesas=?`,
    [mesa.numero, mesa.estado, idMesas],
  );

  return obtenerMesaId(idMesas);
};

//ocupar mesa usar para crear pedido
export const ocuparMesa = async (conn, idMesa) => {
  await conn.query(
    `
    UPDATE mesas
    SET estado = 'Ocupada'
    WHERE idMesas = ?`,
    [idMesa],
  );
};

export const cambiarEstadoMesa = async (idMesas, estado, conn = connection) => {
  await conn.query(
    `UPDATE mesas 
    SET estado=? 
    WHERE idMesas=?`,
    [estado, idMesas],
  );

  return obtenerMesaId(idMesas, conn);
};
//eliminar mesa
export const eliminarMesa = async (idMesas) => {
  await connection.query(
    `
    DELETE FROM mesas
    WHERE idMesas = ?`,
    [idMesas],
  );
  return true;
};
