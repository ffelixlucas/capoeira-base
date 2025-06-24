# 🔥 MVP – Capoeira Base – Atualizado

---

## 🎯 Objetivo do MVP

Entregar uma versão funcional mínima do sistema, com foco nas funcionalidades essenciais que geram valor imediato para o projeto social de capoeira.

---

## 📦 Escopo do MVP

---

### 1. 🌐 Site Público (Visitantes)
- Página inicial com logo e apresentação do projeto
- Seção **"Sobre o Projeto"**
- Seção **"Agenda de Aulas e Eventos"**
- Seção **"Galeria de Fotos"**
- Seção **"Aulas Online"** (lista de vídeos e materiais) *(Em desenvolvimento)*
- Seção **"Loja Virtual"** (venda de agasalhos, roupas, materiais) *(Em desenvolvimento)*
- Seção **"Contato"** com mapa, WhatsApp e redes sociais

---

### 2. 🛠️ Painel Administrativo (/admin)
- Login seguro com JWT
- Dashboard com acesso a:
  - ✅ Atualizar a agenda de aulas e eventos
  - ✅ Gerenciar a galeria de imagens (upload, legenda, ordem)
  - ✅ Editar informações de contato e redes sociais
  - ✅ Gerenciar produtos da **Loja Virtual**
  - ✅ Gerenciar conteúdos das **Aulas Online** (títulos, links de vídeos, materiais)

---

### 3. 👥 Gestão de Equipe (RBAC)
- Cadastro e edição de membros da equipe (professores, administradores, etc.)
- Atribuição de papéis (**roles**):
  - Admin Master
  - Instrutor
  - Administrativo
  - Loja
- Controle de permissões baseado nos papéis

---

### 4. 🔒 Log de Ações (Auditoria)
- Registro de todas as ações realizadas no painel:
  - ✔️ Quem fez
  - ✔️ O que fez
  - ✔️ Quando fez
- Apenas o **Admin Master (Professor)** pode visualizar o log completo.

---

## 🔥 Funcionalidades planejadas para Pós-MVP (Fase 2)
- 📚 Gestão de Alunos:
  - Cadastro, edição e lista de alunos ativos
  - Controle de mensalidades por mês (**status: pago / não pago**)
  - Lançamento de cobranças adicionais (eventos, uniformes, materiais)
- 📑 Relatórios simples (alunos ativos, inadimplentes, pagamentos pendentes)
- ✔️ Controle de presença nas aulas (futuro)
- ✔️ Sistema de feedback dos alunos (futuro)

---

## 🏆 Status do MVP
✔️ Documentação concluída  
✔️ Banco modelado e rodando  
✔️ Login com RBAC implementado  
✔️ Landing page (em desenvolvimento)  
✔️ Galeria, Agenda e Contato integrados no MVP  
✔️ Loja e Aulas Online **em desenvolvimento** no frontend

---
