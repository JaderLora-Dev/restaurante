import { connection } from "../config/db.js";

//
export const obtenerUsuarioPorEmail = async (email) => {
  const [rows] = await connection.query(
    `
    SELECT 
      idUsuarios,
      nombre,
      email,
      contraseña,
      rol,
      estado
    FROM usuarios
    WHERE email =?
    AND estado = 'Activo'`,
    [email],
  );
  return rows[0];
};

//obtener usuarios
export const obtenerUsuarios = async () => {
  const [rows] = await connection.query(`
    SELECT 
     idUsuarios, 
     nombre, 
     email,
     rol,
     estado
    FROM usuarios`);
  return rows;
};

//obtoner por id
export const obtenerUsuarioId = async (id, conn = connection) => {
  const [rows] = await conn.query(
    `
    SELECT 
    idUsuarios,
     nombre, 
     email, 
     rol,
     estado
    FROM usuarios
    WHERE idUsuarios = ?`,
    [id],
  );

  return rows[0];
};

//cuantos admin activos
export const obtenerCantidadAdminActivos = async () => {
  const [rows] = await connection.query(`
    SELECT COUNT(*) AS total
    FROM usuarios
    WHERE rol = 'admin'
     AND estado = 'Activo' `);

  return rows[0].total;
};

// crear usuarios
export const crearUsuario = async (nombre, email, contraseña, rol) => {
  const [result] = await connection.query(
    `INSERT INTO usuarios 
    (nombre, email, contraseña, rol)
     VALUES (?, ?, ?, ?)`,
    [nombre, email, contraseña, rol],
  );
  return obtenerUsuarioId(result.insertId);
};

//actualizar usuario con contraseña
export const actualizarUsuarioConContraseña = async (
  nombre,
  email,
  contraseña,
  rol,
  id,
) => {
  await connection.query(
    `
    UPDATE usuarios
    SET nombre=?,
    email=?,
    contraseña=?, 
    rol=? 
    WHERE idUsuarios=?`,
    [nombre, email, contraseña, rol, id],
  );

  return await obtenerUsuarioId(id);
};

//actualizar usuario sin contraseña
export const actualizarUsuarioSinContraseña = async (
  nombre,
  email,
  rol,
  id,
) => {
  await connection.query(
    `
    UPDATE usuarios
    SET nombre=?, 
    email=?, 
    rol=?
    WHERE idUsuarios=?`,
    [nombre, email, rol, id],
  );

  return await obtenerUsuarioId(id);
};

//cambiar estado
export const cambiarEstadoUsuario = async (id, estado) => {
  await connection.query(
    `
    UPDATE usuarios
    SET estado = ?
    WHERE idUsuarios = ?`,
    [estado, id],
  );

  return await obtenerUsuarioId(id);
};

//cantidad de pedido usuarios
export const obtenerCantidadPedidoUsuario = async (id) => {
  const [rows] = await connection.query(
    `
    SELECT COUNT(*) AS total
    FROM pedido
    WHERE idUsuarios = ?`,
    [id],
  );

  return rows[0].total;
};

//eliminar usuario
export const eliminarUsuario = async (id) => {
  await connection.query(
    `
    DELETE FROM usuarios 
    WHERE idUsuarios=?`,
    [id],
  );

  return true;
};
