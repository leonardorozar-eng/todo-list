import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createTask, deleteTask, getTasks, updateTask } from '../services/api.js';

function Tarefas() {
  const navigate = useNavigate();

  // Lista que vem do GET /tasks
  const [tarefas, setTarefas] = useState([]);

  // Campos do formulário (serve para criar E para editar)
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');

  // Se tiver um id aqui, o formulário está em modo edição (PUT)
  const [editandoId, setEditandoId] = useState(null);

  // Feedback visual
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [excluindoId, setExcluindoId] = useState(null);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  // Se o token expirar (401), limpa o storage e volta para o login
  function tratarErroAuth(error) {
    if (error.status === 401) {
      localStorage.removeItem('token');
      navigate('/login');
      return true;
    }
    return false;
  }

  function mostrarSucesso(mensagem) {
    setSucesso(mensagem);
    setTimeout(() => setSucesso(''), 2500);
  }

  // ---------- READ: carrega as tarefas do usuário logado ----------
  async function carregarTarefas() {
    setErro('');
    setCarregando(true);

    try {
      const data = await getTasks(); // GET /tasks
      setTarefas(data);
    } catch (error) {
      if (tratarErroAuth(error)) return;
      setErro(error.message);
    } finally {
      setCarregando(false);
    }
  }

  // Roda 1 vez quando a tela abre
  useEffect(() => {
    carregarTarefas();
  }, []);

  function limparFormulario() {
    setTitulo('');
    setDescricao('');
    setEditandoId(null);
  }

  // ---------- CREATE / UPDATE ----------
  async function handleSubmit(event) {
    event.preventDefault();
    setErro('');

    // Título e descrição são obrigatórios na interface
    if (!titulo.trim() || !descricao.trim()) {
      setErro('Título e descrição são obrigatórios.');
      return;
    }

    setSalvando(true);

    try {
      if (editandoId) {
        // PUT /tasks/:id
        const atualizada = await updateTask(editandoId, titulo.trim(), descricao.trim());
        setTarefas((lista) =>
          lista.map((tarefa) => (tarefa.id === editandoId ? atualizada : tarefa))
        );
        mostrarSucesso('Tarefa atualizada.');
      } else {
        // POST /tasks
        const nova = await createTask(titulo.trim(), descricao.trim());
        setTarefas((lista) => [nova, ...lista]);
        mostrarSucesso('Tarefa criada.');
      }

      limparFormulario();
    } catch (error) {
      if (tratarErroAuth(error)) return;
      setErro(error.message);
    } finally {
      setSalvando(false);
    }
  }

  // Preenche o formulário com a tarefa escolhida (modo edição)
  function handleEditar(tarefa) {
    setEditandoId(tarefa.id);
    setTitulo(tarefa.title);
    setDescricao(tarefa.description);
    setErro('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ---------- DELETE ----------
  async function handleExcluir(id) {
    const confirmar = window.confirm('Deseja realmente excluir esta tarefa?');
    if (!confirmar) return;

    setErro('');
    setExcluindoId(id);

    try {
      await deleteTask(id); // DELETE /tasks/:id
      setTarefas((lista) => lista.filter((tarefa) => tarefa.id !== id));

      // Se estava editando a tarefa apagada, limpa o form
      if (editandoId === id) {
        limparFormulario();
      }

      mostrarSucesso('Tarefa excluída.');
    } catch (error) {
      if (tratarErroAuth(error)) return;
      setErro(error.message);
    } finally {
      setExcluindoId(null);
    }
  }

  function handleLogout() {
    localStorage.removeItem('token');
    navigate('/login');
  }

  return (
    <section className="tarefas-page">
      <div className="tarefas-top">
        <div>
          <h2>Minhas tarefas</h2>
          <p className="muted">Crie, edite e organize o que precisa fazer.</p>
        </div>
        <button type="button" className="btn btn-ghost" onClick={handleLogout}>
          Sair
        </button>
      </div>

      {erro && <p className="alert alert-error">{erro}</p>}
      {sucesso && <p className="alert alert-success">{sucesso}</p>}

      {/* Formulário no topo: cria nova OU salva edição */}
      <form className="form task-form" onSubmit={handleSubmit}>
        <h3>{editandoId ? 'Editar tarefa' : 'Nova tarefa'}</h3>

        <label htmlFor="task-title">Título</label>
        <input
          id="task-title"
          type="text"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          placeholder="Ex: Estudar React"
          required
        />

        <label htmlFor="task-description">Descrição</label>
        <textarea
          id="task-description"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          placeholder="Detalhe o que precisa ser feito"
          rows={3}
          required
        />

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={salvando}>
            {salvando
              ? 'Salvando...'
              : editandoId
                ? 'Salvar alteração'
                : 'Adicionar tarefa'}
          </button>

          {editandoId && (
            <button type="button" className="btn btn-secondary" onClick={limparFormulario}>
              Cancelar
            </button>
          )}
        </div>
      </form>

      {/* Lista abaixo do formulário */}
      <div className="task-list">
        {carregando && <p className="muted">Carregando tarefas...</p>}

        {!carregando && tarefas.length === 0 && (
          <p className="empty-state">Você ainda não tem tarefas. Crie a primeira acima.</p>
        )}

        {tarefas.map((tarefa) => (
          <article key={tarefa.id} className="task-card">
            <div className="task-card-body">
              <h3>{tarefa.title}</h3>
              <p>{tarefa.description}</p>
            </div>

            <div className="task-card-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => handleEditar(tarefa)}
              >
                Editar
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => handleExcluir(tarefa.id)}
                disabled={excluindoId === tarefa.id}
              >
                {excluindoId === tarefa.id ? 'Excluindo...' : 'Excluir'}
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default Tarefas;
