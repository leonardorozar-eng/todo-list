# Backend — To-Do List

API REST da avaliação prática de recuperação.

- Node.js + Fastify + pg
- PostgreSQL (`todo_db`)
- Porta: **3000**

## Como criar o banco no pgAdmin

1. Abra o pgAdmin e conecte no servidor local.
2. Clique com o botão direito em **Databases** → **Create** → **Database**.
3. Nome: `todo_db`
4. Ou rode no Query Tool (conectado em `postgres`):

```sql
CREATE DATABASE todo_db;
```

## Como rodar o banco.sql

1. Conecte no banco `todo_db`.
2. Abra o arquivo `banco.sql`.
3. Execute os `CREATE TABLE` (users e tarefas).

Se o banco ainda não existir, a primeira linha do arquivo cria o `todo_db`.

## Como instalar e iniciar

```bash
npm install
npm start
```

API: `http://localhost:3000`

## Variáveis

Não há arquivo `.env`. A conexão está no `server.js`:

- user: `postgres`
- password: `senai`
- host: `localhost`
- port: `5432`
- database: `todo_db`

JWT secret (fixo no código, só para aula): `senai-todo-secret`

## Git

Não envie `node_modules` nem `.env` (já estão no `.gitignore`).
