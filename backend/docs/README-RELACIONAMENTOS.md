# 🧩 Relacionamentos do Banco de Dados — Projeto Capoeira Base

> Versão: 04/11/2025  
> Escopo: Módulos principais — **alunos, turmas, categorias e equipe**

---

## 🧭 Visão Geral

O sistema foi projetado com base em um **modelo multi-organização**, onde cada entidade (academia, grupo, organização) possui seus próprios dados isolados por meio da coluna `organizacao_id`.

Cada módulo é conectado por **chaves estrangeiras (FK)** que mantêm a integridade e garantem escalabilidade para academias diferentes.

---

## 🗂️ Estrutura e Relacionamentos

### 🧍‍♂️ Tabela `alunos`

| Campo | Tipo | Relação | Ação |
|--------|------|----------|-------|
| `organizacao_id` | INT | 🔗 `organizacoes.id` | `ON DELETE CASCADE` |
| `turma_id` | INT | 🔗 `turmas.id` | `ON DELETE SET NULL` |
| `categoria_id` | INT | 🔗 `categorias.id` | `ON DELETE SET NULL` |
| `graduacao_id` | INT | 🔗 `graduacoes.id` | `ON DELETE SET NULL` |
| `criado_por` | INT | 🔗 `equipe.id` | `ON DELETE SET NULL` |

**Descrição:**  
Cada aluno pertence a uma organização, pode estar matriculado em uma turma, e possui uma categoria base (definida pela idade).  
A relação com `turmas` é opcional (permite alunos “sem turma”).

---

### 🧑‍🏫 Tabela `turmas`

| Campo | Tipo | Relação | Ação |
|--------|------|----------|-------|
| `organizacao_id` | INT | 🔗 `organizacoes.id` | `ON DELETE CASCADE` |
| `categoria_id` | INT | 🔗 `categorias.id` | `ON DELETE SET NULL` |
| `equipe_id` | INT | 🔗 `equipe.id` | `ON DELETE CASCADE` |

**Descrição:**  
Turmas representam os **grupos de treino físicos** (por horário, local ou faixa etária).  
Uma turma pode ou não estar vinculada a uma categoria.  
Cada turma pertence a uma organização e pode ser gerenciada por um membro da equipe.

---

### 🧩 Tabela `categorias`

| Campo | Tipo | Relação | Ação |
|--------|------|----------|-------|
| `organizacao_id` | INT | 🔗 `organizacoes.id` | `ON DELETE CASCADE` |

**Descrição:**  
Categorias representam **faixas etárias ou níveis pedagógicos** (Ex.: Infantil, Juvenil, Adulto).  
Cada organização define suas próprias categorias, isoladas das demais academias.

---

### 👥 Tabela `equipe`

| Campo | Tipo | Relação | Ação |
|--------|------|----------|-------|
| `organizacao_id` | INT | 🔗 `organizacoes.id` | `ON DELETE CASCADE` |
| `grupo_id` | INT | 🔗 (controle interno de permissões e papéis) | — |

**Descrição:**  
Membros da equipe representam **instrutores, administradores ou auxiliares** vinculados a uma organização.  
Podem ser responsáveis por turmas e pelo cadastro de alunos.  
Cada registro pode estar associado a um `grupo_id` (para RBAC e permissões).

---

## 🔄 Relacionamento Visual (simplificado)

```
organizacoes
     │
     ├── categorias
     │       │
     │       └── turmas ─── alunos
     │                  │        │
     │                  └── equipe (instrutor)
     │
     └── equipe (admin, coordenação)
```

---

## ⚙️ Regras de Integridade

- `ON DELETE CASCADE`: ao excluir uma organização, apaga automaticamente suas turmas, categorias, alunos e equipe.
- `ON DELETE SET NULL`: preserva o histórico quando uma categoria ou turma é removida.
- `ON UPDATE CASCADE`: mantém integridade nas atualizações de IDs.

---

## 💡 Boas Práticas

1. Sempre incluir `organizacao_id` em **todas as consultas e inserções**.
   ```sql
   SELECT * FROM turmas WHERE organizacao_id = ?;
   ```
2. Turmas podem ser **mistas** → `categoria_id` pode ser `NULL`.
3. Alunos podem ficar **sem turma** (ex.: em fase de pré-matrícula).
4. Cada organização pode ter **categorias e turmas com o mesmo nome** sem conflito.
5. Todos os módulos devem respeitar o isolamento multi-organização.

---

## ✅ Conclusão

O modelo atual suporta:

- Multi-organizações (academias independentes)  
- Categorias e turmas dinâmicas  
- Turmas mistas e flexíveis  
- Controle de equipe e permissões por organização  
- Relacionamentos consistentes e seguros

> 📍 “Um banco preparado para crescer — várias academias, um único sistema.”

---
