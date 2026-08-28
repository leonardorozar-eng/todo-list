const crypto = require('crypto');

// Hash da senha com scrypt (módulo nativo do Node — sem bcrypt)
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password, stored) {
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

// JWT HS256 feito com crypto do Node (sem jsonwebtoken)
function signToken(payload, secret, expiresInSeconds = 60 * 60 * 24) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(
    JSON.stringify({
      ...payload,
      exp: Math.floor(Date.now() / 1000) + expiresInSeconds,
    })
  ).toString('base64url');

  const data = `${header}.${body}`;
  const signature = crypto.createHmac('sha256', secret).update(data).digest('base64url');

  return `${data}.${signature}`;
}

function verifyToken(token, secret) {
  const parts = String(token).split('.');

  if (parts.length !== 3) {
    throw new Error('Token inválido');
  }

  const [header, body, signature] = parts;
  const data = `${header}.${body}`;
  const expected = crypto.createHmac('sha256', secret).update(data).digest('base64url');

  const sigBuf = Buffer.from(signature);
  const expectedBuf = Buffer.from(expected);

  if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
    throw new Error('Token inválido');
  }

  const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));

  if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
    throw new Error('Token expirado');
  }

  return payload;
}

module.exports = {
  hashPassword,
  verifyPassword,
  signToken,
  verifyToken,
};
