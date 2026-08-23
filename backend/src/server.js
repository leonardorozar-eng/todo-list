// Carrega as variáveis do arquivo .env (PORT, DATABASE_URL, JWT_SECRET)
require('dotenv').config();

const express = require('express');
const cors = require('cors');

// Rotas separadas por recurso
const userRoutes = require('./routes/userRoutes');
const taskRoutes = require('./routes/taskRoutes');

const app = express();

// cors: permite que o frontend (outra origem/porta) chame esta API
app.use(cors());

// express.json: lê o body das requisições no formato JSON
app.use(express.json());

// Prefixo /users → cadastro, login e CRUD de usuários
app.use('/users', userRoutes);

// Prefixo /tasks → CRUD de tarefas (todas as rotas exigem token)
app.use('/tasks', taskRoutes);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
