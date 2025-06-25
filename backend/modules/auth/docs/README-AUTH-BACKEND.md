# 🔐 Módulo Auth (Autenticação/Login) – Backend – Capoeira Base

## ✅ Descrição
API REST responsável pela **autenticação de usuários da equipe**, geração de token JWT e controle de acesso inicial ao sistema administrativo.

> 🔥 Este módulo realiza o login baseado na tabela `equipe`, validando email e senha, além de retornar os papéis (roles) do usuário para controle de permissões.

---

## 🔗 Endpoints

| Método | Endpoint               | Descrição                          |
|--------|-------------------------|-------------------------------------|
| POST   | `/api/auth/login`       | Realiza login e retorna um token    |

---

## 🔐 Fluxo de Login

1. O usuário envia **email** e **senha** via POST `/api/auth/login`.
2. O backend:
   - 🔍 Busca na tabela `equipe` pelo email.
   - 🔑 Valida se o usuário existe e possui senha cadastrada.
   - 🔒 Compara a senha enviada com o hash salvo.
   - ✅ Gera um token JWT contendo dados do usuário e seus papéis (roles).
3. Retorna:
   - 🔑 **Token JWT**
   - 👤 Dados do usuário logado (id, nome, email, roles)

---

## 🏗️ Estrutura dos Arquivos Backend

| Arquivo               | Descrição                                     |
|-----------------------|-----------------------------------------------|
| `authRoutes.js`       | Define o endpoint de login                   |
| `authController.js`   | Recebe a requisição HTTP, chama o service     |
| `authService.js`      | Lógica de autenticação e geração de token     |
| `authRepository.js`   | Consulta o banco, busca usuário e roles       |

---

## 🗄️ Banco de Dados (Consulta)

- 🔸 A consulta ocorre na tabela `equipe`.
- 🔸 Através de JOIN, traz os papéis vinculados (`roles`).

| Tabela | Descrição                        |
|--------|-----------------------------------|
| `equipe` | Dados dos membros (nome, email, senha_hash) |
| `equipe_roles` | Relaciona membros aos papéis (roles) |
| `roles` | Papéis de permissão (admin, instrutor, loja, etc.) |

---

## 🛠️ Melhorias Futuras

- [ ] Endpoint `/me` → Retornar os dados do usuário logado.
- [ ] Implementar `/logout` (futuro, se desejar blacklist de tokens).
- [ ] Refresh token (futuro, se desejado).
- [ ] Logs de tentativas de login (sucesso e falha).
- [ ] Controle de tentativas inválidas (anti brute-force).

---

## 🎯 Status

| Item              | Status           |
|-------------------|------------------|
| API REST          | ✔️ 100% funcional |
| Integração RBAC   | ✔️ Completa       |
| Banco             | ✔️ Modelado       |
| Documentação      | ✔️ Atualizada     |
| Código            | ✔️ Limpo, organizado e escalável |

---

## 📜 Local do Arquivo

/backend/modules/auth/docs/README-AUTH.md


---

## 🚀 Observação Final

Este módulo segue 100% o padrão profissional Capoeira Base CN10:

- 🔥 Arquitetura modular (repository, service, controller, routes)
- 🔥 API REST limpa, segura e escalável
- 🔥 Integração direta com o controle de acesso (RBAC)
- 🔥 Código limpo, claro, com documentação viva

---
