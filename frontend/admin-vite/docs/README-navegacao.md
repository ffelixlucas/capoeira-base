# 📌 README – Navegação Interna e Botão Voltar (Admin)

## 🎯 Objetivo
Garantir uma navegação **consistente** e **previsível** entre páginas do painel administrativo (LayoutAdmin), evitando loops e mantendo o foco **mobile-first**.

---

## 🔹 Componentes e Hooks Envolvidos

1. **`BackButton.jsx`**  
   - Local: `src/components/layout/BackButton.jsx`  
   - Exibe o botão “Voltar” no Header do `LayoutAdmin`.
   - Regras:
     - **Se na `/dashboard`** → não exibe botão.
     - **Se existe histórico interno** → volta para a última rota visitada no admin e remove ela do stack.
     - **Se está em rota raiz** (ex.: `/agenda`, `/inscricoes`, etc.) sem histórico → volta direto para `/dashboard`.
     - **Senão** → usa o `parentMap` do `routeMeta.js` para encontrar o “pai” da rota atual.
     - Último fallback → `/dashboard`.

2. **`useRouteHistory.js`**  
   - Local: `src/hooks/useRouteHistory.js`  
   - Mantém um **stack** de rotas navegadas **dentro do admin** usando `sessionStorage`.
   - Funções principais:
     - `popPrev()` → remove a rota atual + anterior e retorna o destino para navegação.
     - `peekPrev()` → olha a rota anterior sem remover (pouco usado no novo fluxo).
   - Limite: mantém **últimas 25 rotas** para evitar excesso de memória.

3. **`routeMeta.js`**  
   - Local: `src/routes/routeMeta.js`  
   - Lista **padrões de rota** (`pattern`) e seus pais (`parent`) para fallback.  
   - Exemplo:
     ```js
     { pattern: "/inscricoes/:eventoId", parent: "/inscricoes" }
     ```

---

## 🔹 Fluxo do Voltar

### Caso 1 – Tela filha (com histórico)
```
/agenda → /inscricoes → [Voltar]
Resultado: /agenda ✅
```

### Caso 2 – Tela raiz sem histórico
```
/agenda (entrou direto, sem vir de outra rota admin) → [Voltar]
Resultado: /dashboard ✅
```

### Caso 3 – Detalhe dentro de listagem
```
/inscricoes → /inscricoes/15 → [Voltar]
Resultado: /inscricoes ✅
```

### Caso 4 – Falta histórico mas há parentMap
```
/turmas/10 (acesso direto via link externo) → [Voltar]
Resultado: /turmas ✅
```

---

## 🔹 Benefícios do Modelo
- **Evita loops** (ex.: /agenda ↔ /inscricoes repetidamente).
- Funciona mesmo com rotas acessadas via URL direta (sem clique interno).
- Mobile-first: botão sempre visível (exceto no dashboard).
- Fácil manutenção: novas rotas só precisam ser adicionadas ao `routeMeta.js` e à lista de raízes no `BackButton`.

---

## 🔹 Melhorias Futuras
- Adicionar **breadcrumb compacto** no Header:  
  `Agenda › Inscritos`  
- Permitir **atalho de teclado** (ESC ou Backspace) para voltar.
- Adicionar testes automáticos de navegação para validar stack.

---

## 🔹 Última atualização
`{{DATA}}` – Implementação do histórico interno + limpeza de stack para evitar loops.
