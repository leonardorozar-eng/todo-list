const { pool } = require('../db');

const TASK_PUBLIC =
  'id, title, description, user_id AS "userId", created_at AS "createdAt", updated_at AS "updatedAt"';

// POST /tasks  (protegido)
// A tarefa SEMPRE é vinculada ao usuário do token (request.userId)
async function create(request, reply) {
  try {
    const { title, description } = request.body || {};

    if (!title) {
      return reply.code(400).send({ error: 'O título da tarefa é obrigatório.' });
    }

    const result = await pool.query(
      `INSERT INTO tasks (title, description, user_id)
       VALUES ($1, $2, $3)
       RETURNING ${TASK_PUBLIC}`,
      [title, description || '', request.userId]
    );

    return reply.code(201).send(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar tarefa:', error);
    return reply.code(500).send({ error: 'Erro interno ao criar tarefa.' });
  }
}

// GET /tasks  (protegido)
// Lista SOMENTE as tarefas do usuário logado
async function list(request, reply) {
  try {
    const result = await pool.query(
      `SELECT ${TASK_PUBLIC}
       FROM tasks
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [request.userId]
    );

    return reply.send(result.rows);
  } catch (error) {
    console.error('Erro ao listar tarefas:', error);
    return reply.code(500).send({ error: 'Erro interno ao listar tarefas.' });
  }
}

// GET /tasks/:id  (protegido)
async function getById(request, reply) {
  try {
    const id = Number(request.params.id);

    const result = await pool.query(
      `SELECT ${TASK_PUBLIC} FROM tasks WHERE id = $1`,
      [id]
    );

    const task = result.rows[0];

    if (!task) {
      return reply.code(404).send({ error: 'Tarefa não encontrada.' });
    }

    if (task.userId !== request.userId) {
      return reply.code(403).send({ error: 'Você não tem permissão para ver esta tarefa.' });
    }

    return reply.send(task);
  } catch (error) {
    console.error('Erro ao buscar tarefa:', error);
    return reply.code(500).send({ error: 'Erro interno ao buscar tarefa.' });
  }
}

// PUT /tasks/:id  (protegido)
async function update(request, reply) {
  try {
    const id = Number(request.params.id);
    const { title, description } = request.body || {};

    const found = await pool.query(
      `SELECT ${TASK_PUBLIC} FROM tasks WHERE id = $1`,
      [id]
    );

    const task = found.rows[0];

    if (!task) {
      return reply.code(404).send({ error: 'Tarefa não encontrada.' });
    }

    if (task.userId !== request.userId) {
      return reply.code(403).send({ error: 'Você não tem permissão para editar esta tarefa.' });
    }

    if (title === undefined && description === undefined) {
      return reply.code(400).send({ error: 'Informe título e/ou descrição para atualizar.' });
    }

    const result = await pool.query(
      `UPDATE tasks
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           updated_at = NOW()
       WHERE id = $3
       RETURNING ${TASK_PUBLIC}`,
      [
        title !== undefined ? title : null,
        description !== undefined ? description : null,
        id,
      ]
    );

    return reply.send(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar tarefa:', error);
    return reply.code(500).send({ error: 'Erro interno ao atualizar tarefa.' });
  }
}

// DELETE /tasks/:id  (protegido)
async function remove(request, reply) {
  try {
    const id = Number(request.params.id);

    const found = await pool.query(
      `SELECT ${TASK_PUBLIC} FROM tasks WHERE id = $1`,
      [id]
    );

    const task = found.rows[0];

    if (!task) {
      return reply.code(404).send({ error: 'Tarefa não encontrada.' });
    }

    if (task.userId !== request.userId) {
      return reply.code(403).send({ error: 'Você não tem permissão para deletar esta tarefa.' });
    }

    await pool.query('DELETE FROM tasks WHERE id = $1', [id]);

    return reply.code(204).send();
  } catch (error) {
    console.error('Erro ao deletar tarefa:', error);
    return reply.code(500).send({ error: 'Erro interno ao deletar tarefa.' });
  }
}

module.exports = {
  create,
  list,
  getById,
  update,
  remove,
};
