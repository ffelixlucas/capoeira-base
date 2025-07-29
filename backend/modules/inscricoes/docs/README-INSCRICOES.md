# 📝 Módulo Inscrições de Eventos – Backend – Capoeira Base

## ✅ Descrição

API REST responsável pela **gestão das inscrições de eventos** do Capoeira Base.
Permite que participantes se inscrevam (público) e que o admin gerencie as inscrições no painel administrativo.

> 🔥 Toda inscrição é registrada no banco e vinculada a um evento (`agenda.id`).
> 🔒 A listagem e os detalhes são protegidos por autenticação.

---

## 🔗 Endpoints

| Método | Endpoint                       | Descrição                                                     |
| ------ | ------------------------------ | ------------------------------------------------------------- |
| POST   | `/api/inscricoes`              | Criar uma nova inscrição (público)                            |
| GET    | `/api/inscricoes/:eventoId`    | Listar inscritos de um evento (admin/instrutor)               |
| GET    | `/api/inscricoes/detalhes/:id` | Obter os dados completos de uma inscrição (admin/instrutor)   |
| POST   | `/api/inscricoes/webhook`      | Receber notificações de pagamento (Mercado Pago) – **futuro** |

---

## 🏗️ Estrutura dos Arquivos Backend

| Arquivo                   | Descrição                                          |
| ------------------------- | -------------------------------------------------- |
| `inscricoesRoutes.js`     | Define os endpoints da API                         |
| `inscricoesController.js` | Recebe e trata as requisições HTTP                 |
| `inscricoesService.js`    | Lógica de negócio, validações e orquestra chamadas |
| `inscricoesRepository.js` | Consultas e operações no banco de dados            |

---

## 🗄️ Estrutura da Tabela `inscricoes_evento`

| Campo                       | Tipo       | Descrição                                       |
| --------------------------- | ---------- | ----------------------------------------------- |
| id                          | INT (PK)   | Identificador único                             |
| evento\_id                  | INT (FK)   | ID do evento (`agenda.id`)                      |
| nome                        | VARCHAR    | Nome do participante                            |
| apelido                     | VARCHAR    | Apelido (opcional)                              |
| data\_nascimento            | DATE       | Data de nascimento (opcional)                   |
| email                       | VARCHAR    | E-mail (opcional)                               |
| telefone                    | VARCHAR    | Telefone (opcional)                             |
| cpf                         | VARCHAR    | CPF (opcional)                                  |
| autorizacao\_participacao   | TINYINT(1) | Autorização dos responsáveis para menores       |
| autorizacao\_imagem         | TINYINT(1) | Autorização para uso de imagem                  |
| documento\_autorizacao\_url | VARCHAR    | URL do documento de autorização (se necessário) |
| status                      | ENUM       | Status da inscrição (`pendente` / `pago`)       |
| pagamento\_id               | VARCHAR    | ID de pagamento (Mercado Pago - futuro)         |
| valor                       | DECIMAL    | Valor pago/previsto                             |
| responsavel\_nome           | VARCHAR    | Nome do responsável (se menor)                  |
| responsavel\_documento      | VARCHAR    | Documento do responsável                        |
| responsavel\_contato        | VARCHAR    | Contato do responsável                          |
| responsavel\_parentesco     | VARCHAR    | Grau de parentesco                              |
| tamanho\_camiseta           | VARCHAR    | Tamanho da camiseta (se aplicável)              |
| alergias\_restricoes        | TEXT       | Alergias ou restrições alimentares              |
| aceite\_imagem              | TINYINT(1) | Aceite de uso de imagem (check LGPD)            |
| aceite\_responsabilidade    | TINYINT(1) | Aceite de responsabilidade (check)              |
| aceite\_lgpd                | TINYINT(1) | Aceite LGPD (check)                             |
| criado\_em                  | DATETIME   | Data de criação                                 |

---

## 🔥 Fluxo de Funcionamento

1. O usuário acessa a página pública do evento e preenche o formulário de inscrição.

   * Endpoint público: `POST /api/inscricoes`.
   * Status inicial da inscrição: **pendente**.
2. O admin pode visualizar todas as inscrições de um evento no painel:

   * Endpoint protegido: `GET /api/inscricoes/:eventoId`.
3. O admin pode abrir os detalhes completos de uma inscrição:

   * Endpoint protegido: `GET /api/inscricoes/detalhes/:id`.
4. Futuramente:

   * O Mercado Pago enviará notificações via webhook para atualizar o status da inscrição:

     * Endpoint: `POST /api/inscricoes/webhook`.

---

## 🎯 Validações e Regras de Negócio

* ✔️ Campos obrigatórios na criação: `evento_id` e `nome`.
* ✔️ Inscrições são vinculadas a eventos existentes via `evento_id` (FK).
* ✔️ Admin pode apenas visualizar ou consultar detalhes (sem edição por enquanto).
* ✔️ Status inicial = **pendente**. Futuramente será atualizado para **pago** via webhook.

---

## 🔐 Middleware

* 🔒 `verifyToken` e `checkRole`:

  * Protegem as rotas de listagem e detalhes.
  * Apenas usuários com roles **admin** ou **instrutor** têm acesso.

---

## 🛠️ Melhorias Futuras (Sugeridas)

* [ ] Implementar atualização do status para **pago** via webhook Mercado Pago.
* [ ] Criar possibilidade de **editar dados** de uma inscrição (somente admin).
* [ ] Paginação e filtros (status, data, evento) para grandes volumes de inscrições.
* [ ] Logs de auditoria (quem acessou, quem alterou).

---

## 🎯 Status

| Item               | Status                |
| ------------------ | --------------------- |
| API REST           | ✔️ 100% funcional     |
| Integração Landing | 🔄 Em andamento       |
| Documentação       | ✔️ Atualizada         |
| Banco              | ✔️ Modelado           |
| Código             | ✔️ Limpo e organizado |

---

## 📜 Local do Arquivo

/backend/modules/inscricoes/docs/README-INSCRICOES.md
