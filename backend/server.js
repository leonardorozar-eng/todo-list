// Importa o Fastify (servidor HTTP da aula)
import Fastify from 'fastify'
// Importa o plugin de CORS para o frontend (porta 5173) chamar a API
import cors from '@fastify/cors'
// Importa o Pool do pg para conectar no PostgreSQL
import { Pool } from 'pg'
// Importa o jsonwebtoken para gerar e validar o token de login
import jwt from 'jsonwebtoken'

// Segredo fixo só para a aula (não usar isso em produção)
const SECRET = 'senai-todo-secret'

// Cria o pool de conexões com o banco todo_db
const sql = new Pool({
  user: 'postgres',      // usuário do Postgres
  password: 'senai',     // senha padrão da aula
  host: 'localhost',     // banco local
  port: 5432,            // porta padrão do Postgres
  database: 'todo_db'    // nome do banco deste projeto
})

// Cria a instância do servidor Fastify
const servidor = Fastify()

// Libera CORS para qualquer origem (o React roda em outra porta)
await servidor.register(cors, { origin: '*' })

// Fastify recusa DELETE/GET com Content-Type json e body vazio — aceitamos {}
servidor.addContentTypeParser('application/json', { parseAs: 'string' }, (request, body, done) => {
  if (!body) {
    return done(null, {})
  }
  try {
    done(null, JSON.parse(body))
  } catch (error) {
    error.statusCode = 400
    done(error, undefined)
  }
})

// Middleware: lê o Bearer token, valida o JWT e guarda o id do usuário
async function verificarToken(request, reply) {
  // Pega o header Authorization
  const authHeader = request.headers.authorization

  // Se não veio header, não está autenticado
  if (!authHeader) {
    return reply.status(401).send({ mensagem: 'Token não informado' })
  }

  // Formato esperado: "Bearer tokenaqui"
  const partes = authHeader.split(' ')

  // Se não estiver no formato certo, rejeita
  if (partes.length !== 2 || partes[0] !== 'Bearer') {
    return reply.status(401).send({ mensagem: 'Token inválido' })
  }

  // Segunda parte é o JWT
  const token = partes[1]

  try {
    // Verifica a assinatura e a validade do token
    const dados = jwt.verify(token, SECRET)
    // Guarda o id do usuário logado na request para as rotas usarem
    request.userId = dados.id
  } catch (error) {
    // Token adulterado ou expirado
    return reply.status(401).send({ mensagem: 'Token inválido ou expirado' })
  }
}

// GET / — health check (só para saber se a API está no ar)
servidor.get('/', async () => {
  return { status: 'ok' }
})

// POST /usuarios — cadastro de um novo usuário (RF-01)
servidor.post('/usuarios', async (request, reply) => {
  // Lê email e senha do body
  const { email, senha } = request.body || {}

  // Validação: os dois campos são obrigatórios
  if (!email || !senha) {
    return reply.status(400).send({ mensagem: 'Email e senha são obrigatórios' })
  }

  // Verifica se o email já existe
  const existe = await sql.query('SELECT id FROM users WHERE email = $1', [email])

  // Se já tiver cadastro, não deixa duplicar
  if (existe.rowCount > 0) {
    return reply.status(400).send({ mensagem: 'Este email já está cadastrado' })
  }

  // Insere o usuário (senha em texto puro, padrão da aula)
  const resultado = await sql.query(
    'INSERT INTO users (email, senha) VALUES ($1, $2) RETURNING id, email, criado_em',
    [email, senha]
  )

  // 201 = criado
  return reply.code(201).send(resultado.rows[0])
})

// POST /login — autentica e devolve JWT (RF-02)
servidor.post('/login', async (request, reply) => {
  // Lê as credenciais
  const { email, senha } = request.body || {}

  // Validação dos campos
  if (!email || !senha) {
    return reply.status(400).send({ mensagem: 'Email e senha são obrigatórios' })
  }

  // Busca o usuário pelo email
  const resultado = await sql.query(
    'SELECT id, email, senha, criado_em FROM users WHERE email = $1',
    [email]
  )

  // Pega a primeira linha (ou undefined)
  const usuario = resultado.rows[0]

  // Email inexistente ou senha diferente
  if (!usuario || usuario.senha !== senha) {
    return reply.status(401).send({ mensagem: 'Email ou senha inválidos' })
  }

  // Gera o token com o id do usuário
  const token = jwt.sign({ id: usuario.id, email: usuario.email }, SECRET)

  // Resposta no formato pedido pelo enunciado
  return {
    login: true,
    token,
    usuario: {
      id: usuario.id,
      email: usuario.email,
      criado_em: usuario.criado_em
    }
  }
})

// GET /usuarios — lista usuários SEM a senha (RF-03)
servidor.get('/usuarios', async () => {
  // SELECT não inclui a coluna senha de propósito
  const resultado = await sql.query(
    'SELECT id, email, criado_em FROM users ORDER BY id ASC'
  )
  return resultado.rows
})

