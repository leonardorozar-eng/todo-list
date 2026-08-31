import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

function Login() {
  // Hook para trocar de página depois do login
  const navigate = useNavigate()

  // Estado do campo email
  const [email, setEmail] = useState('')
  // Estado do campo senha
  const [senha, setSenha] = useState('')
  // Mensagem de erro (fica vazia quando está tudo certo)
  const [erro, setErro] = useState('')
  // Flag para desabilitar o botão enquanto a API responde
  const [carregando, setCarregando] = useState(false)

  // Função chamada quando o usuário clica em Entrar
  async function handleSubmit(event) {
    // Impede o recarregamento padrão do formulário HTML
    event.preventDefault()
    // Limpa erro antigo
    setErro('')
    // Liga o loading
    setCarregando(true)

    try {
      // Chama POST /login na API da aula (porta 3000)
      const resposta = await fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, senha })
      })

      // Converte o JSON da resposta
      const dados = await resposta.json()

      // Se a API recusou (401/400), mostra a mensagem
      if (!resposta.ok) {
        setErro(dados.mensagem || 'Não foi possível entrar.')
        return
      }

      // Login ok: guarda o token e o email no localStorage
      localStorage.setItem('token', dados.token)
      localStorage.setItem('email', dados.usuario?.email || email)

      // Vai para a tela de tarefas
      navigate('/tarefas')
    } catch (error) {
      // Falha de rede (API desligada, por exemplo)
      setErro('Erro ao conectar com o servidor.')
    } finally {
      // Desliga o loading em qualquer caso
      setCarregando(false)
    }
  }

  return (
    <section className="auth-card">
      <h2>Entrar</h2>
      <p className="auth-subtitle">Use seu email e senha para acessar as tarefas.</p>

      {/* Só mostra o alerta se existir erro */}
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

        <label htmlFor="login-senha">Senha</label>
        <input
          id="login-senha"
          type="password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          placeholder="Sua senha"
          required
        />

        <button type="submit" className="btn btn-primary" disabled={carregando}>
          {carregando ? 'Entrando...' : 'Entrar'}
        </button>
      </form>

      <p className="auth-footer">
        Ainda não tem conta? <Link to="/cadastro">Cadastre-se</Link>
      </p>
    </section>
  )
}

export default Login
