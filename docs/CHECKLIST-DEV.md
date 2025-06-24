# ✅ Checklist Técnico de Desenvolvimento – Capoeira Base (Atualizado)

---

## 🔷 Bloco 1 – Setup
- [x] Criar repositório no GitHub
- [x] Criar estrutura de pastas `/backend` e `/frontend` (landing + admin)
- [x] Iniciar backend Node.js com Express
- [x] Criar `app.js` e `server.js`
- [x] Criar rota teste: `GET /api/teste`
- [x] Subir backend no Railway
- [x] Subir frontend (landing) no Vercel

---

## 🔷 Bloco 2 – Site Público (Landing Page)
- [] Criar `index.html` com seções:
  - Sobre
  - Agenda de Aulas
  - Galeria
  - Loja Virtual *(Novo)*
  - Aulas Online *(Novo)*
  - Contato
- [ ] Fazer fetch dos dados da API:
  - Agenda
  - Galeria
  - Loja (produtos)
  - Aulas (vídeos)
- [ ] Estilizar com CSS (mobile first)
- [ ] Testar navegação e responsividade

---

## 🔷 Bloco 3 – Backend API (Node + MySQL)
- [x] Criar tabelas:
  - `equipe`
  - `roles` + `equipe_roles`
  - `permissions` + `role_permissions` *(futuro)*
  - `horarios_aula`
  - `agenda`
  - `galeria`
  - `audit_log`
- [ ] Criar módulo de autenticação (`/modules/auth`) com JWT
- [ ] CRUD de:
  - Agenda
  - Galeria
  - Equipe (Cadastro de membros)
  - Roles e permissões *(futuro)*
  - Loja (produtos) *(novo)*
  - Aulas (conteúdos) *(novo)*
- [ ] Middleware de autenticação (`verifyToken`)
- [ ] Middleware de permissões (`checkRole`) *(futuro)*
- [x] Criar repositórios, serviços, controllers e rotas para cada módulo

---

## 🔷 Bloco 4 – Painel Admin (React)
- [x] Criar projeto React em `/admin`
- [x] Tela de login com JWT
- [ ] Dashboard principal
- [ ] CRUD:
  - Agenda
  - Galeria
  - Loja *(novo)*
  - Aulas *(novo)*
  - Equipe e Roles
- [ ] Tela de histórico (audit log)
- [ ] Aplicar controle de acesso visual baseado em roles *(futuro)*

---

## 🔷 Bloco 5 – Auditoria (Logs)
- [x] Criar tabela `audit_log`
- [ ] Registrar automaticamente ações sensíveis no backend:
  - Criação, edição, deleção de dados
  - Login, logout
- [ ] Criar página no painel admin para exibir histórico (visível apenas para admin master)

---

## 🔷 Finalização
- [ ] Criar README e documentação viva (`/docs`)
- [ ] Fazer deploy final:
  - Backend → Railway
  - Landing → Vercel
  - Admin → Vercel ou Railway
- [ ] Apresentar e entregar para o professor
- [ ] Validar feedback para a evolução futura (fase 2)

---
