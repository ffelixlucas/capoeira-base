# 📦 Módulo Financeiro — Estado Atual (Backend)

Este documento registra **de forma permanente** o estado atual do **Módulo Financeiro** do projeto **Capoeira Base**, servindo como referência obrigatória para futuros desenvolvimentos, manutenções ou novos chats.

---

## 🎯 Objetivo do Módulo

Centralizar **todas as cobranças do sistema**, independentemente da origem:

- Mensalidades
- Eventos
- Produtos / Loja
- Outros serviços

> ⚠️ O módulo **Financeiro NÃO executa pagamentos**. Ele apenas **registra, controla e audita cobranças**.

Pagamentos são responsabilidade de um **módulo separado**.

---

## 🧠 Conceito Central

Tudo gira em torno do conceito de **COBRANÇA**.

- Produto, evento ou mensalidade **apenas geram cobranças**
- Pagamentos **apenas alteram o status da cobrança**
- Nenhuma regra de negócio financeira fica fora do módulo Financeiro

---

## 🗄️ Tabela Central

### `financeiro_cobrancas`

Campos principais:

- `id`
- `organizacao_id`
- `cpf`
- `nome_pagador`
- `origem` (mensalidade | evento | produto | outro)
- `referencia_id`
- `descricao`
- `valor_original`
- `valor_final`
- `data_emissao`
- `data_vencimento`
- `data_pagamento` (opcional)
- `status` (pendente | pago | atrasado | cancelado)
- `metodo_pagamento` (opcional)
- `pago_manual` (boolean)
- `criado_por` (sistema | admin)
- `observacoes` (opcional)

Essa tabela é o **núcleo financeiro definitivo do sistema**.

---

## 🏗️ Arquitetura Implementada

O módulo foi criado **diretamente em TypeScript**, seguindo o padrão híbrido oficial do projeto.

### Estrutura atual:

```
src-ts/modules/financeiro/
├── financeiroRepository.ts
├── financeiroService.ts
├── financeiroController.ts
├── financeiroRoutes.ts
```

Com ponte JS em:

```
modules/financeiro/financeiroRoutes.js
```

---

## 🔁 Fluxo Técnico Atual

### 1️⃣ Routes

- Rota administrativa protegida
- Caminho base:
  ```
  /api/financeiro
  ```
- Middleware:
  - `verifyToken`

Endpoints ativos:
- `GET /api/financeiro`
- `GET /api/financeiro/:id`

---

### 2️⃣ Controller

Responsável por:

- Ler `req.usuario.organizacao_id`
- Validar parâmetros de rota
- Orquestrar chamadas ao service
- Retornar JSON padronizado

Formato de resposta:

```json
{
  "success": true,
  "data": ...
}
```

---

### 3️⃣ Service

Responsável por:

- Receber `organizacaoId` obrigatoriamente
- Aplicar regras mínimas de domínio
- Validar existência da cobrança
- Encaminhar operações ao repository

> Ainda **sem regras complexas** (juros, geração automática, parcelamento).

---

### 4️⃣ Repository

Responsável exclusivamente pelo banco de dados.

Regras obrigatórias:

- Nenhuma query sem `organizacao_id`
- Nenhum SQL fora do repository
- Logs com contexto de organização

Funções existentes:

- `listarCobrancas`
- `buscarCobrancaPorId`

---

## 🔐 Segurança e Padrões

- ✔️ JWT obrigatório
- ✔️ Multi-organização aplicada
- ✔️ TypeScript validado
- ✔️ Ponte JS funcionando
- ✔️ Logs no padrão do projeto
- ✔️ Nenhum acesso direto ao banco fora do repository

---

## ✅ Status Atual

- [x] Módulo Financeiro ativo
- [x] Arquitetura validada
- [x] Listagem de cobranças
- [x] Consulta por ID
- [ ] Criação de cobrança
- [ ] Atualização de status
- [ ] Marcação de pagamento manual
- [ ] Relatórios

---

## 🚀 Próximos Passos Planejados

1. Criar **criação de cobrança** (`POST /api/financeiro`)
2. Criar **alteração de status**
3. Criar **pagamento manual**
4. Integrar com módulo de Pagamento (apenas atualização de status)

---

## 📌 Observação Final

Este documento representa o **estado oficial e permanente** do módulo Financeiro até este ponto.

Qualquer novo desenvolvimento **deve respeitar integralmente** este material para evitar retrabalho ou acoplamento indevido.

