# 📘 Módulo Equipe

## ✅ Objetivo
Gerenciar os membros da equipe interna do projeto (instrutores, responsáveis, administradores).

## 📂 Estrutura do Módulo
- `equipeRoutes.js` – Define rotas REST protegidas por JWT.
- `equipeController.js` – Recebe e responde as requisições.
- `equipeService.js` – Contém as regras de negócio e validações.
- `equipeRepository.js` – Comunicação com o banco de dados.
- `docs/README-EQUIPE.md` – Documentação viva do módulo.

## 🔐 Segurança
- Todas as rotas protegidas com middleware `verifyToken`.
- Campo `senha_hash` nunca é retornado nas listagens.
- Validação de entrada no service (nome, email, senha obrigatórios).

## 🔧 Endpoints disponíveis

| Método | Rota               | Descrição                  | Protegido |
|--------|--------------------|----------------------------|-----------|
| GET    | `/api/equipe`      | Listar todos os membros    | ✅ Sim     |
| POST   | `/api/equipe`      | Criar novo membro          | ✅ Sim     |
| PUT    | `/api/equipe/:id`  | Atualizar membro existente | ✅ Sim     |
| DELETE | `/api/equipe/:id`  | Remover membro             | ✅ Sim     |

## 🗃️ Tabela relacionada: `equipe`

| Campo         | Tipo           | Descrição                        |
|---------------|----------------|----------------------------------|
| id            | int (PK)       | Identificador do membro          |
| nome          | varchar(100)   | Nome do membro                   |
| telefone      | varchar(20)    | Telefone                        |
| whatsapp      | varchar(20)    | WhatsApp                        |
| email         | varchar(100)   | E-mail de login ou contato       |
| status        | varchar(20)    | Ex: ativo, inativo               |
| observacoes   | text           | Notas adicionais                 |
| senha_hash    | varchar(255)   | Senha criptografada              |
| criado_em     | datetime       | Timestamp de criação             |
| atualizado_em | datetime       | Atualização automática           |

## 📌 Observações
- Este módulo será utilizado também para login.
- Os papéis dos membros serão definidos via tabela `roles` e `equipe_roles`.

## ✅ Status: **Finalizado**
