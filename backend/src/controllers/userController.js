const { pool } = require('../db');
const { hashPassword, verifyPassword, signToken } = require('../auth');

const USER_PUBLIC = 'id, email, created_at AS "createdAt"';

// POST /users/register
async function register(request, reply) {
  try {
    const { email, password } = request.body || {};

    if (!email || !password) {
      return reply.code(400).send({ error: 'Email e senha são obrigatórios.' });
    }

    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);

    if (existing.rowCount > 0) {
      return reply.code(409).send({ error: 'Este email já está cadastrado.' });
    }

    const hashedPassword = hashPassword(password);

    const result = await pool.query(
      `INSERT INTO users (email, password)
       VALUES ($1, $2)
       RETURNING ${USER_PUBLIC}`,
      [email, hashedPassword]
    );

    return reply.code(201).send(result.rows[0]);
  } catch (error) {
    console.error('Erro no cadastro:', error);
    return reply.code(500).send({ error: 'Erro interno ao cadastrar usuário.' });
  }
}

// POST /users/login
async function login(request, reply) {
  try {
    const { email, password } = request.body || {};

    if (!email || !password) {
      return reply.code(400).send({ error: 'Email e senha são obrigatórios.' });
    }

    const result = await pool.query(
      'SELECT id, email, password, created_at AS "createdAt" FROM users WHERE email = $1',
      [email]
    );

    const user = result.rows[0];

    if (!user || !verifyPassword(password, user.password)) {
      return reply.code(401).send({ error: 'Email ou senha inválidos.' });
    }

    const token = signToken({ id: user.id }, process.env.JWT_SECRET);

    return reply.send({
      token,
      user: {
        id: user.id,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Erro no login:', error);
    return reply.code(500).send({ error: 'Erro interno ao fazer login.' });
  }
}

// GET /users  (protegido)
async function list(request, reply) {
  try {
    const result = await pool.query(
      `SELECT ${USER_PUBLIC} FROM users ORDER BY id ASC`
    );

    return reply.send(result.rows);
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    return reply.code(500).send({ error: 'Erro interno ao listar usuários.' });
  }
}

// GET /users/:id  (protegido)
async function getById(request, reply) {
  try {
    const id = Number(request.params.id);

    const result = await pool.query(
      `SELECT ${USER_PUBLIC} FROM users WHERE id = $1`,
      [id]
    );

    if (result.rowCount === 0) {
      return reply.code(404).send({ error: 'Usuário não encontrado.' });
    }

    return reply.send(result.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    return reply.code(500).send({ error: 'Erro interno ao buscar usuário.' });
  }
}

// PUT /users/:id  (protegido — só o próprio usuário)
async function update(request, reply) {
  try {
    const id = Number(request.params.id);

    if (id !== request.userId) {
      return reply.code(403).send({ error: 'Você só pode atualizar o próprio usuário.' });
    }

    const { email, password } = request.body || {};
    const fields = [];
    const values = [];
    let index = 1;

    if (email) {
      fields.push(`email = $${index++}`);
      values.push(email);
    }

    if (password) {
      fields.push(`password = $${index++}`);
      values.push(hashPassword(password));
    }

    if (fields.length === 0) {
      return reply.code(400).send({ error: 'Informe email e/ou senha para atualizar.' });
    }

    values.push(id);

    const result = await pool.query(
      `UPDATE users
       SET ${fields.join(', ')}
       WHERE id = $${index}
       RETURNING ${USER_PUBLIC}`,
      values
    );

    if (result.rowCount === 0) {
      return reply.code(404).send({ error: 'Usuário não encontrado.' });
    }

    return reply.send(result.rows[0]);
  } catch (error) {
    // 23505 = unique_violation (email duplicado)
    if (error.code === '23505') {
      return reply.code(409).send({ error: 'Este email já está em uso.' });
    }

    console.error('Erro ao atualizar usuário:', error);
    return reply.code(500).send({ error: 'Erro interno ao atualizar usuário.' });
  }
}

// DELETE /users/:id  (protegido — só o próprio usuário)
async function remove(request, reply) {
  try {
    const id = Number(request.params.id);

    if (id !== request.userId) {
      return reply.code(403).send({ error: 'Você só pode deletar o próprio usuário.' });
    }

    // ON DELETE CASCADE no SQL também apaga as tarefas deste usuário
    const result = await pool.query('DELETE FROM users WHERE id = $1', [id]);

    if (result.rowCount === 0) {
      return reply.code(404).send({ error: 'Usuário não encontrado.' });
    }

    return reply.code(204).send();
  } catch (error) {
    console.error('Erro ao deletar usuário:', error);
    return reply.code(500).send({ error: 'Erro interno ao deletar usuário.' });
  }
}

module.exports = {
  register,
  login,
  list,
  getById,
  update,
  remove,
};
