import crypto from 'crypto';

const JWT_SECRET = 'todo_list_secret';

export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password, stored) {
  const [salt, hash] = String(stored).split(':');

  if (!salt || !hash) {
    return false;
  }

  const test = crypto.scryptSync(password, salt, 64).toString('hex');
  const hashBuf = Buffer.from(hash, 'hex');
  const testBuf = Buffer.from(test, 'hex');

  if (hashBuf.length !== testBuf.length) {
    return false;
  }

  return crypto.timingSafeEqual(hashBuf, testBuf);
}

export function signToken(payload) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(
    JSON.stringify({
      ...payload,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
    })
  ).toString('base64url');

  const data = `${header}.${body}`;
  const signature = crypto.createHmac('sha256', JWT_SECRET).update(data).digest('base64url');

  return `${data}.${signature}`;
}

export async function verificarToken(request, reply) {
  try {
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      return reply.status(401).send({ error: 'Token não informado.' });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return reply.status(401).send({ error: 'Token inválido.' });
    }

    const parts = token.split('.');

    if (parts.length !== 3) {
      return reply.status(401).send({ error: 'Token inválido ou expirado.' });
    }

    const [header, body, signature] = parts;
    const data = `${header}.${body}`;
    const expected = crypto.createHmac('sha256', JWT_SECRET).update(data).digest('base64url');
    const sigBuf = Buffer.from(signature);
    const expectedBuf = Buffer.from(expected);

    if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
      return reply.status(401).send({ error: 'Token inválido ou expirado.' });
    }

    const decoded = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));

    if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) {
      return reply.status(401).send({ error: 'Token inválido ou expirado.' });
    }

    request.userId = decoded.id;
  } catch (error) {
    return reply.status(401).send({ error: 'Token inválido ou expirado.' });
  }
}
