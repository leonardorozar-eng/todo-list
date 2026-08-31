import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

// Endereço da API (sempre porta 3000)
const API = 'http://localhost:3000'

function Tarefas() {
  const navigate = useNavigate()

  // Lista de tarefas que veio do GET
  const [tarefas, setTarefas] = useState([])
  // Campos do formulário (criação e edição)
  const [titulo, setTitulo] = useState('')
  const [descricao, setDescricao] = useState('')
  // Se tiver id aqui, o form está editando essa tarefa
  const [editandoId, setEditandoId] = useState(null)
  // Feedbacks de tela
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  // Lê o token salvo no login
  function pegarToken() {
    return localStorage.getItem('token')
  }

  // Se a API responder 401, o token expirou: limpa e volta pro login
  function tratar401(status) {
    if (status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('email')
      navigate('/login')
      return true
    }
    return false
  }

  // ---------- READ: lista as tarefas do usuário logado ----------
  async function carregarTarefas() {
    setErro('')
    setCarregando(true)

    try {
      const token = pegarToken()

      // GET /tarefas com o Bearer token
      const resposta = await fetch(`${API}/tarefas`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (tratar401(resposta.status)) return

      const dados = await resposta.json()

      if (!resposta.ok) {
        setErro(dados.mensagem || 'Erro ao listar tarefas.')
        return
      }

      setTarefas(dados)
    } catch (error) {
      setErro('Erro ao conectar com o servidor.')
    } finally {
      setCarregando(false)
    }
  }

  // Roda o GET uma vez quando a tela abre
  useEffect(() => {
    carregarTarefas()
  }, [])

  function limparFormulario() {
    setTitulo('')
    setDescricao('')
    setEditandoId(null)
  }

  // ---------- CREATE e UPDATE no mesmo submit ----------
  async function handleSubmit(event) {
    event.preventDefault()
    setErro('')

    // Validação no front: titulo e descricao obrigatórios
    if (!titulo.trim() || !descricao.trim()) {
      setErro('Titulo e descricao são obrigatórios.')
      return
    }

    setSalvando(true)
    const token = pegarToken()

    try {
      if (editandoId) {
        // ---------- UPDATE: PUT /tarefas/:id ----------
        const resposta = await fetch(`${API}/tarefas/${editandoId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            titulo: titulo.trim(),
            descricao: descricao.trim()
          })
        })

        if (tratar401(resposta.status)) return

        const dados = await resposta.json()

        if (!resposta.ok) {
          setErro(dados.mensagem || 'Erro ao editar tarefa.')
          return
        }

        // Troca a tarefa antiga pela atualizada na lista
        setTarefas((lista) =>
          lista.map((item) => (item.id === editandoId ? dados : item))
        )
      } else {
        // ---------- CREATE: POST /tarefas ----------
        const resposta = await fetch(`${API}/tarefas`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            titulo: titulo.trim(),
            descricao: descricao.trim()
          })
        })

        if (tratar401(resposta.status)) return

        const dados = await resposta.json()

        if (!resposta.ok) {
          setErro(dados.mensagem || 'Erro ao criar tarefa.')
          return
        }

        // Coloca a nova tarefa no topo da lista
        setTarefas((lista) => [dados, ...lista])
      }

      limparFormulario()
    } catch (error) {
      setErro('Erro ao conectar com o servidor.')
    } finally {
      setSalvando(false)
    }
  }

  // Preenche o formulário para editar
  function handleEditar(tarefa) {
    setEditandoId(tarefa.id)
    setTitulo(tarefa.titulo)
    setDescricao(tarefa.descricao)
    setErro('')
  }

  // ---------- DELETE: DELETE /tarefas/:id ----------
  async function handleExcluir(id) {
    const confirmar = window.confirm('Deseja realmente excluir esta tarefa?')
    if (!confirmar) return

    setErro('')
    const token = pegarToken()

    try {
      const resposta = await fetch(`${API}/tarefas/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (tratar401(resposta.status)) return

      if (!resposta.ok) {
        const dados = await resposta.json()
        setErro(dados.mensagem || 'Erro ao excluir tarefa.')
        return
      }

      // Remove da lista local
      setTarefas((lista) => lista.filter((item) => item.id !== id))

      if (editandoId === id) {
        limparFormulario()
      }
    } catch (error) {
      setErro('Erro ao conectar com o servidor.')
    }
  }

  // Botão sair: limpa o storage e volta para o login
  function handleSair() {
    localStorage.removeItem('token')
    localStorage.removeItem('email')
    navigate('/login')
  }

  return (
    <section className="tarefas-page">
      <div className="tarefas-top">
        <div>
          <h2>Minhas tarefas</h2>
          <p className="muted">Crie, edite e organize o que precisa fazer.</p>
        </div>
        <button type="button" className="btn btn-ghost" onClick={handleSair}>
          Sair
        </button>
      </div>

      {erro && <p className="alert alert-error">{erro}</p>}

      <form className="form task-form" onSubmit={handleSubmit}>
        <h3>{editandoId ? 'Editar tarefa' : 'Nova tarefa'}</h3>

        <label htmlFor="task-titulo">Título</label>
        <input
          id="task-titulo"
          type="text"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          placeholder="Ex: Estudar React"
          required
        />

        <label htmlFor="task-descricao">Descrição</label>
        <textarea
          id="task-descricao"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          placeholder="Detalhe o que precisa ser feito"
          rows={3}
          required
        />

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={salvando}>
            {salvando ? 'Salvando...' : editandoId ? 'Salvar alteração' : 'Adicionar tarefa'}
          </button>

          {editandoId && (
            <button type="button" className="btn btn-secondary" onClick={limparFormulario}>
              Cancelar
            </button>
          )}
        </div>
      </form>

      <div className="task-list">
        {carregando && <p className="muted">Carregando tarefas...</p>}

        {!carregando && tarefas.length === 0 && (
          <p className="empty-state">Você ainda não tem tarefas. Crie a primeira acima.</p>
        )}

        {tarefas.map((tarefa) => (
          <article key={tarefa.id} className="task-card">
            <div className="task-card-body">
              <h3>{tarefa.titulo}</h3>
              <p>{tarefa.descricao}</p>
            </div>
            <div className="task-card-actions">
              <button type="button" className="btn btn-secondary" onClick={() => handleEditar(tarefa)}>
                Editar
              </button>
              <button type="button" className="btn btn-danger" onClick={() => handleExcluir(tarefa.id)}>
                Excluir
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

export default Tarefas
