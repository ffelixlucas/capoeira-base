# 🕒 Módulo Horários – Backend – Capoeira Base

## ✅ Descrição
API REST responsável pela gestão dos **horários das turmas**, exibidos na página pública e totalmente controlados pelo painel admin.

> 🔥 Tudo que é criado, editado, reordenado ou excluído reflete automaticamente na landing page pública, sem necessidade de deploy manual.

---

## 🔗 Endpoints

| Método | Endpoint                           | Descrição                                     |
|--------|-------------------------------------|-----------------------------------------------|
| GET    | `/api/horarios`                    | Listar todos os horários                      |
| GET    | `/api/horarios/:id`                | Obter horário específico                      |
| POST   | `/api/horarios`                    | Criar um novo horário                         |
| PUT    | `/api/horarios/:id`                | Editar um horário existente                   |
| DELETE | `/api/horarios/:id`                | Excluir um horário                            |
| PUT    | `/api/horarios/atualizar-ordem`    | Atualizar a ordem de exibição dos horários    |

---

## 🏗️ Estrutura dos Arquivos Backend

| Arquivo                         | Descrição                                     |
|----------------------------------|-----------------------------------------------|
| `horariosRepository.js`         | Consultas e operações no banco de dados       |
| `horariosService.js`            | Lógica de negócio, validações e regras        |
| `horariosController.js`         | Recebe e trata as requisições HTTP            |
| `horariosRoutes.js`             | Define os endpoints da API                    |

---

## 🗄️ Estrutura da Tabela `horarios_aula`

| Campo               | Tipo       | Descrição                                      |
|---------------------|------------|-------------------------------------------------|
| id                  | INT (PK)   | Identificador único                            |
| turma               | VARCHAR    | Nome da turma                                  |
| dias                | VARCHAR    | Dias da semana (ex.: Segunda e Quarta)         |
| horario             | VARCHAR    | Horário (ex.: 19:00 - 20:00)                   |
| faixa_etaria        | VARCHAR    | Faixa etária (ex.: 5 a 9 anos ou +18)          |
| ordem               | INT        | Ordem de exibição na landing page              |
| equipe_id           | INT (FK)   | (Futuro) ID do instrutor na tabela equipe      |

---

## 🔥 Fluxo de Funcionamento

1. O admin acessa o painel e pode:
   - Cadastrar uma nova turma com dias, horário e faixa etária.
   - Editar qualquer informação de uma turma existente.
   - Reordenar as turmas na sequência desejada.
   - Excluir uma turma, se necessário.

2. O backend salva e organiza os dados no banco.

3. A página pública consome o endpoint `/api/horarios` para exibir os horários **em tempo real**.

---

## 🎯 Integração com a Página Pública

- ✔️ A seção de **Horários de Aula** da landing page lê diretamente a API `/api/horarios`.
- ✔️ A ordenação da lista segue exatamente o que está configurado no painel admin.
- ✔️ Qualquer alteração no painel reflete **instantaneamente no site público**, **sem necessidade de deploy**.

---

## 🛠️ Melhorias Futuras

- [ ] Drag & Drop para ordenação (UX mais fluida).
- [ ] Permitir adicionar descrição detalhada da turma.
- [ ] Checkbox "Turma sem vagas" (exibir aviso na landing).
- [ ] Vincular o campo `equipe_id` à tabela **equipe** (integração com controle de equipe e instrutores).
- [ ] Logs de alteração de horários.
- [ ] Controle de status (ativo/inativo) para turmas.

---

## 🎯 Status

- ✔️ API REST funcional e estável
- ✔️ 100% integrada com a landing page
- ✔️ Banco modelado e validado
- ✔️ Documentação atualizada
- ✔️ Código limpo, organizado e pronto para manutenção e escalabilidade

---

## 📜 Local do Arquivo

/backend/modules/horarios


---

## 🚀 Observação Final

Este módulo segue 100% o padrão profissional Capoeira Base CN10:

- 🔥 Código limpo  
- 🔥 Arquitetura modular (repository, service, controller, routes)  
- 🔥 Mobile-first na integração com frontend  
- 🔥 Backend RESTful organizado, seguro e escalável  

---
