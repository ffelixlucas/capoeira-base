# 🛡️ Middleware `checkRole` – Controle de Acesso por Papéis (RBAC)

## ✅ Objetivo
Restringir o acesso a rotas do backend com base nos papéis (`roles`) definidos para cada membro da equipe.

Esse middleware é parte da arquitetura RBAC (Role-Based Access Control) do projeto Capoeira Base.

---

## ⚙️ Como funciona

1. O usuário faz login e recebe um token JWT com seus papéis.
2. O middleware `verifyToken` decodifica o token e injeta `req.usuario = { id, nome, roles }`.
3. O middleware `checkRole` verifica se o usuário tem **algum** dos papéis exigidos na rota.
4. Se tiver → segue (`next()`)
5. Se não tiver → retorna `403 Acesso negado`

---

## 📌 Local do Arquivo

`/backend/middlewares/checkRole.js`

---

## 📥 Parâmetros

| Nome            | Tipo     | Descrição                                |
|------------------|----------|--------------------------------------------|
| `rolesPermitidos` | `array` | Lista de papéis que podem acessar a rota |

---

## 🧪 Exemplo de uso na rota

```js
const verifyToken = require("../middlewares/verifyToken");
const checkRole = require("../middlewares/checkRole");

router.post(
  "/api/agenda",
  verifyToken,
  checkRole(["admin", "instrutor"]),
  criarEvento
);


❌ Caso sem permissão
Se o usuário não tiver nenhum dos papéis definidos, a resposta será:


{
  "message": "Acesso negado: permissão insuficiente para esta ação."
}

✅ Boas práticas aplicadas
Segurança baseada no princípio do menor privilégio

Proteção de todas as rotas sensíveis

Código limpo, modular e reutilizável

Mensagens claras de erro

Integração direta com JWT

🧱 Requisitos
O token JWT precisa conter: roles: ['admin', 'instrutor', ...]

O verifyToken deve popular req.usuario

📌 Status
Item	Situação
Middleware	✅ Funcional
Testado	✅ OK
Documentado	✅ OK
Modularizado	✅ OK

