-- 1) No pgAdmin, conecte no banco "postgres" e execute esta linha:
CREATE DATABASE todo_db;

-- 2) Depois conecte no banco "todo_db" e execute as tabelas abaixo.

-- Tabela de usuários (RF-01)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  senha VARCHAR(255) NOT NULL,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de tarefas (RF-04) — cada tarefa pertence a 1 usuário (1:N)
CREATE TABLE IF NOT EXISTS tarefas (
  id SERIAL PRIMARY KEY,
  titulo VARCHAR(150) NOT NULL,
  descricao TEXT NOT NULL,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
