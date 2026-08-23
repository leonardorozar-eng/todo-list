# Backend — To-Do List (MVP)

API REST de um sistema de tarefas, com autenticação JWT.

- **Node.js** + **Express**
- **Prisma ORM** + **SQLite**
- **bcryptjs** (hash de senha)
- **jsonwebtoken** (login)
- Porta padrão: **3001**

## Como instalar

Na pasta `backend`:

```bash
npm install
```

## Como configurar o .env

Copie o arquivo de exemplo e ajuste se quiser:

```bash
copy .env.example .env
```

No Linux/macOS:

```bash
cp .env.example .env
```

Conteúdo esperado:

```
PORT=3001
DATABASE_URL="file:./dev.db"
JWT_SECRET=troque_esta_chave_secreta
```

- `PORT` — porta do servidor
- `DATABASE_URL` — arquivo SQLite (fica em `prisma/dev.db`)
- `JWT_SECRET` — chave usada para assinar o token de login

## Como rodar as migrations

Cria as tabelas `User` e `Task` no SQLite:

```bash
npx prisma migrate dev
```

Quando o Prisma pedir um nome para a migration, use por exemplo: `init`.

## Como iniciar o servidor

```bash
npm run dev
```

O servidor sobe em: `http://localhost:3001`

## Endpoints

### Auth / Users

| Método | Rota              | Auth | Descrição              |
|--------|-------------------|------|------------------------|
| POST   | `/users/register` | Não  | Cadastro (senha hash)  |
| POST   | `/users/login`    | Não  | Login (retorna JWT)    |
| GET    | `/users`          | Sim  | Listar usuários        |
| GET    | `/users/:id`      | Sim  | Buscar usuário         |
| PUT    | `/users/:id`      | Sim  | Atualizar (só o próprio) |
| DELETE | `/users/:id`      | Sim  | Deletar (só o próprio) |

### Tasks

Todas exigem header: `Authorization: Bearer <token>`

| Método | Rota         | Descrição                                      |
|--------|--------------|------------------------------------------------|
| POST   | `/tasks`     | Criar tarefa (vinculada ao usuário do token)   |
| GET    | `/tasks`     | Listar só as tarefas do usuário logado         |
| GET    | `/tasks/:id` | Buscar uma tarefa (se for do usuário)          |
| PUT    | `/tasks/:id` | Editar (se for do usuário)                     |
| DELETE | `/tasks/:id` | Deletar (se for do usuário)                    |

## Testar as rotas

Abra `referencias.http` no VS Code com a extensão **REST Client**.
Há pelo menos um exemplo de **POST, GET, PUT e DELETE** para users e para tasks.

## Regras importantes

1. A senha é salva com **bcrypt** (nunca em texto puro).
2. O login devolve um **JWT** válido por 1 dia.
3. Toda tarefa é criada com o `userId` do token (não vem do body).
4. Um usuário só vê, edita e deleta **as próprias tarefas**.
