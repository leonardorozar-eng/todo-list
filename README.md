# To-Do List — Avaliação prática de recuperação

Dois projetos na mesma workspace:

```
todo-list/
├── backend/     → Fastify + pg (porta 3000)
└── frontend/    → Vite + React (porta 5173)
```

## Backend

No pgAdmin, crie o banco `todo_db` e rode o `backend/banco.sql`.

```bash
cd backend
npm install
npm start
```

## Frontend

```bash
cd frontend
npm install
npm start
```

Não envie `node_modules`.
