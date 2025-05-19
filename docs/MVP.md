# MVP – Capoeira Base

## Objetivo do MVP

Entregar uma versão funcional mínima do sistema, com foco nas funcionalidades essenciais que geram valor imediato para o projeto social.

---

## Escopo do MVP

### 1. Site Público (visitantes)
- Página inicial com logo e apresentação
- Seção "Sobre o projeto"
- Seção "Agenda de aulas e eventos"
- Seção "Galeria de fotos"
- Seção "Contato" com mapa e redes sociais

---

### 2. Painel Administrativo (/admin)
- Login com JWT
- Dashboard para:
  - Atualizar agenda
  - Subir imagens da galeria
  - Editar informações de contato

---

### 3. Gestão de Alunos
- Cadastro e edição de alunos
- Lista de alunos ativos
- Controle de mensalidades por mês (status: pago/não pago)
- Registro de cobranças adicionais (eventos, uniformes)

---

### 4. Log de Ações (Auditoria)
- Registro de todas as ações administrativas:
  - Quem fez
  - O que fez
  - Quando fez

Apenas o professor (admin master) poderá visualizar o log completo.
