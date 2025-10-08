# 🧾 Módulo – Pré-Matrículas (Público + Admin)

---

## 🎯 Descrição e Objetivo

O módulo **Pré-Matrículas** é responsável por **receber inscrições públicas** de novos alunos através do site e permitir que os **administradores** acompanhem, aprovem ou rejeitem essas solicitações.

Ele substitui o antigo fluxo de matrícula pública, oferecendo uma arquitetura mais segura e escalável.  
Após aprovação, a pré-matrícula é automaticamente convertida em **aluno real** e **matrícula ativa** via integração com o módulo `matricula`.

---

## 🧱 Tecnologias Utilizadas

- **Node.js + Express**
- **MySQL (Railway)**
- **JWT (acesso admin)**
- **Resend** – envio de e-mails automáticos
- **Logger customizado** (`utils/logger.js`)
- **Arquitetura em camadas**: Controller → Service → Repository

---

## 📂 Estrutura do Módulo

```

/modules/public/preMatriculas/
│
├── preMatriculasController.js   → Recebe e responde requisições HTTP
├── preMatriculasService.js      → Contém regras de negócio e e-mails
├── preMatriculasRepository.js   → Acesso direto ao banco MySQL
├── preMatriculasRoutes.js       → Define rotas públicas e administrativas
└── README-PREMATRICULAS.md      → (este arquivo)

```

---

## ⚙️ Fluxo de Funcionamento

### 🧾 1. Envio do Formulário Público

- Endpoint: `POST /api/public/pre-matriculas`  
- O usuário preenche nome, nascimento, CPF, e-mail, telefone e observações.  
- O backend valida e normaliza os dados, insere na tabela `pre_matriculas` com status **pendente**.

📧 Envia:
- E-mail para o aluno confirmando recebimento  
- E-mail para os administradores (configurados via `notificacaoDestinos`)

---

### 🧠 2. Listagem no Painel Administrativo

- Endpoint: `GET /api/public/admin/pre-matriculas/pendentes/:organizacaoId`  
- Retorna todas as inscrições com status “pendente” para a organização logada.  
- Mostra no painel o nome, CPF, contato e observações médicas.

---

### 🔄 3. Aprovação ou Rejeição

- Endpoint: `PATCH /api/public/admin/pre-matriculas/:id/status`  
- O admin define `status = aprovado` ou `rejeitado`.

🪄 Se **aprovado**:
- O controller chama automaticamente o `matriculaService.criarMatricula()`  
- Cria aluno real + matrícula ativa  
- Envia e-mail de confirmação para o aluno e notificações para os administradores.

---

### 🔍 4. Buscar grupo da organização

- Endpoint: `GET /api/public/matricula/grupo/:organizacaoId`  
- Usado no formulário público para exibir o nome do grupo (ex.: “Capoeira Brasil”).

---

## 🧩 Relação com Outros Módulos

| Módulo | Relação |
|---------|----------|
| `matricula` | Recebe dados das pré-matrículas aprovadas e cria aluno/matrícula reais |
| `notificacaoDestinos` | Define e-mails que recebem avisos automáticos |
| `emailService` | Dispara e-mails de confirmação e alerta |
| `alunos` / `turmas` | Consomem dados criados após aprovação |

---

## 🧪 Banco de Dados

Tabela: **`pre_matriculas`**

| Campo | Tipo | Descrição |
|--------|------|------------|
| `id` | INT PK | Identificador |
| `organizacao_id` | INT FK | Organização responsável |
| `nome` | VARCHAR(255) | Nome completo |
| `nascimento` | DATE | Data de nascimento |
| `cpf` | VARCHAR(11) | CPF normalizado |
| `email` | VARCHAR(255) | Contato |
| `telefone` | VARCHAR(20) | Telefone do inscrito |
| `grupo_origem` | VARCHAR(255) | Nome do grupo ou filial |
| `observacoes_medicas` | TEXT | Informações médicas |
| `status` | ENUM('pendente','aprovado','rejeitado') | Status do processo |
| `data_criacao` | DATETIME | Registro da inscrição |
| `data_atualizacao` | DATETIME | Última alteração |

---

## 🧠 Regras de Negócio

- CPF e e-mail obrigatórios.  
- E-mail convertido para minúsculo e sem espaços.  
- CPF armazenado apenas com números.  
- Pré-matrículas duplicadas não são bloqueadas automaticamente (admin decide).  
- Status padrão: `pendente`.  
- Ao aprovar → cria aluno e matrícula.

---

## 🚀 Melhorias Futuras

- [ ] Adicionar paginação na listagem de pendentes  
- [ ] Permitir filtros por nome/CPF no painel admin  
- [ ] Adicionar histórico de decisões (quem aprovou/rejeitou)  
- [ ] Exibir badge de “nova inscrição” no dashboard  
- [ ] Integração futura com WhatsApp API para aviso automático  

---

## 📊 Status Atual

✅ **Funcional e testado.**  
- Criação pública, listagem e aprovação automáticas validadas.  
- Integração com `matriculaService` concluída.  
- Logs e e-mails operando corretamente.  
- Padrão mobile-first garantido no front.

---

## 👨‍💻 Responsável Técnico

**Lucas Fanha Felix**  
_Desenvolvedor Full Stack – Projeto Capoeira Base_  
[github.com/ffelixlucas](https://github.com/ffelixlucas)  
