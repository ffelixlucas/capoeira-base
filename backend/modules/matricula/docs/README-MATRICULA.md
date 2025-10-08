### 📄 **/docs/README-MATRICULA.md**

```markdown
# 🎓 Módulo – Matrícula (Admin)

---

## 🎯 Descrição e Objetivo

O módulo **Matrícula** é responsável por **criar alunos reais e suas matrículas** após a aprovação de uma pré-matrícula.  
Ele é acessado **apenas por administradores**, garantindo controle e consistência nos cadastros internos.

Esse módulo substitui a antiga matrícula pública, tornando o processo totalmente controlado e automatizado após aprovação.

---

## 🧱 Tecnologias Utilizadas

- **Node.js + Express**
- **MySQL (Railway)**
- **Resend** – envio de e-mails automáticos
- **Logger customizado** (`utils/logger.js`)
- **Arquitetura em camadas:** Controller → Service → Repository

---

## 📂 Estrutura do Módulo

```

/modules/matricula/
│
├── matriculaController.js   → Recebe requisições internas (admin)
├── matriculaService.js      → Regras de negócio e criação real
├── matriculaRepository.js   → Acesso ao banco de dados (CRUD)
├── matriculaRoutes.js       → Define rotas internas do admin
└── README-MATRICULA.md      → (este arquivo)

````

---

## ⚙️ Fluxo de Funcionamento

### 🔹 1. Aprovação da Pré-Matrícula
- Acontece no módulo `preMatriculas`.
- Quando o admin muda o status para `aprovado`, o sistema chama automaticamente `matriculaService.criarMatricula()`.
- O processo cria:
  - Novo aluno (`alunos`)
  - Registro de matrícula (`matriculas`)
  - E-mails de confirmação automáticos

---

### 🔹 2. Criação Manual (opcional)
- Endpoint: `POST /api/admin/matricula`
- Permite ao admin criar um aluno diretamente (sem pré-matrícula).

Payload esperado:
```json
{
  "nome": "João Silva",
  "cpf": "12345678900",
  "nascimento": "2010-05-12",
  "email": "joao@email.com",
  "telefone_aluno": "41999999999"
}
````

---

## 🔩 Fluxo Interno (camadas)

1️⃣ **Controller**

* Recebe a requisição admin
* Valida entrada e repassa para o service
* Retorna JSON com status e aluno criado

2️⃣ **Service**

* Calcula idade
* Busca turma compatível por faixa etária
* Evita duplicidade de CPF
* Grava aluno + matrícula
* Envia e-mails de confirmação

3️⃣ **Repository**

* Executa as queries SQL:

  * Inserir aluno
  * Inserir matrícula
  * Buscar turma por idade
  * Buscar organização por turma
  * Verificar CPF duplicado

---

## 🧠 Regras de Negócio

* **CPF único** por aluno
* **Turma automática** definida pela idade
* **Organização herdada** da turma selecionada
* **Criação dupla** (aluno + matrícula) com transação simples
* Envio de **e-mails automáticos** via Resend:

  * Aluno: “Matrícula confirmada”
  * Admin: “Nova matrícula confirmada”

---

## 🧩 Relação com Outros Módulos

| Módulo                | Relação                                        |
| --------------------- | ---------------------------------------------- |
| `preMatriculas`       | Origem dos dados (pré-matrículas aprovadas)    |
| `alunos`              | Recebe o aluno criado aqui                     |
| `turmas`              | Define turma automaticamente com base na idade |
| `notificacaoDestinos` | Controla os e-mails que recebem notificações   |
| `emailService`        | Serviço genérico de envio de e-mails           |
| `logger`              | Mantém rastreabilidade de todo o processo      |

---

## 🧪 Banco de Dados

### Tabelas afetadas

* `alunos`
* `matriculas`

### Queries principais

```sql
INSERT INTO alunos (...)
INSERT INTO matriculas (aluno_id, turma_id, organizacao_id, data_inicio)
SELECT organizacao_id FROM turmas WHERE id = ?
SELECT id FROM turmas WHERE idade_min <= ? AND idade_max >= ?
```

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

* [ ] Implementar transação SQL (ROLLBACK em erro)
* [ ] Permitir seleção manual de turma na criação direta
* [ ] Adicionar histórico de alterações
* [ ] Integrar com módulo de pagamentos futuros

---

## 📊 Status Atual

✅ **Funcional e testado.**

* Criação de aluno e matrícula automática via aprovação de pré-matrícula validada.
* E-mails automáticos operando com sucesso.
* Logs claros e consistentes.
* Integração total com `preMatriculas` estável.

---

## 👨‍💻 Responsável Técnico

**Lucas Fanha Felix**
*Desenvolvedor Full Stack – Projeto Capoeira Base*
[github.com/ffelixlucas](https://github.com/ffelixlucas)
