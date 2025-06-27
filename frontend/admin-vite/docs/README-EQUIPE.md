# 🧩 Módulo Equipe – Admin Vite (Frontend)

## ✅ Objetivo

Permitir ao administrador do sistema Capoeira Base gerenciar os **membros da equipe interna**, com cadastro completo, edição, atribuição de papéis (roles), e visualização responsiva.

---

## 🧱 Estrutura do Módulo

src/
├── pages/
│ └── Equipe.jsx # Página principal de gerenciamento
│
├── components/equipe/
│ ├── EquipeList.jsx # Lista visual dos membros
│ ├── EquipeForm.jsx # Modal com formulário de cadastro/edição
│
├── hooks/
│ └── useEquipe.js # Hook customizado para carregar a equipe
│
├── services/
│ └── equipeService.js # Chamadas à API backend


---

## 🚦 Fluxo de Funcionamento

1. **Equipe.jsx** carrega a página principal:
   - Exibe título e botão "+ Novo Membro"
   - Aciona o modal `EquipeForm` com estado interno (create/update)

2. **EquipeList.jsx**:
   - Lista visual dos membros com expansão por clique
   - Exibe papéis atuais, dados de contato e botões de ação (editar, excluir)

3. **EquipeForm.jsx**:
   - Modal usado para criar ou editar membros
   - Campos: nome, telefone, WhatsApp, e-mail, status, observações
   - Senha só aparece na criação (nunca na edição)
   - Papéis (roles) carregados e atribuídos dinamicamente
   - Cada ação tem feedback visual (toast + loading)

4. **useEquipe.js**:
   - Hook que carrega os dados da equipe com controle de loading/erro

5. **equipeService.js**:
   - Conecta com backend via API REST
   - Funções: listarEquipe, criarMembro, atualizarMembro, listarRoles, atribuirPapel, removerTodosOsPapeis, deletarMembro

---

## 🔐 Validações e UX

- `Nome` é obrigatório
- Pelo menos 1 papel deve ser atribuído
- Feedback com `toast` para sucesso, erro e aviso
- Campo `senha` **não aparece na edição**
- Modal acessível:
  - Fecha no ESC
  - Fecha ao clicar fora
  - Foco automático nos inputs

---

## 📡 Integração com Backend

- `GET /equipe` → listarEquipe
- `POST /equipe` → criarMembro
- `PUT /equipe/:id` → atualizarMembro
- `GET /roles` → listarRoles
- `DELETE /equipe/:id/roles` → limpar papéis
- `POST /equipe/:id/roles` → atribuir papel (um por um)
- `DELETE /equipe/:id` → deletar membro

---

## ✅ Status Atual

✔️ 100% funcional  
✔️ Integração com RBAC  
✔️ Design responsivo  
✔️ Feedback visual completo  
✔️ Código limpo e modularizado  

---

## 🔮 Melhorias Futuras

- [ ] Avatar dos membros
- [ ] Filtro por papel (ex: instrutor, assistente)
- [ ] Ação de exclusão com confirmação
- [ ] Página de perfil individual para autoedição
- [ ] Pesquisa por nome ou papel

---

## 📎 Relacionamento com outros módulos

- Conecta diretamente com o módulo de **permissões (RBAC)**
- Usa papéis vindos da tabela `roles` e `equipe_roles`
- Está integrado com o sistema de autenticação e controle de acesso

---
