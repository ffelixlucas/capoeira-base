# 🏫 Módulo Turmas – Capoeira Base

## ✅ Descrição e Objetivo

O módulo **Turmas** tem como objetivo:
- Criar, editar, excluir e listar turmas de forma centralizada.
- Definir **instrutores responsáveis** por cada turma (`equipe_id`).
- Controlar a relação de alunos ↔ turmas via matrículas.
- Permitir que instrutores vejam apenas alunos das turmas sob sua responsabilidade (RBAC).

---

## 🏗️ Estrutura de Tabelas

### **Tabela `turmas`**
| Campo        | Tipo        | Descrição                                      |
|--------------|-------------|------------------------------------------------|
| id           | INT (PK)    | Identificador único da turma                    |
| nome         | VARCHAR     | Nome da turma (ex.: Infantil, Juvenil, Adulto) |
| faixa_etaria | VARCHAR     | Faixa etária da turma                           |
| equipe_id    | INT (FK)    | ID do instrutor responsável (tabela `equipe`)  |
| criado_em    | DATETIME    | Data de criação                                |

---

### **Tabela `matriculas`** *(vínculo aluno ↔ turma)*  
> Já documentada no [README-ALUNOS.md](./README-ALUNOS.md), mas referenciada neste módulo.

---

## 🔗 Relacionamentos

- Uma **turma** pode ter vários **alunos matriculados**.
- Cada turma possui **um instrutor responsável** (campo `equipe_id`).
- O vínculo aluno ↔ turma é feito pela tabela `matriculas` (apenas **1 matrícula ativa por aluno**).

---

## 🔥 Funcionalidades

- **CRUD completo de turmas:**
  - Criar nova turma definindo nome, faixa etária e instrutor responsável.
  - Editar turma existente (inclusive alterar instrutor).
  - Excluir turma (migração opcional de alunos para outra turma).
  - Encerrar turma com migração automática de alunos para a turma **"Sem turma"**.

- **Integração com RBAC:**
  - Admins podem gerenciar todas as turmas.
  - Instrutores listam apenas as turmas que são responsáveis.

- **Integração com módulo Alunos:**
  - Ao criar/editar aluno, a turma escolhida gera matrícula automaticamente.
  - Alterar turma do aluno encerra a matrícula anterior e cria uma nova.

---

## 📜 Endpoints REST/API

### **Turmas**
| Método | Endpoint                | Descrição                                                       |
|--------|-------------------------|-----------------------------------------------------------------|
| GET    | `/turmas`               | Lista todas as turmas ativas com instrutor vinculado            |
| GET    | `/turmas/minhas`        | Lista apenas as turmas vinculadas ao instrutor logado (RBAC)    |
| POST   | `/turmas`               | Cria nova turma (apenas Admin)                                  |
| PUT    | `/turmas/:id`           | Atualiza dados de uma turma (apenas Admin)                      |
| DELETE | `/turmas/:id`           | Exclui turma (apenas Admin)                                     |
| POST   | `/turmas/:id/encerrar`  | Encerra turma migrando alunos para outra turma ou "Sem turma"   |

---

## 🧠 Fluxo de Funcionamento

1. **Criação:** Admin cadastra turma definindo nome, faixa etária e `equipe_id` (instrutor responsável).
2. **Listagem:** 
   - Admins listam todas as turmas.
   - Instrutores listam apenas as suas turmas via `/minhas`.
3. **Encerramento:** Admin pode encerrar turma; os alunos matriculados são migrados automaticamente para outra turma (ou para "Sem turma").
4. **Integração com Alunos:** 
   - Toda matrícula está vinculada a uma turma existente.
   - Alterar turma no aluno reflete automaticamente no controle de matrículas.

---

## 🧩 Arquitetura Frontend

**Pasta:** `frontend/admin-vite/src/`

| Tipo | Local | Descrição |
|------|--------|------------|
| **Página** | `/pages/Turmas.jsx` | Tela principal com listagem, formulário e modal |
| **Hook** | `/hooks/useTurmas.js` | Gerencia estado e busca com debounce |
| **Service** | `/services/turmasService.js` | Comunicação com API REST |
| **Componentes** | `/components/turmas/` | |
| → `TurmaList.jsx` | Lista turmas (cards) com ações de editar/excluir |
| → `TurmaForm.jsx` | Formulário de criação e edição (usa `InputBase`) |
| → `ModalEncerrarTurma.jsx` | Modal para encerramento e migração de alunos |

**Fluxo visual:**  
`Turmas.jsx` → chama `useTurmas()` → renderiza `TurmaList` + `TurmaForm` + `ModalEncerrarTurma`.

---

## 🚀 Status Atual

- ✔️ CRUD completo e testado.
- ✔️ RBAC implementado no endpoint `/minhas`.
- ✔️ Integração com módulo Alunos e controle de matrículas.
- ✔️ Encerramento de turmas com migração automática funcionando.
- ✔️ Frontend e backend padronizados (Capoeira Base v2).

---

## 🔮 Melhorias Futuras

- [ ] Permitir mais de um instrutor responsável por turma.
- [ ] Permitir adicionar descrição ou informações extras sobre a turma.
- [ ] Dashboard com métricas de quantidade de alunos por turma/faixa etária.
- [ ] Histórico detalhado de encerramento de turmas.  

---

**Local:** `/docs/README-TURMAS.md`  
**Versão:** 1.0  
**Status:** ✅ Finalizado e estável.  
**Arquitetura:** Capoeira Base v2 (multi-organização + RBAC + logger integrado)
