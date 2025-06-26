# 🧩 Módulo Equipe Roles – Capoeira Base

## ✅ Objetivo
Este módulo é responsável por **atribuir** e **remover papéis (roles)** de membros da equipe, utilizando a tabela ponte `equipe_roles`.

---

## 🧱 Estrutura dos Arquivos

/modules/equipe/equipeRoles/
├── equipeRolesRepository.js
├── equipeRolesService.js
├── equipeRolesController.js
├── equipeRolesRoutes.js
└── docs/
└── README-EQUIPE-ROLES.md


---

## 🔗 Endpoints REST

| Método | Rota                             | Descrição                                      | Protegido |
|--------|----------------------------------|-----------------------------------------------|-----------|
| GET    | `/api/equipe/:id/roles`         | Lista todos os papéis atribuídos a um membro  | ✅ JWT     |
| POST   | `/api/equipe/:id/roles`         | Atribui um papel a um membro                  | ✅ JWT     |
| DELETE | `/api/equipe/:id/roles/:roleId` | Remove um papel de um membro                  | ✅ JWT     |
| DELETE | `/api/equipe/:id/roles`         | Remove **todos** os papéis do membro          | ✅ JWT     |

---

## 🛠️ Regras de Negócio

- Apenas membros com token JWT válido podem gerenciar papéis.
- Validação para não duplicar papéis no POST.
- Remoção direta no DELETE.
- Utiliza placeholders `?` nas queries para evitar SQL Injection.

---

## 🧪 Testes Realizados

| Ação                                     | Resultado  |
|------------------------------------------|------------|
| Criar membro via POST                    | ✅ Ok      |
| Criar papel "instrutor"                  | ✅ Ok      |
| Atribuir papel via POST                  | ✅ Ok      |
| Verificar papéis com GET                 | ✅ Ok      |
| Remover papel com DELETE                 | ✅ Testado |
| Remover todos os papéis via DELETE       | ✅ Testado |


---

## 📚 Tabela envolvida

```sql
CREATE TABLE equipe_roles (
  equipe_id INT NOT NULL,
  role_id INT NOT NULL,
  PRIMARY KEY (equipe_id, role_id),
  FOREIGN KEY (equipe_id) REFERENCES equipe(id) ON DELETE CASCADE,
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);

🔄 Melhorias Futuras

 Endpoint GET /api/equipe trazendo papéis embutidos.

 Interface visual para atribuição múltipla (frontend).

 Logs de atribuição e remoção via audit_log

 ✅ Status
✔️ Finalizado, testado, funcional e documentado.