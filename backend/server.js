import Fastify from 'fastify';
import { Pool } from 'pg';
import {
  verificarToken,
  hashPassword,
  verifyPassword,
  signToken,
} from './src/middlewares/auth.js';

const sql = new Pool({
  user: 'postgres',
  password: 'senai',
  host: 'localhost',
  port: 5432,
  database: 'todo_list',
});

const servidor = Fastify();

servidor.addContentTypeParser('application/json', { parseAs: 'string' }, (request, body, done) => {
  if (!body) {
    return done(null, {});
  }

  try {
    done(null, JSON.parse(body));
  } catch (error) {
    error.statusCode = 400;
    done(error, undefined);
  }
});

servidor.addHook('onRequest', async (request, reply) => {
  reply.header('Access-Control-Allow-Origin', '*');
  reply.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  reply.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (request.method === 'OPTIONS') {
    return reply.code(204).send();
  }
});

await sql.query(`
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
`);

const USER_PUBLIC = 'id, email, created_at AS "createdAt"';
const TASK_PUBLIC =
  'id, title, description, user_id AS "userId", created_at AS "createdAt", updated_at AS "updatedAt"';

// ==================== USUÁRIOS ====================

servidor.post('/users/register', async (request, reply) => {
  const { email, password } = request.body || {};

  if (!email || !password) {
    return reply.status(400).send({ error: 'Email e senha são obrigatórios.' });
  }

  const existente = await sql.query('SELECT id FROM users WHERE email = $1', [email]);

  if (existente.rowCount > 0) {
    return reply.status(409).send({ error: 'Este email já está cadastrado.' });
  }

  const resultado = await sql.query(
    `INSERT INTO users (email, password) VALUES ($1, $2) RETURNING ${USER_PUBLIC}`,
    [email, hashPassword(password)]
  );

  return reply.code(201).send(resultado.rows[0]);
});

servidor.post('/users/login', async (request, reply) => {
  const { email, password } = request.body || {};

  if (!email || !password) {
    return reply.status(400).send({ error: 'Email e senha são obrigatórios.' });
  }

  const resultado = await sql.query(
    'SELECT id, email, password, created_at AS "createdAt" FROM users WHERE email = $1',
    [email]
  );

  const user = resultado.rows[0];

  if (!user || !verifyPassword(password, user.password)) {
    return reply.status(401).send({ error: 'Email ou senha inválidos.' });
  }

  const token = signToken({ id: user.id });

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      createdAt: user.createdAt,
    },
  };
});

servidor.get('/users', { preHandler: verificarToken }, async () => {
  const resultado = await sql.query(`SELECT ${USER_PUBLIC} FROM users ORDER BY id ASC`);
  return resultado.rows;
});

servidor.get('/users/:id', { preHandler: verificarToken }, async (request, reply) => {
  const { id } = request.params;
  const resultado = await sql.query(`SELECT ${USER_PUBLIC} FROM users WHERE id = $1`, [id]);

  if (resultado.rowCount === 0) {
    return reply.status(404).send({ error: 'Usuário não encontrado.' });
  }

  return resultado.rows[0];
});

servidor.put('/users/:id', { preHandler: verificarToken }, async (request, reply) => {
  const id = Number(request.params.id);

  if (id !== request.userId) {
    return reply.status(403).send({ error: 'Você só pode atualizar o próprio usuário.' });
  }

  const { email, password } = request.body || {};
  const campos = [];
  const valores = [];
  let i = 1;

  if (email) {
    campos.push(`email = $${i++}`);
    valores.push(email);
  }

  if (password) {
    campos.push(`password = $${i++}`);
    valores.push(hashPassword(password));
  }

  if (campos.length === 0) {
    return reply.status(400).send({ error: 'Informe email e/ou senha para atualizar.' });
  }

  valores.push(id);

  try {
    const resultado = await sql.query(
      `UPDATE users SET ${campos.join(', ')} WHERE id = $${i} RETURNING ${USER_PUBLIC}`,
      valores
    );

    if (resultado.rowCount === 0) {
      return reply.status(404).send({ error: 'Usuário não encontrado.' });
    }

    return resultado.rows[0];
  } catch (error) {
    if (error.code === '23505') {
      return reply.status(409).send({ error: 'Este email já está em uso.' });
    }
    throw error;
  }
});

