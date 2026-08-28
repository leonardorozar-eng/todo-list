import { useState } from 'react';
import Login from './paginas/Login.jsx';
import Cadastro from './paginas/Cadastro.jsx';
import Tarefas from './paginas/Tarefas.jsx';

function App() {
  const [tela, setTela] = useState(localStorage.getItem('token') ? 'tarefas' : 'login');

  function trocarDeTela(pagina) {
    if (pagina === 'tarefas' && !localStorage.getItem('token')) {
      setTela('login');
      return;
    }

    setTela(pagina);
  }

  function renderizar() {
    if (tela === 'login') {
      return <Login aoLogar={() => setTela('tarefas')} irParaCadastro={() => setTela('cadastro')} />;
    }

    if (tela === 'cadastro') {
      return <Cadastro irParaLogin={() => setTela('login')} />;
    }

    if (tela === 'tarefas') {
      return (
        <Tarefas
          aoSair={() => {
            localStorage.removeItem('token');
            setTela('login');
          }}
        />
      );
    }

    return <Login aoLogar={() => setTela('tarefas')} irParaCadastro={() => setTela('cadastro')} />;
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header-inner">
          <span className="logo-mark" aria-hidden="true">✓</span>
          <h1>To-Do List</h1>
        </div>
      </header>

      <nav className="app-nav">
        <button type="button" onClick={() => trocarDeTela('cadastro')}>Cadastro</button>
        <button type="button" onClick={() => trocarDeTela('login')}>Login</button>
        <button type="button" onClick={() => trocarDeTela('tarefas')}>Tarefas</button>
      </nav>

      <main className="app-main">
        {renderizar()}
      </main>
    </div>
  );
}

export default App;
