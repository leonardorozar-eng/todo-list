// Importa as ferramentas de rota do React Router
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
// Importa as três telas do sistema
import Login from './components/Login.jsx'
import Register from './components/Register.jsx'
import Tarefas from './components/Tarefas.jsx'

// Componente que protege a rota /tarefas
function RotaPrivada({ children }) {
  // Lê o token salvo no navegador depois do login
  const token = localStorage.getItem('token')

  // Se não tiver token, manda o usuário para a tela de login
  if (!token) {
    return <Navigate to="/login" replace />
  }

  // Se tiver token, mostra a tela pedida (Tarefas)
  return children
}

function App() {
  return (
    // BrowserRouter habilita as URLs sem recarregar a página
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
            {/* Rota pública de login */}
            <Route path="/login" element={<Login />} />

            {/* Rota pública de cadastro */}
            <Route path="/cadastro" element={<Register />} />

            {/* Rota protegida: só entra se existir token */}
            <Route
              path="/tarefas"
              element={
                <RotaPrivada>
                  <Tarefas />
                </RotaPrivada>
              }
            />

            {/* Rota / : se já estiver logado vai para tarefas, senão para login */}
            <Route
              path="/"
              element={
                localStorage.getItem('token')
                  ? <Navigate to="/tarefas" replace />
                  : <Navigate to="/login" replace />
              }
            />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
