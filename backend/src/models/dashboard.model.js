import { connection } from "../config/db.js";

/* ventas por dia */
export const obtenerVentasDia = async (fechaInicio, fechaFin) => {
  const [rows] = await connection.query(
    `
        SELECT
          DATE(fecha) AS dia,
          SUM(total) AS total
        FROM pedido
        WHERE estado = 'Finalizado'
          AND fecha >= ?
          AND fecha < DATE_ADD(?, INTERVAL 1 DAY)
        GROUP BY DATE(fecha)
        ORDER BY dia ASC
        `,
    [fechaInicio, fechaFin],
  );

  return rows;
};

/* ventas por semana */
export const obtenerVentasSemana = async (fechaInicio, fechaFin) => {
  const [rows] = await connection.query(
    `
        SELECT
          YEARWEEK(fecha, 1) AS semana,
          SUM(total) AS total
        FROM pedido
        WHERE estado = 'Finalizado'
          AND fecha >= ?
          AND fecha < DATE_ADD(?, INTERVAL 1 DAY)
        GROUP BY YEARWEEK(fecha, 1)
        ORDER BY semana ASC
        `,
    [fechaInicio, fechaFin],
  );

  return rows;
};

/* ventas por mes */
export const obtenerVentasMes = async (fechaInicio, fechaFin) => {
  const [rows] = await connection.query(
    `
    SELECT
      DATE_FORMAT(fecha, '%Y-%m') AS mes,
      SUM(total) AS total
    FROM pedido
    WHERE estado = 'Finalizado'
      AND fecha >= ?
      AND fecha < DATE_ADD(?, INTERVAL 1 DAY)
    GROUP BY DATE_FORMAT(fecha, '%Y-%m')
    ORDER BY mes ASC
        `,
    [fechaInicio, fechaFin],
  );

  return rows;
};

//ultimos  pedidos
export const obtenerUltimosPedidos = async () => {
  const [rows] = await connection.query(
    `
    SELECT
      p.idPedidos,
      p.fecha,
      p.estado,
      m.numero AS mesa,
      u.nombre AS mesero
    FROM pedido p
    INNER JOIN mesas m 
      ON p.idMesas = m.idMesas
    
    INNER JOIN usuarios u 
      ON p.idUsuarios = u.idUsuarios

    ORDER BY p.fecha DESC
    LIMIT 6;

    `,
  );

  return rows;
};

/*productos mas vendido */
export const obtenerProductosTop = async () => {
  const [rows] = await connection.query(
    `
    SELECT
      p.idProductos,
      p.nombre,
      p.imagen_url,
      SUM(dp.cantidad) AS vendidos
    FROM detalle_pedido dp

    INNER JOIN pedido pe
      ON dp.idPedidos = pe.idPedidos

    INNER JOIN productos p
      ON dp.idProductos = p.idProductos
        
    GROUP BY 
      p.idProductos, 
      p.nombre, 
      p.imagen_url

    ORDER BY vendidos DESC
    LIMIT 3
     `,
  );

  return rows;
};

/*mesero con mas ventas */
export const obtenerTopMeseros = async () => {
  const [rows] = await connection.query(
    `
    SELECT
      u.idUsuarios,
      u.nombre,
      COUNT(*) AS pedidos
    FROM pedido p
        
    INNER JOIN usuarios u
       ON p.idUsuarios = u.idUsuarios

    WHERE p.estado='Finalizado'
      
    GROUP BY 
      u.idUsuarios,
      u.nombre
        
    ORDER BY pedidos DESC
        `,
  );
  return rows;
};

/*obtenr resumen   */
export const obtenerResumen = async () => {
  const [[mesas]] = await connection.query(`
        SELECT COUNT(*) AS total
        FROM mesas
    `);

  const [[mesasDisponibles]] = await connection.query(
    `
    SELECT
      COUNT(*) -
    (
      SELECT COUNT(DISTINCT idMesas)
      FROM pedido
      WHERE estado = 'Activo'
    ) AS total
    FROM mesas`,
  );

  const [[usuarios]] = await connection.query(`
        SELECT COUNT(*) AS total
        FROM usuarios`);

  const [[productosVendidos]] = await connection.query(`
        SELECT COALESCE(SUM(dp.cantidad), 0) AS total
        FROM detalle_pedido dp
        INNER JOIN pedido p
          ON dp.idPedidos = p.idPedidos
        WHERE p.estado = 'Finalizado'
          AND DATE(p.fecha) = CURDATE();
    `);

  const [[ventasDias]] = await connection.query(
    `
    SELECT 
      COALESCE(SUM(total), 0) AS total
    FROM pedido
    WHERE estado = 'Finalizado'
      AND DATE(fecha) = CURDATE()`,
  );

  const [[pedidosHoy]] = await connection.query(`
    SELECT COUNT(*) AS total
    FROM pedido
    WHERE estado = 'Finalizado'
    AND DATE(fecha) = CURDATE()`);

  return {
    mesas: mesas.total,
    mesasDisponibles: mesasDisponibles.total,
    usuarios: usuarios.total,
    pedidos: pedidosHoy.total,
    productosHoy: productosVendidos.total,
    ventasHoy: ventasDias.total,
  };
};
