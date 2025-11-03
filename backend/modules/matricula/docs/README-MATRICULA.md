# 🎓 Módulo – Matrícula (Admin + Integração Automática)

---

## 🎯 Descrição e Objetivo

O módulo **Matrícula** é responsável por **criar alunos reais e suas matrículas** após a aprovação de uma pré-matrícula ou de forma manual pelo painel admin.  
Ele foi atualizado para suportar **multi-organizações**, garantindo que cada aluno e matrícula pertençam exclusivamente à academia, professor ou mestre correto.

---

## 🧱 Tecnologias Utilizadas

- **Node.js + Express**
- **MySQL (Railway)**
- **JWT (autenticação admin)**
- **Resend** – envio de e-mails automáticos
- **Logger customizado** (`utils/logger.js`)
- **Arquitetura em camadas** → Controller → Service → Repository

---

## 📂 Estrutura do Módulo

```

/modules/matricula/
│
├── matriculaController.js   → Recebe requisições HTTP e injeta organizacao_id
├── matriculaService.js      → Regras de negócio e fallback de organização
├── matriculaRepository.js   → Acesso direto ao banco (CRUD + validações)
├── matriculaRoutes.js       → Rotas internas com autenticação JWT
└── README-MATRICULA.md      → (este arquivo)

````

---

## ⚙️ Fluxo de Funcionamento

### 🔹 1. Aprovação Automática da Pré-Matrícula
- Quando uma pré-matrícula é aprovada no módulo `preMatriculas`,  
  o sistema chama automaticamente `matriculaService.criarMatricula()`.
- O processo cria:
  - Aluno real (`alunos`)
  - Registro de matrícula (`matriculas`)
  - Envia e-mails automáticos de confirmação

### 🔹 2. Criação Manual (painel admin)
- Endpoint: `POST /api/admin/matricula`
- Protegido por `authMiddleware`
- O `organizacao_id` é **injetado automaticamente** a partir do token JWT do admin logado.
- Permite criar um aluno e matrícula direto pelo painel, sem pré-matrícula.

---

## 🧩 Segurança Multi-Organização

| Camada | Responsabilidade | Detalhes |
|---------|------------------|-----------|
| **Controller** | Injeta `req.user.organizacao_id` automaticamente | Impede que o front defina outra organização |
| **Service** | Valida e reforça o `organizacao_id` | Usa fallback herdado da turma se necessário |
| **Repository** | Persiste `organizacao_id` em `alunos` e `matriculas` | Mantém vínculo direto no banco |
| **Banco de Dados** | Colunas `organizacao_id` com FK e `NOT NULL` | Integridade garantida com `ON DELETE CASCADE` |

✅ Nenhum admin pode criar ou visualizar matrículas fora da sua organização.  
✅ Toda matrícula criada tem rastreabilidade total no log (org + aluno + turma).

---

## 🧠 Regras de Negócio

- **CPF único** por aluno.
- **Organização obrigatória** em todos os registros.
- **Turma automática** definida pela idade.
- **Fallback seguro**: se o `organizacao_id` não vier do token, é herdado da turma.
- **Transação lógica dupla**: cria aluno e matrícula na sequência.
- **E-mails automáticos** disparados após sucesso.

---

## 🧪 Banco de Dados

### Tabelas envolvidas

| Tabela | Campo | Descrição |
|---------|--------|------------|
| `alunos` | `organizacao_id` | FK → `organizacoes(id)` (NOT NULL, CASCADE) |
| `matriculas` | `organizacao_id` | FK → `organizacoes(id)` (NOT NULL, CASCADE) |
| `turmas` | `organizacao_id` | Define o vínculo base para novas matrículas |

### Principais queries

```sql
INSERT INTO alunos (...)
INSERT INTO matriculas (aluno_id, turma_id, organizacao_id, data_inicio) VALUES (...)
SELECT organizacao_id FROM turmas WHERE id = ?
SELECT * FROM alunos WHERE organizacao_id = ?
````

---

## 📤 E-mails Automáticos

### ✉️ Aluno

**Assunto:** Matrícula confirmada

```
Olá [NOME],
Sua matrícula foi confirmada com sucesso!
```

### ✉️ Administradores

**Assunto:** Nova matrícula confirmada

```
Nova matrícula confirmada: [NOME] ([CPF])
```

---

## 🚀 Melhorias Futuras

* [ ] Implementar transação SQL real (COMMIT/ROLLBACK)
* [ ] Seleção manual de turma na criação direta
* [ ] Histórico de alterações (quem criou/alterou)
* [ ] Pagamentos vinculados à matrícula
* [ ] Relatórios por organização

---

## 📊 Status Atual

✅ Multi-organização completo
✅ Criação automática e manual funcional
✅ E-mails e logs operando
✅ Banco padronizado com FKs consistentes

---

## 👨‍💻 Responsável Técnico

**Lucas Fanha Felix**
*Desenvolvedor Full Stack – Projeto Capoeira Base*
[github.com/ffelixlucas](https://github.com/ffelixlucas)
