// Todas as chamadas HTTP da aplicação passam por aqui.
// Base da API do backend (porta 3001).
const API_URL = 'http://localhost:3001';

function getToken() {
  return localStorage.getItem('token');
}

// Função genérica de fetch: monta URL, headers e trata erros.
async function request(path, options = {}) {
  const token = getToken();

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Se existir token, envia no padrão: Authorization: Bearer <token>
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  // DELETE bem-sucedido no backend retorna 204 (sem body)
  if (response.status === 204) {
    return null;
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.error || 'Erro na requisição.');
    error.status = response.status;
    throw error;
  }

  return data;
}

// ---- Auth / Users ----

export function registerUser(email, password) {
  return request('/users/register', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export function loginUser(email, password) {
  return request('/users/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

// ---- Tasks (CRUD) ----

export function getTasks() {
  return request('/tasks', { method: 'GET' });
}

export function createTask(title, description) {
  return request('/tasks', {
    method: 'POST',
    body: JSON.stringify({ title, description }),
  });
}

export function updateTask(id, title, description) {
  return request(`/tasks/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ title, description }),
  });
}

export function deleteTask(id) {
  return request(`/tasks/${id}`, { method: 'DELETE' });
}
