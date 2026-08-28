const fs = require('fs');
const path = require('path');

// Lê o arquivo .env sem biblioteca extra (só Node)
function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env');

  if (!fs.existsSync(envPath)) {
    return;
  }

  const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    const eq = trimmed.indexOf('=');

    if (eq === -1) {
      continue;
    }

    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

loadEnv();

const Fastify = require('fastify');
const { initDb } = require('./db');
const userRoutes = require('./routes/userRoutes');
const taskRoutes = require('./routes/taskRoutes');

const app = Fastify({ logger: false });

// Permite setar request.userId no middleware de autenticação
app.decorateRequest('userId', null);

// DELETE/GET do frontend mandam Content-Type: application/json sem body.
// O Fastify, por padrão, recusa isso — aceitamos body vazio como {}.
app.addContentTypeParser('application/json', { parseAs: 'string' }, (request, body, done) => {
  if (!body) {
    return done(null, {});
  }

  try {
    done(null, JSON.parse(body));
  } catch (error) {
    error.statusCode = 400;
    done(error, undefined);
  }
});

// CORS simples (sem pacote extra) para o frontend em outra porta
app.addHook('onRequest', async (request, reply) => {
  reply.header('Access-Control-Allow-Origin', '*');
  reply.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  reply.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (request.method === 'OPTIONS') {
    return reply.code(204).send();
  }
});

async function start() {
  await initDb();

  await app.register(userRoutes, { prefix: '/users' });
  await app.register(taskRoutes, { prefix: '/tasks' });

  const PORT = Number(process.env.PORT) || 3001;

  await app.listen({ port: PORT, host: '0.0.0.0' });
  console.log(`Servidor rodando em http://localhost:${PORT}`);
}

start().catch((error) => {
  console.error('Falha ao iniciar o servidor:', error.message);
  process.exit(1);
});
