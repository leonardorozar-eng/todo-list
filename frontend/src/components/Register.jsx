import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

function Register() {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setErro('')
    setCarregando(true)

    try {
      // POST /usuarios — cadastro
      const resposta = await fetch('http://localhost:3000/usuarios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, senha })
      })

      const dados = await resposta.json()

      if (!resposta.ok) {
        setErro(dados.mensagem || 'Não foi possível cadastrar.')
        return
      }

      // Depois do cadastro, vai para o login
      navigate('/login')
    } catch (error) {
      setErro('Erro ao conectar com o servidor.')
    } finally {
      setCarregando(false)
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

        <label htmlFor="register-senha">Senha</label>
        <input
          id="register-senha"
          type="password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          placeholder="Sua senha"
          required
        />

        <button type="submit" className="btn btn-primary" disabled={carregando}>
          {carregando ? 'Cadastrando...' : 'Cadastrar'}
        </button>
      </form>

      <p className="auth-footer">
        Já tem conta? <Link to="/login">Entrar</Link>
      </p>
    </section>
  )
}

export default Register
