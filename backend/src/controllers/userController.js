const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Campos públicos do usuário (nunca devolver a senha)
const userPublicSelect = {
  id: true,
  email: true,
  createdAt: true,
};

// POST /users/register
async function register(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios.' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      return res.status(409).json({ error: 'Este email já está cadastrado.' });
    }

    // Hash da senha (nunca salvar a senha em texto puro)
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
      select: userPublicSelect,
    });

    return res.status(201).json(user);
  } catch (error) {
    console.error('Erro no cadastro:', error);
    return res.status(500).json({ error: 'Erro interno ao cadastrar usuário.' });
  }
}

// POST /users/login
async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios.' });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    // Mesma mensagem para email inexistente ou senha errada (não revela qual falhou)
    if (!user) {
      return res.status(401).json({ error: 'Email ou senha inválidos.' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Email ou senha inválidos.' });
    }

    // Token JWT: o frontend envia este token no header Authorization
    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Erro no login:', error);
    return res.status(500).json({ error: 'Erro interno ao fazer login.' });
  }
}

// GET /users  (protegido)
async function list(req, res) {
  try {
    const users = await prisma.user.findMany({
      select: userPublicSelect,
      orderBy: { id: 'asc' },
    });

    return res.json(users);
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    return res.status(500).json({ error: 'Erro interno ao listar usuários.' });
  }
}

// GET /users/:id  (protegido)
async function getById(req, res) {
  try {
    const id = Number(req.params.id);

    const user = await prisma.user.findUnique({
      where: { id },
      select: userPublicSelect,
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    return res.json(user);
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    return res.status(500).json({ error: 'Erro interno ao buscar usuário.' });
  }
}

// PUT /users/:id  (protegido — só o próprio usuário)
async function update(req, res) {
  try {
    const id = Number(req.params.id);

    // req.userId vem do authMiddleware (id extraído do JWT)
    if (id !== req.userId) {
      return res.status(403).json({ error: 'Você só pode atualizar o próprio usuário.' });
    }

    const { email, password } = req.body;

    const data = {};

    if (email) {
      data.email = email;
    }

    if (password) {
      data.password = await bcrypt.hash(password, 10);
    }

    if (Object.keys(data).length === 0) {
      return res.status(400).json({ error: 'Informe email e/ou senha para atualizar.' });
    }

    const user = await prisma.user.update({
      where: { id },
      data,
      select: userPublicSelect,
    });

    return res.json(user);
  } catch (error) {
    // Prisma P2002 = unique constraint (email duplicado)
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Este email já está em uso.' });
    }

    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    console.error('Erro ao atualizar usuário:', error);
    return res.status(500).json({ error: 'Erro interno ao atualizar usuário.' });
  }
}

// DELETE /users/:id  (protegido — só o próprio usuário)
async function remove(req, res) {
  try {
    const id = Number(req.params.id);

    if (id !== req.userId) {
      return res.status(403).json({ error: 'Você só pode deletar o próprio usuário.' });
    }

    // onDelete: Cascade no schema também apaga as tarefas deste usuário
    await prisma.user.delete({ where: { id } });

    return res.status(204).send();
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    console.error('Erro ao deletar usuário:', error);
    return res.status(500).json({ error: 'Erro interno ao deletar usuário.' });
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
