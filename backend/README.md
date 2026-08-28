# Backend — To-Do List

API em **Node.js + Fastify + PostgreSQL (pg)**.

Porta: **3001**

## Como instalar

```bash
npm install
```

## Banco de dados

Crie o banco no PostgreSQL:

```bash
psql -U postgres -c "CREATE DATABASE todo_list;"
```

Senha usada no código: `senai` (igual às aulas).

O arquivo `banco.sql` tem as tabelas. Elas também são criadas automaticamente quando o servidor sobe.

## Como iniciar

```bash
npm run dev
```

Servidor: `http://localhost:3001`

## Modelagem de Dados (DER)

O banco de dados é composto por duas tabelas relacionadas:

- **User**: armazena os dados dos usuários (id, email, password, createdAt)
- **Task**: armazena as tarefas (id, title, description, userId, createdAt, updatedAt)

Relacionamento: **User 1:N Task**  
Cada tarefa pertence obrigatoriamente a um usuário (`userId` é chave estrangeira).

![Diagrama de Entidade e Relacionamento](./der.png)

## Endpoints

### Users

| Método | Rota              | Auth | Descrição              |
|--------|-------------------|------|------------------------|
| POST   | `/users/register` | Não  | Cadastro               |
| POST   | `/users/login`    | Não  | Login (retorna JWT)    |
| GET    | `/users`          | Sim  | Listar usuários        |
| GET    | `/users/:id`      | Sim  | Buscar usuário         |
| PUT    | `/users/:id`      | Sim  | Atualizar (só o próprio) |
| DELETE | `/users/:id`      | Sim  | Deletar (só o próprio) |

### Tasks

Todas exigem `Authorization: Bearer <token>`

| Método | Rota         | Descrição                    |
|--------|--------------|------------------------------|
| POST   | `/tasks`     | Criar tarefa do usuário      |
| GET    | `/tasks`     | Listar tarefas do usuário    |
| GET    | `/tasks/:id` | Buscar uma tarefa            |
| PUT    | `/tasks/:id` | Editar                       |
| DELETE | `/tasks/:id` | Deletar                      |

Testes prontos em `referencias.http`.
