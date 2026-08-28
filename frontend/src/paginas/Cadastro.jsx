import { useState } from 'react';
import { registerUser } from '../services/api.js';

export default function Cadastro({ irParaLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setErro('');
    setCarregando(true);

    try {
      await registerUser(email, password);
      irParaLogin();
    } catch (error) {
      setErro(error.message);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <section className="auth-card">
      <h2>Criar conta</h2>
      <p className="auth-subtitle">Cadastre um email e uma senha para começar.</p>

      {erro && <p className="alert alert-error">{erro}</p>}

      <form onSubmit={handleSubmit} className="form">
        <label htmlFor="register-email">Email</label>
        <input
          id="register-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="voce@email.com"
          required
        />

        <label htmlFor="register-password">Senha</label>
        <input
          id="register-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Mínimo 6 caracteres"
          required
          minLength={6}
        />

        <button type="submit" className="btn btn-primary" disabled={carregando}>
          {carregando ? 'Cadastrando...' : 'Cadastrar'}
        </button>
      </form>

      <p className="auth-footer">
        Já tem conta?{' '}
        <button type="button" className="link-button" onClick={irParaLogin}>
          Entrar
        </button>
      </p>
    </section>
  );
}
