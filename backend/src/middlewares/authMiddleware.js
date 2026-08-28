const { verifyToken } = require('../auth');

// Middleware de autenticação (Fastify preHandler):
// 1) lê o header Authorization (formato: Bearer <token>)
// 2) valida o JWT
// 3) injeta o id do usuário em request.userId para os controllers
async function authMiddleware(request, reply) {
  const authHeader = request.headers.authorization;

  if (!authHeader) {
    return reply.code(401).send({ error: 'Token não informado.' });
  }

  const parts = authHeader.split(' ');

  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return reply.code(401).send({ error: 'Formato de token inválido. Use: Bearer <token>' });
  }

  const token = parts[1];

  try {
    const decoded = verifyToken(token, process.env.JWT_SECRET);
    request.userId = decoded.id;
  } catch (error) {
    return reply.code(401).send({ error: 'Token inválido ou expirado.' });
  }
}

module.exports = authMiddleware;
