const taskController = require('../controllers/taskController');
const authMiddleware = require('../middlewares/authMiddleware');

async function taskRoutes(fastify) {
  // Todas as rotas de tarefas exigem token
  fastify.addHook('preHandler', authMiddleware);

  fastify.post('/', taskController.create);
  fastify.get('/', taskController.list);
  fastify.get('/:id', taskController.getById);
  fastify.put('/:id', taskController.update);
  fastify.delete('/:id', taskController.remove);
}

module.exports = taskRoutes;
