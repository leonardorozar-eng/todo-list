# To-Do List

Projeto único com **backend** (Fastify + PostgreSQL) e **frontend** (React + Vite).

```
todo-list/
├── backend/     → Node.js + Fastify + pg (porta 3001)
└── frontend/    → React + Vite (porta 5173)
```

## Backend

```bash
cd backend
npm install
psql -U postgres -c "CREATE DATABASE todo_list;"
npm run dev
```

## Frontend

```bash
cd frontend
npm install
npm run dev
```

App: `http://localhost:5173`  
API: `http://localhost:3001`
