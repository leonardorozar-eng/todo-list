const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');

async function userRoutes(fastify) {
  // Rotas públicas (não precisam de token)
  fastify.post('/register', userController.register);
  fastify.post('/login', userController.login);

  // Rotas protegidas (precisam de JWT válido)
  fastify.get('/', { preHandler: authMiddleware }, userController.list);
  fastify.get('/:id', { preHandler: authMiddleware }, userController.getById);
  fastify.put('/:id', { preHandler: authMiddleware }, userController.update);
  fastify.delete('/:id', { preHandler: authMiddleware }, userController.remove);
}

module.exports = userRoutes;
