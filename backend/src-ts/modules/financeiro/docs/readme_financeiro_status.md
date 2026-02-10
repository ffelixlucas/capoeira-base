# 📦 Módulo Financeiro — Estado Oficial (Backend)

Este documento registra **de forma permanente** o estado atual do **Módulo Financeiro** do projeto **Capoeira Base**, servindo como **referência obrigatória** para futuros desenvolvimentos, manutenções ou novos chats.

Este material **substitui versões anteriores** e reflete a **arquitetura final validada**.

---

## 🎯 Objetivo do Módulo

Centralizar **todas as cobranças administrativas e contábeis do sistema**, independentemente da origem:

* Mensalidades
* Eventos
* Produtos / Loja
* Matrículas
* Outros serviços

> ⚠️ **O módulo Financeiro NÃO executa pagamentos.**
> Ele atua exclusivamente como **camada administrativa, contábil e de auditoria**.

A execução do pagamento é responsabilidade de um **módulo separado (Pagamentos)**.

---

## 🧠 Conceito Central

O sistema trabalha com **duas camadas bem definidas**:

### 🔹 Camada Operacional

* Executa pagamento
* Recebe webhook
* Garante idempotência
* Dispara consequências

➡️ **Módulo Pagamentos**

### 🔹 Camada Administrativa / Contábil

* Registra cobranças
* Controla status administrativo
* Permite pagamento manual
* Gera relatórios
* Audita histórico financeiro

➡️ **Módulo Financeiro**

---

## 🧾 Papel do Financeiro no Sistema

O Financeiro:

* ✔ Registra cobranças
* ✔ Organiza valores, vencimentos e status
* ✔ Permite ações administrativas
* ✔ Serve como **espelho contábil auditável**
* ✔ Alimenta relatórios e controles internos

O Financeiro **NÃO**:

* ❌ Integra gateway
* ❌ Executa Pix, cartão ou boleto
* ❌ Processa webhook
* ❌ Baixa estoque
* ❌ Dispara e-mails operacionais

---

## 🗄️ Tabela Central

### `financeiro_cobrancas`

Esta tabela representa a **visão financeira administrativa** do sistema.

### Campos principais:

* `id`
* `organizacao_id`
* `cpf`
* `nome_pagador`
* `origem` (mensalidade | evento | produto | outro)
* `referencia_id`
* `descricao`
* `valor_original`
* `valor_final`
* `data_emissao`
* `data_vencimento`
* `data_pagamento` (opcional)
* `status` (pendente | pago | atrasado | cancelado)
* `metodo_pagamento` (opcional)
* `pago_manual` (boolean)
* `criado_por` (sistema | admin)
* `observacoes` (opcional)

---

## ⚠️ Fonte da Verdade

> **A fonte da verdade operacional do pagamento NÃO é o Financeiro.**

* ✔ Pagamento real → **`pagamentos_cobrancas`**
* ✔ Financeiro → **espelho administrativo**

O Financeiro pode:

* refletir um pagamento
* registrar pagamento manual
* ajustar status por decisão administrativa

Mas **nunca executa o fluxo crítico de pagamento**.

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

### Ponte JS:

```
modules/financeiro/financeiroRoutes.js
```

> A ponte existe apenas para compatibilidade com o app atual.
> Toda lógica vive em TypeScript.

---

## 🔁 Fluxo Técnico Atual

### 1️⃣ Routes

* Rota **administrativa**
* Protegida por JWT
* Caminho base:

```
/api/financeiro
```

Middleware obrigatório:

* `verifyToken`

Endpoints ativos:

* `GET /api/financeiro`
* `GET /api/financeiro/:id`

---

### 2️⃣ Controller

Responsabilidades:

* Ler `req.usuario.organizacao_id`
* Validar parâmetros
* Orquestrar chamadas
* Retornar JSON padronizado

Formato padrão:

```json
{
  "success": true,
  "data": ...
}
```

---

### 3️⃣ Service

Responsabilidades:

* Receber `organizacaoId` obrigatoriamente
* Validar domínio mínimo
* Validar existência da cobrança
* Encaminhar operações ao repository

> Não contém regras complexas neste momento
> (juros, recorrência, parcelamento ficam para evolução futura).

---

### 4️⃣ Repository

Responsável **exclusivamente** pelo banco de dados.

Regras obrigatórias:

* Nenhuma query sem `organizacao_id`
* Nenhum SQL fora do repository
* Logs com contexto da organização

Funções existentes:

* `listarCobrancas`
* `buscarCobrancaPorId`
* `criarCobranca`
* `atualizarStatus`
* `marcarPagamentoManual`

---

## 🔐 Segurança e Padrões

* ✔ JWT obrigatório
* ✔ Multi-organização aplicada
* ✔ TypeScript validado
* ✔ Ponte JS funcionando
* ✔ Logs no padrão do projeto
* ✔ Nenhum acesso direto ao banco fora do repository

---

## ✅ Status Atual

* [x] Módulo Financeiro ativo
* [x] Arquitetura validada
* [x] Listagem de cobranças
* [x] Consulta por ID
* [x] Criação de cobrança
* [x] Atualização de status
* [x] Pagamento manual (admin)
* [ ] Relatórios
* [ ] Exportações
* [ ] Reconciliação automática (futuro)

---

## 🚀 Próximos Passos (Fora do Financeiro)

O módulo Financeiro está **funcionalmente encerrado**.

Os próximos passos pertencem a **outros módulos**:

### 1️⃣ Módulo Pagamentos (Checkout Público)

* Pix / Cartão / Boleto
* Integração com gateway
* Webhook
* Idempotência
* Execução de consequências

### 2️⃣ Módulo Produtos / Estoque

* Cadastro de produtos
* SKUs
* Controle de estoque
* Baixa após pagamento

> Nenhuma dessas responsabilidades deve ser adicionada ao Financeiro.

---

## 📌 Observação Final

Este documento representa o **estado oficial, validado e permanente** do **Módulo Financeiro** do Capoeira Base.

Qualquer nova funcionalidade **deve respeitar integralmente** este material para evitar:

* acoplamento indevido
* duplicação de lógica
* retrabalho futuro

📎 **Este módulo está fechado.**
