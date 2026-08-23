import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Login from './components/Login.jsx';
import Register from './components/Register.jsx';
import Tarefas from './components/Tarefas.jsx';

// Rota protegida: se não houver token no localStorage, manda para /login.
function RotaPrivada({ children }) {
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function App() {
  return (
    // BrowserRouter habilita as rotas no navegador (URL muda sem recarregar a página)
    <BrowserRouter>
      <div className="app-shell">
        <header className="app-header">
          <div className="app-header-inner">
            <span className="logo-mark" aria-hidden="true">✓</span>
            <h1>To-Do List</h1>
          </div>
        </header>

        <main className="app-main">
          <Routes>
            {/* Rotas públicas */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* /tarefas só abre se o usuário estiver logado */}
            <Route
              path="/tarefas"
              element={
                <RotaPrivada>
                  <Tarefas />
                </RotaPrivada>
              }
            />

            {/* Qualquer outro caminho cai na área de tarefas (ou no login, se não tiver token) */}
            <Route path="*" element={<Navigate to="/tarefas" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
