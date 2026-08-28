const { Pool } = require('pg');

// Pool: reutiliza conexões com o PostgreSQL (pacote pg)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Cria as tabelas se ainda não existirem (SQL direto, sem Prisma)
async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
  `);
}

module.exports = {
  pool,
  initDb,
};
