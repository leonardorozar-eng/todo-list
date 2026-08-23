import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { loginUser } from '../services/api.js';

function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState(location.state?.mensagem || '');
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setErro('');
    setSucesso('');
    setCarregando(true);

    try {
      const data = await loginUser(email, password);

      // Guarda o JWT para as próximas requisições autenticadas
      localStorage.setItem('token', data.token);

      navigate('/tarefas');
    } catch (error) {
      setErro(error.message);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <section className="auth-card">
      <h2>Entrar</h2>
      <p className="auth-subtitle">Use seu email e senha para acessar as tarefas.</p>

      {sucesso && <p className="alert alert-success">{sucesso}</p>}
      {erro && <p className="alert alert-error">{erro}</p>}

      <form onSubmit={handleSubmit} className="form">
        <label htmlFor="login-email">Email</label>
        <input
          id="login-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="voce@email.com"
          required
          autoComplete="email"
        />

        <label htmlFor="login-password">Senha</label>
        <input
          id="login-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Sua senha"
          required
          autoComplete="current-password"
        />

        <button type="submit" className="btn btn-primary" disabled={carregando}>
          {carregando ? 'Entrando...' : 'Entrar'}
        </button>
      </form>

      <p className="auth-footer">
        Ainda não tem conta? <Link to="/register">Cadastre-se</Link>
      </p>
    </section>
  );
}

export default Login;
