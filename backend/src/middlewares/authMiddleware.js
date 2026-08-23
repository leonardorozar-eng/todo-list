const jwt = require('jsonwebtoken');

// Middleware de autenticação:
// 1) lê o header Authorization (formato: Bearer <token>)
// 2) valida o JWT com JWT_SECRET
// 3) injeta o id do usuário em req.userId para os controllers
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  // Sem header = não autenticado
  if (!authHeader) {
    return res.status(401).json({ error: 'Token não informado.' });
  }

  // "Bearer eyJhbGciOi..." → pega só o token (segunda parte)
  const parts = authHeader.split(' ');

  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ error: 'Formato de token inválido. Use: Bearer <token>' });
  }

  const token = parts[1];

  try {
    // decoded contém o payload que colocamos no login: { id: user.id }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.userId = decoded.id;

    return next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido ou expirado.' });
  }
}

module.exports = authMiddleware;
