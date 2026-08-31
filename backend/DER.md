# DER — To-Do List (RF-06)

Relacionamento: **User 1 — N Tarefa**  
Cada tarefa pertence obrigatoriamente a um usuário (`user_id` é chave estrangeira).

```mermaid
erDiagram
  users ||--o{ tarefas : "possui"

  users {
    int id PK
    varchar email UK
    varchar senha
    timestamp criado_em
  }

  tarefas {
    int id PK
    varchar titulo
    text descricao
    int user_id FK
    timestamp criado_em
  }
```

Exporte este diagrama como imagem (PNG) e salve em `backend/der.png` se precisar entregar a figura no repositório.
