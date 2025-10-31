
# 🧭 **Documento Técnico – Relações entre Tabelas (Capoeira Base)**

### 📅 Atualizado: 31/10/2025  
### 📂 Local sugerido: `/docs/README-RELACOES-BANCO.md`  
### 🎯 Objetivo  
Descrever de forma clara e padronizada como as principais tabelas do **módulo escolar (alunos, turmas, categorias, equipe e horários)** se relacionam entre si, garantindo integridade de dados, automação de e-mails e consistência entre módulos.

---

## 🧱 **1. Estrutura Geral**

O Capoeira Base utiliza um modelo relacional organizado por **organização (multi-org)**, onde cada academia possui:
- suas próprias **turmas**;
- seus **instrutores (equipe)**;
- seus **alunos** e **categorias etárias**;
- e os **horários de treino** correspondentes.

---

## 🧩 **2. Tabelas Principais e suas Funções**

| Tabela | Função Principal | Chave Primária | Campos-Chave Relacionais |
|---------|------------------|----------------|---------------------------|
| **organizacoes** | Identifica cada escola/filial | `id` | — |
| **categorias** | Classifica alunos e turmas (Infantil, Juvenil, Adultos) | `id` | — |
| **equipe** | Armazena os instrutores, professores e responsáveis | `id` | — |
| **turmas** | Representa os grupos de treino, vinculados a categorias e instrutores | `id` | `categoria_id`, `equipe_id`, `organizacao_id` |
| **horarios_aula** | Define dias, horários e responsáveis de cada turma | `id` | `turma_id`, `responsavel_id`, `organizacao_id` |
| **alunos** | Armazena os dados de cada aluno e seu vínculo com turma e categoria | `id` | `turma_id`, `categoria_id`, `organizacao_id` |
| **matriculas** | Registra o vínculo aluno ↔ turma (histórico de entrada) | `id` | `aluno_id`, `turma_id`, `organizacao_id` |

---

## 🔗 **3. Relações Diretas**

### 🏫 **Organização**
Todas as tabelas possuem `organizacao_id`  
→ garante isolamento por escola e suporte multi-tenant.

---

### 🎓 **Categorias → Turmas**
- **Chave:** `turmas.categoria_id → categorias.id`
- **Função:** classifica turmas conforme faixa etária ou nível.

Exemplo:
| Categoria | Turmas vinculadas |
|------------|------------------|
| Infantil | Turma Infantil |
| Juvenil | Juvenil |
| Jovens e Adultos | Adultos |

---

### 🧑‍🏫 **Equipe → Turmas**
- **Chave:** `turmas.equipe_id → equipe.id`
- **Função:** define o **instrutor principal** responsável pela turma.

> Essa função é usada nos relatórios e e-mails como “Responsável: Instrutor X”.

---

### 🧩 **Turmas → Horários de Aula**
- **Chave:** `horarios_aula.turma_id → turmas.id`
- **Função:** relaciona cada horário (dia/horário) com uma turma específica.

| Turma | Dias | Horário |
|--------|------|----------|
| Adultos | Terça, Quinta | 20:00 - 21:30 |
| Juvenil | Terça, Quinta | 19:00 - 20:00 |

> Um mesmo `turma_id` pode ter vários registros de horário (1:N).

---

### 👥 **Equipe → Horários de Aula**
- **Chave:** `horarios_aula.responsavel_id → equipe.id`
- **Função:** identifica o instrutor que ministra **aquele horário específico**.  
  Pode ser diferente do `equipe_id` principal da turma.

---

### 🧒 **Alunos → Turmas**
- **Chave:** `alunos.turma_id → turmas.id`
- **Função:** define a qual grupo o aluno pertence atualmente.

---

### 👶 **Alunos → Categorias**
- **Chave:** `alunos.categoria_id → categorias.id`
- **Função:** classifica o aluno por idade/faixa (para relatórios e agrupamentos).

---

### 📜 **Matrículas → Alunos / Turmas**
- **Chaves:**  
  - `matriculas.aluno_id → alunos.id`  
  - `matriculas.turma_id → turmas.id`
- **Função:** histórico de entrada do aluno, permitindo rastrear data de início e término em cada turma.

---

## 🧭 **4. Relações em Cadeia**

Fluxo natural de dados dentro do sistema:

```
categorias
   ↑
   │ categoria_id
turmas
   ↑
   │ turma_id
horarios_aula
   ↑
   │ turma_id
alunos
   ↑
   │ aluno_id
matriculas
```

E em paralelo:

```
equipe
   ↑
   │ equipe_id (turmas)
   │ responsavel_id (horarios_aula)
turmas + horarios_aula
```

---

## 🧠 **5. Regras de Negócio**

| Regra | Descrição |
|-------|------------|
| 1️⃣ | Toda turma pertence a **uma organização** e **uma categoria**. |
| 2️⃣ | Toda turma tem **um instrutor principal (equipe_id)**. |
| 3️⃣ | Cada horário tem **um responsável** (pode ser outro instrutor). |
| 4️⃣ | Alunos estão sempre vinculados a uma turma (ativa) e categoria. |
| 5️⃣ | O `turma_id` é o elo central — conecta alunos, horários e matrículas. |
| 6️⃣ | E-mails de matrícula e relatórios de turma dependem desse relacionamento. |

---

## 🧩 **6. Exemplo prático (Organização CN10)**

| Categoria | Turma | Instrutor | Dias | Horário | Alunos |
|------------|--------|------------|--------|----------|--------|
| Infantil | Turma Infantil | Aline | Seg, Qua | 19:00 - 20:00 | Maria Clara |
| Juvenil | Juvenil | Erick | Ter, Qui | 19:00 - 20:00 | Helena |
| Jovens e Adultos | Adultos | Clone | Ter, Qui | 20:00 - 21:30 | Lucas |

---

## 🧮 **7. Dependências de Chaves (Foreign Keys)**

```sql
ALTER TABLE turmas
  ADD CONSTRAINT fk_turmas_categoria
  FOREIGN KEY (categoria_id) REFERENCES categorias(id)
  ON DELETE SET NULL;

ALTER TABLE turmas
  ADD CONSTRAINT fk_turmas_equipe
  FOREIGN KEY (equipe_id) REFERENCES equipe(id)
  ON DELETE CASCADE;

ALTER TABLE horarios_aula
  ADD CONSTRAINT fk_horarios_turma
  FOREIGN KEY (turma_id) REFERENCES turmas(id)
  ON DELETE SET NULL;

ALTER TABLE horarios_aula
  ADD CONSTRAINT fk_horarios_responsavel
  FOREIGN KEY (responsavel_id) REFERENCES equipe(id)
  ON DELETE SET NULL;

ALTER TABLE alunos
  ADD CONSTRAINT fk_alunos_turma
  FOREIGN KEY (turma_id) REFERENCES turmas(id)
  ON DELETE SET NULL;

ALTER TABLE alunos
  ADD CONSTRAINT fk_alunos_categoria
  FOREIGN KEY (categoria_id) REFERENCES categorias(id)
  ON DELETE SET NULL;
```

---

## ✅ **8. Conclusão**

- Todas as tabelas agora estão **corretamente normalizadas** (3FN).  
- As **foreign keys** garantem integridade entre turmas, horários e alunos.  
- O `turma_id` é o **elo central** que conecta todas as relações do fluxo de matrícula, e-mail, presenças e relatórios.  
- Essa base está pronta para evoluir com segurança para:
  - 📅 Presenças automatizadas  
  - 🎓 Histórico de alunos  
  - 📊 Relatórios e certificados  
