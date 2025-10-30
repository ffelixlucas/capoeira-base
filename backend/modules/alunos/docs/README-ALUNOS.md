# 🧾 Módulo – Alunos (Admin + Instrutores)

---

## 🎯 Descrição e Objetivo

Gerenciar os **alunos matriculados** de forma segura, escalável e multi-organização,  
mantendo o controle completo de vínculo com turmas, histórico, frequência e status.

Cada organização (professor, mestre ou academia) visualiza e manipula apenas os próprios alunos.

---

## 🧱 Tecnologias Utilizadas

- **Node.js + Express**
- **MySQL (Railway)**
- **JWT + RBAC** (controle de acesso por papel)
- **Logger customizado** (`utils/logger.js`)
- **Arquitetura em camadas** → Controller → Service → Repository

---

## 📂 Estrutura do Módulo

```

/modules/alunos/
│
├── alunosController.js   → Recebe requisições e injeta organizacao_id
├── alunosService.js      → Regras de negócio e filtragem por organização
├── alunosRepository.js   → Queries SQL com WHERE organizacao_id = ?
├── alunosRoutes.js       → Rotas protegidas com verifyToken + checkRole
└── docs/README-ALUNOS.md → (este arquivo)

````

---

## ⚙️ Fluxo de Funcionamento

1️⃣ **Criação Automática:**  
Quando uma pré-matrícula é aprovada, o sistema cria um aluno real e vincula à turma correta.

2️⃣ **Criação Manual (Painel Admin):**  
O admin pode cadastrar um aluno diretamente no painel.  
O campo `organizacao_id` é injetado automaticamente pelo token JWT.

3️⃣ **Listagem e Edição:**  
- Admin vê todos os alunos da sua organização.  
- Instrutor vê apenas alunos das turmas que ele gerencia.  
- Nenhum usuário pode acessar alunos de outras academias.

4️⃣ **Exclusão / Status:**  
- Admin pode excluir ou mudar status (`ativo`, `inativo`, `pendente`).  
- Exclusão remove o aluno apenas da sua organização (com CASCADE ativo).

---

## 🔒 Segurança Multi-Organização

| Camada | Responsabilidade | Detalhes |
|---------|------------------|-----------|
| **Controller** | Injeta `req.usuario.organizacao_id` em todas as rotas | Evita que o front envie IDs falsos |
| **Service** | Repassa e valida `organizacao_id` antes de qualquer operação | Isolamento entre academias |
| **Repository** | Todas as queries incluem `WHERE a.organizacao_id = ?` | Segurança no nível do banco |
| **Banco de Dados** | FK `ON DELETE CASCADE ON UPDATE CASCADE` | Integridade automática entre módulos |

✅ Nenhum instrutor/admin pode acessar alunos de outra organização.  
✅ Toda operação (listar, editar, deletar) é restrita ao `organizacao_id` do token.

---

## 🧠 Regras de Negócio

- `nome` e `turma_id` obrigatórios  
- `cpf` único por organização  
- `organizacao_id` obrigatório em toda operação  
- Exclusão → física, limitada à organização  
- Troca de turma → encerra matrícula anterior (`data_fim`) e cria nova  
- `status` padrão = `"pendente"` até aprovação

---

## 🧩 Relacionamentos de Banco

### 🔹 Tabela `alunos`

| Campo | Tipo | Regra |
|--------|------|-------|
| `id` | INT | PK |
| `organizacao_id` | INT | FK → `organizacoes(id)` `ON DELETE CASCADE ON UPDATE CASCADE` |
| `turma_id` | INT | FK → `turmas(id)` `ON DELETE SET NULL` |
| `criado_por` | INT | FK → `equipe(id)` `ON DELETE SET NULL` |
| `status` | ENUM('pendente','ativo','inativo') | padrão `pendente` |
| `cpf` | VARCHAR(20) | único |
| `graduacao` | VARCHAR(50) | opcional |
| `foto_url` | TEXT | opcional |

### 🔹 Outras relações diretas
- `matriculas` → define vínculo técnico aluno ↔ turma  
- `frequencia` → controle de presença por data  
- `organizacoes` → isola cada academia  

---

## 📊 Permissões (RBAC)

| Papel | Permissões |
|-------|-------------|
| **admin** | listar, criar, editar, excluir, aprovar/rejeitar pendentes |
| **instrutor** | listar alunos das suas turmas, editar dados básicos |
| **visitante** | nenhum acesso (rota protegida por JWT) |

---

## 📦 Endpoints

| Método | Rota | Descrição | Acesso |
|---------|------|------------|---------|
| `GET` | `/api/alunos` | Lista alunos da organização | admin, instrutor |
| `GET` | `/api/alunos/:id` | Busca aluno por ID | admin, instrutor |
| `POST` | `/api/alunos` | Cadastra aluno (injeta org automática) | admin, instrutor |
| `PUT` | `/api/alunos/:id` | Edita aluno | admin, instrutor |
| `DELETE` | `/api/alunos/:id` | Exclui aluno (org isolada) | admin |
| `PUT` | `/api/alunos/:id/trocar-turma` | Troca de turma | admin, instrutor |
| `GET` | `/api/alunos/pendentes` | Lista pendentes (status=pendente) | admin |
| `PATCH` | `/api/alunos/:id/status` | Atualiza status (ativo/inativo) | admin |

---

## 🧾 Exemplo de Criação (via painel)

```json
POST /api/alunos
{
  "nome": "Lucas Silva",
  "apelido": "Luquinha",
  "nascimento": "2015-02-01",
  "telefone_responsavel": "41999999999",
  "nome_responsavel": "Maria Silva",
  "endereco": "Rua da Capoeira, 123",
  "graduacao": "corda amarela",
  "observacoes_medicas": "asmático",
  "turma_id": 2
}
````

📎 O campo `organizacao_id` é injetado automaticamente pelo token JWT.

---

## 🧮 Estrutura SQL Simplificada

```sql
CREATE TABLE alunos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  organizacao_id INT NOT NULL DEFAULT 1,
  nome VARCHAR(100) NOT NULL,
  cpf VARCHAR(20) UNIQUE,
  status ENUM('pendente','ativo','inativo') DEFAULT 'pendente',
  turma_id INT DEFAULT NULL,
  FOREIGN KEY (organizacao_id) REFERENCES organizacoes(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (turma_id) REFERENCES turmas(id)
    ON DELETE SET NULL
);
```

---

## 🚦 Validações

* `cpf` deve ser único
* `organizacao_id` obrigatório
* `turma_id` existente
* Apenas admin pode excluir ou alterar status
* `instrutor` não pode ver nem editar alunos de outra organização

---

## 🚀 Status Atual

✅ Multi-organização completo
✅ RBAC (Admin / Instrutor)
✅ Filtros e queries protegidos por `organizacao_id`
✅ Banco com CASCADE ativo
✅ Pronto para integração com frequência e relatórios

---

## 👨‍💻 Responsável Técnico

**Lucas Fanha Felix**
*Desenvolvedor Full Stack – Projeto Capoeira Base*
[github.com/ffelixlucas](https://github.com/ffelixlucas)
