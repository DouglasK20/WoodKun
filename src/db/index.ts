import "dotenv/config"
import { drizzle } from "drizzle-orm/mysql2"
import mysql from "mysql2/promise"
import * as schema from "./schema"

const pool = mysql.createPool({ uri: process.env.DATABASE_URL as string })

// Toda conexão trabalha em UTC. O Drizzle lê/grava colunas timestamp assumindo UTC; se a sessão do MySQL
// estiver em outro fuso (o servidor local está em -03), os horários aparecem deslocados e o dia/mês pode mudar.
// As consultas de uma conexão rodam em ordem, então este SET sempre executa antes de qualquer outra
pool.on("connection", (connection) => {
  connection.query("SET time_zone = '+00:00'")
})

export const db = drizzle(pool, { schema, mode: "default" })
