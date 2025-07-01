# 📊 Módulo Dashboard – Capoeira Base (Admin)

## 🎯 Objetivo

Exibir um **painel de visão geral** para os usuários autenticados, com estatísticas rápidas, lembretes internos, atalhos para os módulos e notificações visuais. Interface limpa, responsiva e com acesso condicionado por permissões (RBAC).

---

## 🧱 Estrutura de Componentes

src/pages/Dashboard.jsx // Página principal do dashboard
src/components/lembretes/ModalLembretes.jsx
src/hooks/useLembretes.js // Hook para lembretes pendentes


---

## 🧠 Funcionalidades

- **Boas-vindas personalizadas** com nome do usuário logado
- **Cards de estatísticas rápidas**:
  - Alunos ativos
  - Pendências
  - Eventos
  - Fotos
- **Agenda da semana** (futura integração com horários/eventos reais)
- **Acesso rápido** aos principais módulos (botões condicionados ao papel do usuário)
- **Lembretes dinâmicos** (abrem modal para CRUD completo)
- **Atividades recentes** (estático por enquanto, com possibilidade futura de logs reais)

---

## 🔐 Permissões Aplicadas (via `usePermissao()`)

| Bloco                        | Visível para |
|-----------------------------|---------------|
| Botões de acesso rápido     | baseados em `roles` (ex: admin, instrutor, loja) |
| Modal de lembretes          | admin e instrutor |
| Contador de lembretes       | visível se houver pendentes |

---

## 📌 Integrações com outros módulos

| Módulo        | Integração           |
|---------------|----------------------|
| Agenda        | Quantidade de eventos via `listarEventos()` |
| Galeria       | Quantidade de fotos via `listarImagens()` |
| Lembretes     | Mostra lembretes `status = pendente` com destaque visual |

---

## ⚙️ Detalhes Técnicos

- Mobile-first com Tailwind CSS
- Importação de ícones via `@heroicons/react`
- Estado local com `useState`, carregamento via `useEffect`
- Modal de lembretes com `@headlessui/react`
- Ações visuais condicionadas por `usePermissao()`

---

## 📱 Responsividade

- Layout adaptado para telas pequenas
- Grid de cards e botões com `sm:grid-cols-*`
- Modal centralizado com scroll vertical

---

## 💡 Melhorias Futuras

- [ ] Integração real com histórico de atividades
- [ ] Mostrar lembretes por prioridade no painel principal
- [ ] Logs de ações recentes do usuário
- [ ] Widget de aniversários de alunos ou eventos futuros
- [ ] Exportação de relatórios simples

---

## ✅ Status

- [x] Funcional
- [x] 100% mobile-first
- [x] Integrado com módulos de Agenda, Galeria e Lembretes
- [x] Documentação concluída (`README-DASHBOARD.md`)
- [ ] Pronto para fase de melhorias visuais e analíticas
