# 🔐 Módulo Auth (Autenticação/Login + Reset de Senha) – Backend – Capoeira Base

## ✅ Descrição
API REST responsável pela **autenticação de usuários da equipe**, geração de token JWT e controle de acesso inicial ao sistema administrativo.  
Também implementa o fluxo completo de **esqueci minha senha**, com envio de link único por e-mail e redefinição de senha segura.

---

## 🔗 Endpoints

| Método | Endpoint                     | Descrição                                                                 |
|--------|-------------------------------|---------------------------------------------------------------------------|
| POST   | `/api/auth/login`            | Realiza login e retorna token JWT                                         |
| GET    | `/api/auth/me`               | Retorna dados do usuário logado (JWT válido)                              |
| POST   | `/api/auth/forgot-password`  | Inicia fluxo de reset, gera token e envia link por e-mail (resposta neutra) |
| POST   | `/api/auth/reset-password`   | Redefine senha a partir de token válido                                   |

---

## 🔐 Fluxo de Login

1. O usuário envia **email** e **senha** via `POST /api/auth/login`.
2. O backend:
   - 🔍 Busca na tabela `equipe` pelo email.
   - 🔑 Valida se o usuário existe e possui senha cadastrada.
   - 🔒 Compara a senha enviada com o hash salvo.
   - ✅ Gera um token JWT contendo dados do usuário e seus papéis (roles).
3. Retorna:
   - 🔑 **Token JWT** (expira em 2h)
   - 👤 Dados do usuário logado (id, nome, email, roles)

---

## 🔑 Fluxo de Esqueci Minha Senha

1. Usuário envia seu **email** via `POST /api/auth/forgot-password`.
2. O backend:
   - 🔍 Busca usuário pelo email (se não existir, responde igual).
   - 🔒 Invalida tokens anteriores.
   - 🔑 Gera novo token aleatório, salva **hash** na tabela `password_resets` com expiração (1h).
   - 📧 Envia link por e-mail:  
     `https://seu-frontend/reset?token=XYZ`
3. Resposta sempre genérica (não revela se email existe ou não).

---

## 🔑 Fluxo de Redefinir Senha

1. Usuário acessa o link recebido por e-mail (`/reset?token=XYZ`) no frontend.
2. Front envia `POST /api/auth/reset-password` com:
   ```json
   { "token": "XYZ", "novaSenha": "123456" }
````

3. Backend valida:

   * Token hash existe, não usado e não expirado.
   * Atualiza `senha_hash` do usuário.
   * Marca token como usado (uso único).
4. Resposta:

   ```json
   { "message": "Senha redefinida com sucesso" }
   ```

---

## 🗄️ Banco de Dados

Além da tabela `equipe`, este fluxo usa a tabela auxiliar:

| Tabela            | Descrição                                                |
| ----------------- | -------------------------------------------------------- |
| `equipe`          | Dados dos membros (nome, email, senha\_hash, etc.)       |
| `equipe_roles`    | Relaciona membros aos papéis (roles)                     |
| `roles`           | Papéis de permissão (admin, instrutor, loja, etc.)       |
| `password_resets` | Tokens temporários de reset (hash, expiração, usado\_at) |

---

## 🏗️ Estrutura dos Arquivos Backend

| Arquivo                      | Descrição                                         |
| ---------------------------- | ------------------------------------------------- |
| `authRoutes.js`              | Rotas: login, me, forgot-password, reset-password |
| `authController.js`          | Handlers HTTP → chama service e emailService      |
| `authService.js`             | Lógica: login, geração token, reset de senha      |
| `authRepository.js`          | Busca usuário no banco                            |
| `passwordResetRepository.js` | CRUD de tokens de reset                           |
| `emailService.js`            | Envio de e-mails via Resend (inclui reset)        |

---

## 🛠️ Boas Práticas de Segurança

* 🔑 Tokens aleatórios de 32 bytes, salvos como **SHA-256 hash**.
* ⏱️ Expiração de 1 hora.
* ♻️ Uso único (`used_at`).
* 🔒 Resposta neutra em `/forgot-password`.
* 📧 Envio de e-mail via Resend com link seguro.

---

## 🎯 Status

| Item                | Status            |
| ------------------- | ----------------- |
| Login + JWT         | ✔️ 100% funcional |
| RBAC                | ✔️ Completo       |
| Esqueci minha senha | ✔️ Implementado   |
| Redefinir senha     | ✔️ Implementado   |
| Documentação        | ✔️ Atualizada     |

---

## 📜 Local do Arquivo

`/backend/modules/auth/docs/README-AUTH.md`

---

## 🚀 Observação Final

Este módulo segue 100% o padrão profissional Capoeira Base CN10:

* 🔥 Arquitetura modular (repository, service, controller, routes)
* 🔥 API REST limpa, segura e escalável
* 🔥 Integração direta com o controle de acesso (RBAC)
* 🔥 Código limpo, claro, com documentação viva

