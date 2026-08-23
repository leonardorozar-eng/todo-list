const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// POST /tasks  (protegido)
// A tarefa SEMPRE é vinculada ao usuário do token (req.userId)
async function create(req, res) {
  try {
    const { title, description } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'O título da tarefa é obrigatório.' });
    }

    const task = await prisma.task.create({
      data: {
        title,
        description: description || '',
        userId: req.userId, // vem do JWT, não do body (evita criar tarefa para outro usuário)
      },
    });

    return res.status(201).json(task);
  } catch (error) {
    console.error('Erro ao criar tarefa:', error);
    return res.status(500).json({ error: 'Erro interno ao criar tarefa.' });
  }
}

// GET /tasks  (protegido)
// Lista SOMENTE as tarefas do usuário logado
async function list(req, res) {
  try {
    const tasks = await prisma.task.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
    });

    return res.json(tasks);
  } catch (error) {
    console.error('Erro ao listar tarefas:', error);
    return res.status(500).json({ error: 'Erro interno ao listar tarefas.' });
  }
}

// GET /tasks/:id  (protegido)
async function getById(req, res) {
  try {
    const id = Number(req.params.id);

    const task = await prisma.task.findUnique({ where: { id } });

    if (!task) {
      return res.status(404).json({ error: 'Tarefa não encontrada.' });
    }

    // Um usuário só pode ver as próprias tarefas
    if (task.userId !== req.userId) {
      return res.status(403).json({ error: 'Você não tem permissão para ver esta tarefa.' });
    }

    return res.json(task);
  } catch (error) {
    console.error('Erro ao buscar tarefa:', error);
    return res.status(500).json({ error: 'Erro interno ao buscar tarefa.' });
  }
}

// PUT /tasks/:id  (protegido)
async function update(req, res) {
  try {
    const id = Number(req.params.id);
    const { title, description } = req.body;

    const task = await prisma.task.findUnique({ where: { id } });

    if (!task) {
      return res.status(404).json({ error: 'Tarefa não encontrada.' });
    }

    if (task.userId !== req.userId) {
      return res.status(403).json({ error: 'Você não tem permissão para editar esta tarefa.' });
    }

    const data = {};

    if (title !== undefined) {
      data.title = title;
    }

    if (description !== undefined) {
      data.description = description;
    }

    if (Object.keys(data).length === 0) {
      return res.status(400).json({ error: 'Informe título e/ou descrição para atualizar.' });
    }

    const updatedTask = await prisma.task.update({
      where: { id },
      data,
    });

    return res.json(updatedTask);
  } catch (error) {
    console.error('Erro ao atualizar tarefa:', error);
    return res.status(500).json({ error: 'Erro interno ao atualizar tarefa.' });
  }
}

// DELETE /tasks/:id  (protegido)
async function remove(req, res) {
  try {
    const id = Number(req.params.id);

    const task = await prisma.task.findUnique({ where: { id } });

    if (!task) {
      return res.status(404).json({ error: 'Tarefa não encontrada.' });
    }

    if (task.userId !== req.userId) {
      return res.status(403).json({ error: 'Você não tem permissão para deletar esta tarefa.' });
    }

    await prisma.task.delete({ where: { id } });

    return res.status(204).send();
  } catch (error) {
    console.error('Erro ao deletar tarefa:', error);
    return res.status(500).json({ error: 'Erro interno ao deletar tarefa.' });
  }
}

module.exports = {
  create,
  list,
  getById,
  update,
  remove,
};
