# 👥 Módulo Alunos – Capoeira Base

## ✅ Descrição e Objetivo

O módulo **Alunos** tem como objetivo:
- Gerenciar os alunos vinculados ao projeto.
- Permitir cadastro, edição, exclusão e listagem de alunos com vínculo em turmas.
- Garantir visibilidade segmentada para instrutores (RBAC).
- Exibir e filtrar alunos por turmas e/ou por status de vínculo ("Sem turma").

---

## 🏗️ Estrutura de Tabelas

### **Tabela `alunos`**
| Campo                | Tipo       | Descrição                              |
|----------------------|------------|----------------------------------------|
| id                   | INT (PK)   | Identificador único                    |
| nome                 | VARCHAR    | Nome completo                          |
| apelido              | VARCHAR    | Apelido                                |
| nascimento           | DATE       | Data de nascimento                     |
| telefone_responsavel | VARCHAR    | Telefone do responsável                 |
| nome_responsavel     | VARCHAR    | Nome do responsável                     |
| endereco             | VARCHAR    | Endereço                               |
| graduacao            | VARCHAR    | Graduação (corda)                      |
| observacoes_medicas  | TEXT       | Observações médicas                     |
| foto_url             | VARCHAR    | (Opcional) Foto do aluno                |
| criado_em            | DATETIME   | Data de criação                        |
| atualizado_em        | DATETIME   | Última atualização                      |

---

### **Tabela `matriculas`** *(Controle de vínculo com turmas)*

| Campo       | Tipo       | Descrição                                 |
|-------------|------------|-------------------------------------------|
| id          | INT (PK)   | Identificador único                       |
| aluno_id    | INT (FK)   | ID do aluno vinculado                      |
| turma_id    | INT (FK)   | ID da turma                               |
| data_inicio | DATE       | Data de início do vínculo                  |
| data_fim    | DATE       | Data de encerramento do vínculo (NULL = ativo) |
| criado_em   | DATETIME   | Data de criação da matrícula               |

---

## 🔗 Relacionamentos

- Cada **aluno** pode ter apenas **1 matrícula ativa** (`data_fim IS NULL`).
- Uma **turma** pode conter vários alunos.
- O vínculo aluno ↔ turma é feito exclusivamente através da **tabela `matriculas`**.

---

## 🔥 Funcionalidades

- **CRUD completo de alunos:**
  - Criar novo aluno com turma vinculada.
  - Editar dados do aluno e trocar a turma (atualiza matrícula automaticamente).
  - Excluir aluno (encerra matrícula).
- **Filtro de turmas:**
  - Filtrar alunos por turma específica.
  - Filtrar alunos "Sem turma" (sem matrícula ativa).
- **RBAC integrado:**
  - Admins veem todos os alunos.
  - Instrutores veem apenas alunos vinculados às suas turmas.
- Feedback visual com **toasts** em todas as ações.

---

## 📜 Endpoints REST/API

### **Alunos**
| Método | Endpoint            | Descrição                                         |
|--------|---------------------|---------------------------------------------------|
| GET    | `/alunos`           | Lista todos os alunos (ou por filtro de turma)    |
| GET    | `/alunos/:id`       | Busca dados completos de um aluno                 |
| POST   | `/alunos`           | Cria um novo aluno + matrícula inicial            |
| PUT    | `/alunos/:id`       | Atualiza dados e troca turma (se aplicável)       |
| DELETE | `/alunos/:id`       | Exclui aluno e encerra matrícula                   |

---

## 🧠 Fluxo de Funcionamento

1. **Cadastro:** Ao criar um aluno, uma matrícula inicial é gerada automaticamente na turma selecionada.
2. **Edição:** Se a turma for alterada no formulário, a matrícula anterior é encerrada e uma nova é criada.
3. **Listagem:** 
   - Admins podem filtrar por qualquer turma ou visualizar "Sem turma".
   - Instrutores veem apenas os alunos vinculados às suas turmas (via `equipe_id`).
4. **Exclusão:** Remove o aluno e encerra matrícula ativa.

---

## 🚀 Status Atual

- ✔️ CRUD completo e testado.
- ✔️ Filtro "Sem turma" funcional.
- ✔️ Integração com turmas e RBAC implementada.
- ✔️ Testado em ambiente real com diferentes perfis (Admin/Instrutor).

---

## 🔮 Melhorias Futuras

- [ ] Histórico detalhado de trocas de turma (auditoria de `matriculas`).
- [ ] Upload de foto do aluno.
- [ ] Exportação de dados (CSV ou Excel).
- [ ] Dashboard de métricas (quantidade por turma/faixa etária).

---

**Local:** `/docs/README-ALUNOS.md`  
**Versão:** 1.0 – **Status:** ✅ Finalizado e estável.