# 👥 Módulo Alunos – Capoeira Base

## ✅ Descrição e Objetivo

O módulo **Alunos** tem como objetivo:

- Gerenciar os alunos vinculados ao projeto.
- Permitir **cadastro, edição, exclusão e listagem** de alunos com vínculo em turmas.
- Garantir **visibilidade segmentada** para instrutores (RBAC).
- Exibir e filtrar alunos por turmas e/ou por status de vínculo ("Sem turma").
- Fornecer interface **mobile-first**, com modais de ficha e formulário.

---

## 🏗️ Estrutura de Banco e Backend

### **Tabela `alunos`**

| Campo                | Tipo     | Descrição                |
| -------------------- | -------- | ------------------------ |
| id                   | INT (PK) | Identificador único      |
| nome                 | VARCHAR  | Nome completo            |
| apelido              | VARCHAR  | Apelido                  |
| nascimento           | DATE     | Data de nascimento       |
| telefone_responsavel | VARCHAR  | Telefone do responsável  |
| nome_responsavel     | VARCHAR  | Nome do responsável      |
| endereco             | VARCHAR  | Endereço                 |
| graduacao            | VARCHAR  | Graduação (corda)        |
| observacoes_medicas  | TEXT     | Observações médicas      |
| foto_url             | VARCHAR  | (Opcional) Foto do aluno |
| criado_em            | DATETIME | Data de criação          |
| atualizado_em        | DATETIME | Última atualização       |

### **Tabela `matriculas`** _(Controle de vínculo com turmas)_

| Campo       | Tipo     | Descrição                                      |
| ----------- | -------- | ---------------------------------------------- |
| id          | INT (PK) | Identificador único                            |
| aluno_id    | INT (FK) | ID do aluno vinculado                          |
| turma_id    | INT (FK) | ID da turma                                    |
| data_inicio | DATE     | Data de início do vínculo                      |
| data_fim    | DATE     | Data de encerramento do vínculo (NULL = ativo) |
| criado_em   | DATETIME | Data de criação da matrícula                   |

### 🔗 Relacionamentos

- Cada **aluno** pode ter apenas **1 matrícula ativa** (`data_fim IS NULL`).
- Uma **turma** pode conter vários alunos.
- O vínculo aluno ↔ turma é feito exclusivamente através da **tabela `matriculas`**.

### 📜 Endpoints REST/API

| Método | Endpoint      | Descrição                                      |
| ------ | ------------- | ---------------------------------------------- |
| GET    | `/alunos`     | Lista todos os alunos (ou por filtro de turma) |
| GET    | `/alunos/:id` | Busca dados completos de um aluno              |
| POST   | `/alunos`     | Cria um novo aluno + matrícula inicial         |
| PUT    | `/alunos/:id` | Atualiza dados e troca turma (se aplicável)    |
| DELETE | `/alunos/:id` | Exclui aluno e encerra matrícula               |

### 🔥 Fluxo de Funcionamento (Backend)

1. **Cadastro:** cria aluno e matrícula inicial na turma escolhida.
2. **Edição:** se a turma mudar → matrícula anterior é encerrada, nova criada.
3. **Listagem:** admin vê todos; instrutor só vê alunos das suas turmas.
4. **Exclusão:** remove aluno e encerra matrícula ativa.

---

## 🎨 Estrutura Frontend

### 📂 Pastas

```

src/
├─ pages/
│   └─ Alunos.jsx              # Page principal (container)
│
├─ components/alunos/
│   ├─ AlunoList.jsx           # Lista de alunos + métricas + modal ficha
│   ├─ AlunoCard.jsx           # Card simples
│   ├─ AlunoLinha.jsx          # Linha de listagem
│   ├─ AlunoForm.jsx           # Formulário (cadastrar/editar)
│   ├─ ModalAluno.jsx          # Modal ficha completa
│   ├─ ModalAlunoForm.jsx      # Modal fullscreen (formulário)
│   └─ NotasAluno.jsx          # Observações pessoais
│
├─ hooks/
│   ├─ useAlunos.js            # CRUD + estado de alunos
│   ├─ useMinhasTurmas.js      # Define turmas visíveis do usuário
│   └─ useNotasAluno.js        # CRUD de observações
│
├─ services/
│   └─ alunoService.js         # API (listar, buscar, criar, editar, excluir, métricas)
│
└─ components/ui/
├─ InputBase.jsx           # Input reutilizável
├─ Busca.jsx               # Busca com debounce
├─ ContadorLista.jsx       # Contador de registros
└─ ModalFicha.jsx          # Base de modais de ficha

```

### 📌 Fluxo UX (Frontend)

#### 👨‍🏫 Instrutor

- Lista alunos apenas das suas turmas.
- Pode abrir ficha (`ModalAluno`) e ver métricas.
- Pode adicionar observações (`NotasAluno`).
- Não pode cadastrar/editar/excluir.
- Não vê alunos pendentes.

#### 👨‍💼 Admin

- Tudo que o instrutor pode.
- Cadastrar novo aluno (`ModalAlunoForm`).
- Editar aluno (`ModalAlunoForm`).
- Excluir aluno (`ModalAluno`).
- Planejado: ver/gerenciar **Matrículas Pendentes**.

---

## 🔑 Principais Componentes

- **Alunos.jsx** → controla busca, filtros, estados de modal.
- **AlunoList.jsx** → lista alunos + métricas + status (pendente/ativo/inativo).
- **ModalAluno.jsx** → ficha detalhada + métricas + notas + excluir.
- **AlunoForm.jsx** → cadastro/edição com `InputBase`.
- **ModalAlunoForm.jsx** → modal fullscreen para cadastro/edição.
- **NotasAluno.jsx** → observações pessoais (apenas autor ou admin exclui).

---

## 🚀 Status Atual

- ✔️ Backend estável (CRUD completo + RBAC + filtro "sem turma").
- ✔️ Frontend funcional com modais (`ModalAluno` e `ModalAlunoForm`).
- ✔️ Cadastro/edição já abre em modal fullscreen (mobile-first).
- ✔️ Inputs padronizados com `InputBase`.
- ✔️ Testado com perfis admin e instrutor.

---

## 🔗 Relação com Matrículas Pendentes

Alunos criados via formulário público entram inicialmente com **status = pendente**.  
Eles **não aparecem** na listagem principal de alunos até aprovação pelo admin.

A gestão desses alunos é feita no módulo **Matrículas Pendentes**  
→ veja `/docs/README-MATRICULAS-PENDENTES.md`.

## 🔮 Melhorias Futuras

- [ ] Matrículas pendentes → botão exclusivo admin com modal de aprovação/rejeição.
- [ ] Upload de foto do aluno (Firebase).
- [ ] Exportação de lista (CSV/Excel).
- [ ] Dashboard de métricas (por turma/faixa etária).
- [ ] Histórico detalhado de trocas de turma (auditoria em `matriculas`).

---

**Local:** `/docs/README-ALUNOS.md`  
**Versão:** 2.0 – **Status:** ✅ Finalizado (backend + frontend integrados)

```

---
```
