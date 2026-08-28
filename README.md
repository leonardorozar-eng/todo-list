# To-Do List (MVP)

Projeto único de To-Do List, separado em **backend** e **frontend**.

```
todo-list/
├── backend/     → API Node.js + Fastify + PostgreSQL (pg) (porta 3001)
└── frontend/    → React 18 + Vite (porta 5173)
```

## Como começar

Abra **dois terminais**.

### 1) Backend

```bash
cd backend
npm install
copy .env.example .env
```

Ajuste o `DATABASE_URL` no `.env` com a senha do PostgreSQL e crie o banco:

```bash
psql -U postgres -c "CREATE DATABASE todo_list;"
npm run dev
```

API: `http://localhost:3001`

### 2) Frontend

```bash
cd frontend
npm install
npm run dev
```

App: `http://localhost:5173`

Instruções detalhadas:

- [`backend/README.md`](./backend/README.md)
- [`frontend/README.md`](./frontend/README.md)
