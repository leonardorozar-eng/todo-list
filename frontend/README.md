# Frontend — To-Do List

Interface em **React 18 + Vite** integrada à API do backend (`http://localhost:3001`).

## Como instalar

Na pasta `frontend`:

```bash
npm install
```

## Como iniciar

O backend precisa estar rodando na porta **3001**.

```bash
npm run dev
```

Abra: `http://localhost:5173`

## Rotas

| Caminho     | Tela     | Observação                         |
|-------------|----------|------------------------------------|
| `/login`    | Login    | Pública                            |
| `/register` | Cadastro | Pública                            |
| `/tarefas`  | Tarefas  | Protegida (precisa de token JWT)   |

## O que a tela de tarefas faz

- Lista as tarefas do usuário logado (`GET /tasks`)
- Cria tarefa (`POST /tasks`)
- Edita tarefa (`PUT /tasks/:id`)
- Exclui tarefa (`DELETE /tasks/:id`)
- Envia `Authorization: Bearer <token>`
- Logout limpa o token e volta para `/login`