servidor.delete('/users/:id', { preHandler: verificarToken }, async (request, reply) => {
  const id = Number(request.params.id);

  if (id !== request.userId) {
    return reply.status(403).send({ error: 'Você só pode deletar o próprio usuário.' });
  }

  const resultado = await sql.query('DELETE FROM users WHERE id = $1', [id]);

  if (resultado.rowCount === 0) {
    return reply.status(404).send({ error: 'Usuário não encontrado.' });
  }

  return reply.code(204).send();
});

// ==================== TAREFAS ====================

servidor.post('/tasks', { preHandler: verificarToken }, async (request, reply) => {
  const { title, description } = request.body || {};

  if (!title) {
    return reply.status(400).send({ error: 'O título da tarefa é obrigatório.' });
  }

  const resultado = await sql.query(
    `INSERT INTO tasks (title, description, user_id)
     VALUES ($1, $2, $3)
     RETURNING ${TASK_PUBLIC}`,
    [title, description || '', request.userId]
  );

  return reply.code(201).send(resultado.rows[0]);
});

servidor.get('/tasks', { preHandler: verificarToken }, async (request) => {
  const resultado = await sql.query(
    `SELECT ${TASK_PUBLIC} FROM tasks WHERE user_id = $1 ORDER BY created_at DESC`,
    [request.userId]
  );

  return resultado.rows;
});

servidor.get('/tasks/:id', { preHandler: verificarToken }, async (request, reply) => {
  const { id } = request.params;
  const resultado = await sql.query(`SELECT ${TASK_PUBLIC} FROM tasks WHERE id = $1`, [id]);
  const task = resultado.rows[0];

  if (!task) {
    return reply.status(404).send({ error: 'Tarefa não encontrada.' });
  }

  if (task.userId !== request.userId) {
    return reply.status(403).send({ error: 'Você não tem permissão para ver esta tarefa.' });
  }

  return task;
});

servidor.put('/tasks/:id', { preHandler: verificarToken }, async (request, reply) => {
  const { id } = request.params;
  const { title, description } = request.body || {};

  const encontrado = await sql.query(`SELECT ${TASK_PUBLIC} FROM tasks WHERE id = $1`, [id]);
  const task = encontrado.rows[0];

  if (!task) {
    return reply.status(404).send({ error: 'Tarefa não encontrada.' });
  }

  if (task.userId !== request.userId) {
    return reply.status(403).send({ error: 'Você não tem permissão para editar esta tarefa.' });
  }

  if (title === undefined && description === undefined) {
    return reply.status(400).send({ error: 'Informe título e/ou descrição para atualizar.' });
  }

  const resultado = await sql.query(
    `UPDATE tasks
     SET title = COALESCE($1, title),
         description = COALESCE($2, description),
         updated_at = NOW()
     WHERE id = $3
     RETURNING ${TASK_PUBLIC}`,
    [title !== undefined ? title : null, description !== undefined ? description : null, id]
  );

  return resultado.rows[0];
});

servidor.delete('/tasks/:id', { preHandler: verificarToken }, async (request, reply) => {
  const { id } = request.params;
  const encontrado = await sql.query(`SELECT ${TASK_PUBLIC} FROM tasks WHERE id = $1`, [id]);
  const task = encontrado.rows[0];

  if (!task) {
    return reply.status(404).send({ error: 'Tarefa não encontrada.' });
  }

  if (task.userId !== request.userId) {
    return reply.status(403).send({ error: 'Você não tem permissão para deletar esta tarefa.' });
  }

  await sql.query('DELETE FROM tasks WHERE id = $1', [id]);
  return reply.code(204).send();
});

servidor.listen({ port: 3001 }, (err) => {
  if (err) throw err;
  console.log('Servidor rodando em http://localhost:3001');
});
