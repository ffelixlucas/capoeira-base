# 🔐 Middleware `verifyToken` – Autenticação com JWT

## ✅ Objetivo
Verificar se o usuário está autenticado antes de acessar rotas protegidas da API.  
Valida o token JWT enviado no cabeçalho e injeta os dados do usuário no `req.usuario`.

---

## 📌 Local do Arquivo
`/backend/middlewares/verifyToken.js`

---

## 🔄 Como funciona

1. Lê o cabeçalho `Authorization: Bearer <token>`
2. Verifica a validade do token com `jwt.verify`
3. Se válido → insere os dados no `req.usuario`
4. Se inválido ou ausente → bloqueia com erro `401` ou `403`

---

## 🧠 Exemplo de uso

```js
const verifyToken = require("../middlewares/verifyToken");

router.get("/api/equipe", verifyToken, equipeController.getEquipe);

📥 Respostas esperadas
Token ausente:


{
  "message": "Token não fornecido"
}

Token inválido/expirado:


{
  "message": "Token inválido"
}

Token válido:

Segue para o next() com req.usuario preenchido:


req.usuario = {
  id: 5,
  nome: "Lucas Felix",
  email: "lucas@email.com",
  roles: ["admin", "instrutor"]
}

📎 Requisitos
Token deve ser enviado no header:


Authorization: Bearer <token>
A JWT_SECRET precisa estar definida no .env

🔐 Integração com RBAC
Este middleware é obrigatório para que o checkRole funcione corretamente, pois é ele quem popula o req.usuario.

✅ Status


Middleware	✅ Pronto
Testado	    ✅ OK
Documentado	✅ Sim
Integrado	✅ Sim