// PUT /usuarios/:id — atualiza email e senha (RF-03)
servidor.put('/usuarios/:id', async (request, reply) => {
  // id vem da URL
  const { id } = request.params
  // novos dados vêm do body
  const { email, senha } = request.body || {}

  // Validação
  if (!email || !senha) {
    return reply.status(400).send({ mensagem: 'Email e senha são obrigatórios' })
  }

  // Atualiza e devolve os dados públicos
  const resultado = await sql.query(
    'UPDATE users SET email = $1, senha = $2 WHERE id = $3 RETURNING id, email, criado_em',
    [email, senha, id]
  )

  // Se nenhuma linha mudou, o id não existe
  if (resultado.rowCount === 0) {
    return reply.status(404).send({ mensagem: 'Usuário não encontrado' })
  }

  return resultado.rows[0]
})

// DELETE /usuarios/:id — apaga o usuário (as tarefas caem no CASCADE)
servidor.delete('/usuarios/:id', async (request, reply) => {
  const { id } = request.params

  const resultado = await sql.query(
    'DELETE FROM users WHERE id = $1 RETURNING id',
    [id]
  )

  if (resultado.rowCount === 0) {
    return reply.status(404).send({ mensagem: 'Usuário não encontrado' })
  }

  return { mensagem: 'Usuário excluído' }
})

// GET /tarefas — lista SOMENTE as tarefas do usuário logado (RF-04 / RNF-03)
servidor.get('/tarefas', { preHandler: verificarToken }, async (request) => {
  // Filtra sempre pelo user_id do token
  const resultado = await sql.query(
    'SELECT id, titulo, descricao, user_id, criado_em FROM tarefas WHERE user_id = $1 ORDER BY id DESC',
    [request.userId]
  )
  return resultado.rows
})

// POST /tarefas — cria uma tarefa ligada ao usuário do token (RF-04)
servidor.post('/tarefas', { preHandler: verificarToken }, async (request, reply) => {
  const { titulo, descricao } = request.body || {}

  // Título e descrição são obrigatórios
  if (!titulo || !descricao) {
    return reply.status(400).send({ mensagem: 'Titulo e descricao são obrigatórios' })
  }

  // user_id NÃO vem do body — vem do JWT
  const resultado = await sql.query(
    'INSERT INTO tarefas (titulo, descricao, user_id) VALUES ($1, $2, $3) RETURNING id, titulo, descricao, user_id, criado_em',
    [titulo, descricao, request.userId]
  )

  return reply.code(201).send(resultado.rows[0])
})

// PUT /tarefas/:id — edita só se a tarefa for do usuário logado (RF-05)
servidor.put('/tarefas/:id', { preHandler: verificarToken }, async (request, reply) => {
  const { id } = request.params
  const { titulo, descricao } = request.body || {}

  if (!titulo || !descricao) {
    return reply.status(400).send({ mensagem: 'Titulo e descricao são obrigatórios' })
  }

  // Busca a tarefa para saber se existe e de quem é
  const encontrada = await sql.query(
    'SELECT user_id FROM tarefas WHERE id = $1',
    [id]
  )

  if (encontrada.rowCount === 0) {
    return reply.status(404).send({ mensagem: 'Tarefa não encontrada' })
  }

  // Se o dono for outro usuário, 403
  if (encontrada.rows[0].user_id !== request.userId) {
    return reply.status(403).send({ mensagem: 'Você não pode editar tarefa de outro usuário' })
  }

  const resultado = await sql.query(
    'UPDATE tarefas SET titulo = $1, descricao = $2 WHERE id = $3 AND user_id = $4 RETURNING id, titulo, descricao, user_id, criado_em',
    [titulo, descricao, id, request.userId]
  )

  return resultado.rows[0]
})

// DELETE /tarefas/:id — exclui só se a tarefa for do usuário logado (RF-05)
servidor.delete('/tarefas/:id', { preHandler: verificarToken }, async (request, reply) => {
  const { id } = request.params

  const encontrada = await sql.query(
    'SELECT user_id FROM tarefas WHERE id = $1',
    [id]
  )

  if (encontrada.rowCount === 0) {
    return reply.status(404).send({ mensagem: 'Tarefa não encontrada' })
  }

  if (encontrada.rows[0].user_id !== request.userId) {
    return reply.status(403).send({ mensagem: 'Você não pode excluir tarefa de outro usuário' })
  }

  await sql.query(
    'DELETE FROM tarefas WHERE id = $1 AND user_id = $2',
    [id, request.userId]
  )

  return { mensagem: 'Tarefa excluída' }
})

// Sobe o servidor na porta 3000 (padrão da aula)
servidor.listen({ port: 3000 }, (err) => {
  if (err) throw err
  console.log('Servidor rodando em http://localhost:3000')
})
