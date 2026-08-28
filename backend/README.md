# Backend — To-Do List (MVP)

API REST de um sistema de tarefas, com autenticação JWT.

- **Node.js** + **Fastify**
- **PostgreSQL** com o driver **pg**
- Hash de senha e JWT com o módulo nativo `crypto` do Node
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
DATABASE_URL=postgresql://postgres:SUA_SENHA@localhost:5432/todo_list
JWT_SECRET=troque_esta_chave_secreta
```

- `PORT` — porta do servidor
- `DATABASE_URL` — conexão com o PostgreSQL
- `JWT_SECRET` — chave usada para assinar o token de login

## Como preparar o banco

1. Crie o banco no PostgreSQL (ajuste o usuário se necessário):

```bash
psql -U postgres -c "CREATE DATABASE todo_list;"
```

2. As tabelas `users` e `tasks` são criadas automaticamente na primeira vez que o servidor sobe.

## Como iniciar o servidor

```bash
npm run dev
```

O servidor sobe em: `http://localhost:3001`

## Modelagem de Dados (DER)

O banco de dados é composto por duas tabelas relacionadas:

- **User**: armazena os dados dos usuários (id, email, password, createdAt)
- **Task**: armazena as tarefas (id, title, description, userId, createdAt, updatedAt)

Relacionamento: **User 1:N Task**  
Cada tarefa pertence obrigatoriamente a um usuário (`userId` é chave estrangeira).

![Diagrama de Entidade e Relacionamento](./der.png)

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

1. A senha é salva com **hash** (nunca em texto puro).
2. O login devolve um **JWT** válido por 1 dia.
3. Toda tarefa é criada com o `userId` do token (não vem do body).
4. Um usuário só vê, edita e deleta **as próprias tarefas**.
