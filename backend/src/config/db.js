import mysql from "mysql2/promise.js";
import dotenv from "dotenv";

dotenv.config();

export const connection = await mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  ssl: {
    rejectUnauthorized: false,
  },

  waitForConnections: true,
  connectionLimit: 10,
  queryFormat: 0,
  connectTimeout: 30000,
});

try {
  const conexion = await connection.getConnection();
  console.log("Bade de datos conectada");

  conexion.release();
} catch (error) {
  console.error("Error", error.message);
}
