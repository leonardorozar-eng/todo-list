import { useState } from 'react';
import { loginUser } from '../services/api.js';

export default function Login({ aoLogar, irParaCadastro }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setErro('');
    setCarregando(true);

    try {
      const data = await loginUser(email, password);
      localStorage.setItem('token', data.token);
      aoLogar();
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
        />

        <label htmlFor="login-password">Senha</label>
        <input
          id="login-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Sua senha"
          required
        />

        <button type="submit" className="btn btn-primary" disabled={carregando}>
          {carregando ? 'Entrando...' : 'Entrar'}
        </button>
      </form>

      <p className="auth-footer">
        Ainda não tem conta?{' '}
        <button type="button" className="link-button" onClick={irParaCadastro}>
          Cadastre-se
        </button>
      </p>
    </section>
  );
}
