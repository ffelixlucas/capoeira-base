# 🛡️ Módulo Roles – Capoeira Base

## ✅ Descrição e Objetivo

Este módulo é responsável pela gestão dos **papéis (roles)** atribuídos aos membros da equipe.  
Ele permite que o **administrador do sistema** crie, edite, remova e liste os papéis disponíveis, que serão posteriormente usados no controle de acesso (RBAC).

---

## 🏗️ Estrutura de Arquivos

/backend/modules/roles/
├── rolesRepository.js → Queries SQL para roles
├── rolesService.js → Regras de negócio e validações
├── rolesController.js → Recebe e responde às requisições HTTP
├── rolesRoutes.js → Define endpoints REST protegidos
└── docs/
└── README-ROLES.md → Documentação viva do módulo


---

## 🗄️ Estrutura da Tabela `roles`

| Campo       | Tipo         | Descrição                                  |
|-------------|--------------|---------------------------------------------|
| id          | INT (PK)     | Identificador único                        |
| nome        | VARCHAR(50)  | Nome do papel (ex.: admin, instrutor)      |
| descricao   | VARCHAR(255) | Descrição do papel                         |
| criado_em   | DATETIME     | Data de criação (padrão: CURRENT_TIMESTAMP) |

---

## 🔗 Endpoints REST

| Método | Rota                  | Ação                             | Protegido com JWT |
|--------|------------------------|----------------------------------|-------------------|
| GET    | `/api/roles`          | Lista todos os papéis            | ✔️                |
| POST   | `/api/roles`          | Cria novo papel                  | ✔️                |
| PUT    | `/api/roles/:id`      | Atualiza um papel existente      | ✔️                |
| DELETE | `/api/roles/:id`      | Remove um papel do sistema       | ✔️                |

> ⚠️ Todas as rotas exigem token JWT válido (via `verifyToken`).

---

## 🔐 Segurança Aplicada

- ✅ **JWT obrigatório** para todas as rotas.
- ✅ **Validação de dados** no service:
  - Nome obrigatório
  - Nome único (sem duplicidade)
- ✅ **Uso de placeholders (`?`)** para evitar SQL Injection.
- ✅ Modularização completa (Repository Pattern).

---

## 🧪 Testes Realizados

Todos os endpoints foram testados com sucesso via Postman:

- [x] `GET /api/roles` → retornou lista correta
- [x] `POST /api/roles` → criou novo papel com segurança
- [x] `PUT /api/roles/:id` → editou corretamente
- [x] `DELETE /api/roles/:id` → removeu papel com sucesso

---

## 📚 Relacionamento com outros módulos

Este módulo será usado para:
- Atribuir papéis aos membros da equipe (via tabela `equipe_roles`)
- Controlar visualmente o acesso aos recursos do sistema (RBAC)

---

## 🔮 Melhorias Futuras

- [ ] Middleware `checkRole(['admin'])` para restringir criação/edição exclusivamente a admins
- [ ] Interface visual no painel admin para CRUD de papéis
- [ ] Logs de criação/edição/deleção na `audit_log`
- [ ] Validação de papéis vinculados antes de deletar

---

## ✅ Status

✔️ Módulo finalizado, funcional e integrado  
✔️ Testado via Postman  
✔️ Estrutura segura e escalável  
✔️ Documentação viva atualizada

---

