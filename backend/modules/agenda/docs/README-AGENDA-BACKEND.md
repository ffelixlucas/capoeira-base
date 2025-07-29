
# 📅 Módulo Agenda (Próximos Eventos) – Backend – Capoeira Base (Atualizado)

## ✅ Descrição

API REST responsável pela gestão dos **Próximos Eventos**, exibidos na landing page pública e controlados pelo painel admin.

> 🔥 Toda alteração feita no painel (criar, editar, excluir) reflete automaticamente na página pública, sem necessidade de deploy manual.

---

## 🔗 Endpoints

| Método | Endpoint                    | Descrição                                  |
| ------ | --------------------------- | ------------------------------------------ |
| GET    | `/api/agenda`               | Listar todos os eventos                    |
| GET    | `/api/agenda/:id` (futuro)  | Obter dados de um evento específico        |
| POST   | `/api/agenda`               | Criar um novo evento                       |
| PUT    | `/api/agenda/:id`           | Editar um evento existente                 |
| PUT    | `/api/agenda/:id/status`    | Atualizar status do evento (ativo, concluido, cancelado) |
| DELETE | `/api/agenda/:id`           | Excluir um evento                          |
| POST   | `/api/agenda/upload-imagem` | Criar um novo evento com imagem (Firebase) |

---

## 🏗️ Estrutura dos Arquivos Backend

| Arquivo               | Descrição                               |
| --------------------- | --------------------------------------- |
| `agendaRoutes.js`     | Define os endpoints da API              |
| `agendaController.js` | Recebe e trata as requisições HTTP      |
| `agendaService.js`    | Lógica de negócio, validações e regras  |
| `agendaRepository.js` | Consultas e operações no banco de dados |

---

## 🗄️ Estrutura da Tabela `agenda`

| Campo               | Tipo     | Descrição                                                  |
| ------------------- | -------- | ---------------------------------------------------------- |
| id                  | INT (PK) | Identificador único                                        |
| titulo              | VARCHAR  | Título do evento                                           |
| descricao\_curta    | VARCHAR  | Descrição resumida (landing)                               |
| descricao\_completa | TEXT     | Descrição detalhada (opcional)                             |
| local               | VARCHAR  | Local/bairro                                               |
| endereco            | VARCHAR  | Endereço completo (opcional)                               |
| telefone\_contato   | VARCHAR  | Telefone/WhatsApp (opcional)                               |
| data\_inicio        | DATETIME | Data e hora de início                                      |
| data\_fim           | DATETIME | (Opcional) Data e hora de término                          |
| imagem\_url         | VARCHAR  | URL pública da imagem (armazenada no Firebase)             |
| **com\_inscricao**  | BOOLEAN  | Indica se o evento exige inscrição                         |
| **valor**           | DECIMAL  | Valor da inscrição                                         |
| **responsavel\_id** | INT (FK) | Membro da equipe responsável pelo evento                   |
| **configuracoes**   | JSON     | Configuração de campos opcionais (ex.: camiseta, alergias) |
| criado\_por         | INT (FK) | ID do usuário que criou (opcional)                         |
| criado\_em          | DATETIME | Data de criação                                            |
| atualizado\_em      | DATETIME | Data de atualização                                        |

---

## 🔥 Fluxo de Funcionamento

1. O admin acessa o painel e preenche os dados do evento (título, data, local, inscrições, etc.).
2. O backend salva no banco MySQL, incluindo as configurações opcionais no campo `configuracoes` (JSON).
3. A página pública consome o endpoint `/api/agenda` para exibir a lista dos eventos.
4. Alterações (edição ou exclusão) são refletidas automaticamente na landing page.  
   - O admin pode **editar** dados do evento (`PUT /api/agenda/:id`).  
   - O admin pode **marcar como concluído/cancelado** (`PUT /api/agenda/:id/status`), bloqueando novas inscrições e mantendo os dados no histórico.


---

## 🎯 Validações e Regras de Negócio

* ✔️ Validação de campos obrigatórios (`titulo` e `data_inicio`) na criação.
* ✔️ Campos opcionais (ex.: `tamanho_camiseta`) controlados pelo campo `configuracoes` (JSON).
* ✔️ `com_inscricao` e `valor` controlam a exibição do botão **Inscreva-se** na landing page.
* ✔️ O campo `criado_por` armazena quem criou o evento (se autenticado).
* ✔️ As operações de criação, edição e exclusão são protegidas por token (`verifyToken`).

---

## 🔐 Middleware

* 🔒 `verifyToken`: Protege as rotas POST, PUT e DELETE. Somente usuários autenticados podem criar, editar ou excluir eventos.

---

## 🖼️ Upload de Imagem de Evento

* O endpoint `/api/agenda/upload-imagem` permite que um evento seja criado junto com o upload da imagem.
* A imagem é enviada via `multipart/form-data` e armazenada na pasta `eventos/` do Firebase Storage.
* O link da imagem gerado é salvo automaticamente no campo `imagem_url`.

---

## 🛠️ Melhorias Futuras (Sugeridas)

* [x] Upload de imagem do evento (`imagem_url`) com armazenamento no Firebase.
* [x] Campo `configuracoes` (JSON) para campos opcionais no formulário de inscrição.
* [ ] Checkbox para **"Evento visível/oculto"** na landing.
* [ ] Logs de ações: criação, edição e exclusão.
* [ ] Paginação e filtro (eventos futuros e passados).
* [ ] Relacionamento com a tabela `equipe` para exibir quem criou ou quem organiza.

---

## 🎯 Status

| Item               | Status                |
| ------------------ | --------------------- |
| API REST           | ✔️ 100% funcional     |
| Integração Landing | ✔️ Pronta             |
| Documentação       | ✔️ Atualizada         |
| Banco              | ✔️ Modelado           |
| Código             | ✔️ Limpo e organizado |

---

## 📜 Local do Arquivo

/backend/modules/agenda/docs/README-AGENDA.md

---

## 🚀 Observação Final

Este módulo segue 100% o padrão profissional Capoeira Base CN10:

* 🔥 Backend RESTful modularizado
* 🔥 Código limpo, organizado e escalável
* 🔥 Documentação viva, clara e profissional
* 🔥 Totalmente preparado para integração e evolução

