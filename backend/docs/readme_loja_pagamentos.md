# 📦 Módulo Loja + Pagamentos + Estoque + E-mails (Ponta a Ponta)

Este documento descreve **todo o fluxo da loja**, do cadastro do produto até a retirada pelo cliente, incluindo **módulos, tabelas, rotas, responsabilidades, decisões arquiteturais e próximos passos**.

---

## 🎯 Objetivo do Módulo

Criar um fluxo **profissional, seguro e escalável** para vendas avulsas (loja), com:

* Pagamento online
* Conversão de pedido
* Baixa de estoque
* Comunicação por e-mail (admin e cliente)
* Proteção contra duplicidade (**idempotência**)

---

## 🧱 Módulos Envolvidos

> ⚠️ **Importante:** o sistema possui um **Módulo Financeiro** separado, que **NÃO executa pagamentos**.
> Ele atua como **camada contábil e administrativa**, enquanto o módulo de **Pagamentos** executa o fluxo operacional.

---

### 1️⃣ Loja (Pública)

Responsável por:

* Listar produtos
* Permitir seleção de SKUs
* Criar **pedido pendente**
* **Solicitar criação de cobrança via módulo Pagamentos**

📌 A loja **não cria cobrança** e **não integra gateway**.

**Pasta:**

```
modules/public/loja
```

---

### 2️⃣ Financeiro (Administrativo)

Responsável por:

* Centralizar **todas as cobranças administrativas do sistema**
* Registrar valores, vencimentos e status
* Servir como **visão contábil, histórica e auditável**

❌ Não executa pagamento
❌ Não integra gateway
❌ Não baixa estoque
❌ Não envia e-mails operacionais

**Pasta:**

```
modules/financeiro
```

**Tabela:**

```
financeiro_cobrancas
```

⚠️ O Financeiro **não participa do fluxo operacional da loja**.
Ele atua como **espelho administrativo** das cobranças.

---

### 3️⃣ Pagamentos (Núcleo Público)

Responsável por:

* Criar **cobranças operacionais**
* Integrar gateway (Pix / Cartão / Boleto)
* Receber webhook
* Controlar status do pagamento
* Disparar o processamento pós-pagamento

**Pasta:**

```
modules/pagamentos
```

---

### 4️⃣ Pedidos

Responsável por:

* Criar pedido pendente
* Atualizar status do pedido
* Controlar fluxo operacional (separação, retirada, entrega)

**Pasta:**

```
modules/pedidos
```

---

### 5️⃣ Estoque

Responsável por:

* Controlar quantidade por SKU
* Baixar estoque **somente após pagamento confirmado**
* Registrar histórico de movimentações

**Pasta:**

```
modules/estoque
```

---

### 6️⃣ Notificações (Admin)

Responsável por:

* Enviar e-mails baseados em eventos do sistema
* Uso **exclusivo para admin/equipe**

**Pasta:**

```
modules/notificacoes
```

---

### 7️⃣ Email Service (Transacional)

Responsável por:

* Enviar e-mails diretos ao cliente
* Confirmação de pedido
* Pedido pronto para retirada

**Pasta:**

```
services/emailService.ts
```

---

## 🗄️ Tabelas Principais

### 🔹 produtos

Cadastro do produto base.

### 🔹 produtos_skus

Variações vendáveis (tamanho, cor, atributos).

### 🔹 estoque

Quantidade disponível por SKU.

### 🔹 estoque_movimentacoes

Histórico de entradas e saídas.

### 🔹 pedidos

Pedido do cliente (entidade de negócio).

### 🔹 pedido_itens

Itens do pedido (SKU + quantidade).

### 🔹 pagamentos_cobrancas (**FONTE DA VERDADE OPERACIONAL**)

Tabela oficial da cobrança executável.

Campos críticos:

* `status`
* `origem`
* `entidade_id` (pedido_id)
* `consequencia_executada`

⚠️ `financeiro_cobrancas` **não participa do fluxo operacional da loja**, apenas do **controle administrativo**.

---

## 🔀 Fluxo Completo (Ponta a Ponta)

### 🧩 1. Cadastro de Produto (Admin)

* Admin cria produto
* Admin cria SKUs
* Admin define estoque inicial (quando aplicável)

---

### 🛒 2. Cliente monta pedido (Loja Pública)

* Seleciona SKUs
* Define quantidades
* Pedido criado com status:

```
pendente_pagamento
```

---

### 💳 3. Criação da Cobrança (Pagamentos)

Rota:

```
POST /api/public/pagamentos/:slug
```

* Loja solicita a criação da cobrança
* Registro criado em `pagamentos_cobrancas`
* Status inicial:

```
pendente
```

---

### 💰 4. Pagamento Aprovado

Via:

* Webhook real (produção)
* Script manual (teste):

```bash
npx ts-node -r dotenv/config testar-pagamento.ts
```

---

### ⚙️ 5. processarCobrancaPaga (Coração do Sistema)

Arquivo:

```
modules/pagamentos/processarCobrancaPaga.ts
```

Executa **UMA ÚNICA VEZ**:

* Verifica status = `pago`
* Verifica `consequencia_executada = false`
* Converte pedido para confirmado
* Baixa estoque (se SKU for pronta entrega)
* Envia e-mail para admin
* Envia e-mail de confirmação ao cliente
* Marca `consequencia_executada = true`

🔒 **Idempotente** (seguro contra webhook duplicado)

---

### 📧 E-mails Enviados no Pagamento

#### Admin

* Via motor de notificações
* Evento: `loja`

#### Cliente

* Via `emailService.enviarEmailPedidoCliente`
* E-mail transacional direto

---

### 📦 6. Separação do Pedido (Admin)

Rota:

```
PATCH /api/pedidos/:pedidoId/pronto-retirada
```

Efeitos:

* Status do pedido → `pronto_retirada`
* Disparo do **segundo e-mail ao cliente**

---

### 📧 E-mail 2 – Pedido Pronto

Conteúdo:

* Pedido pronto para retirada
* Orientações de próximo passo

---

## 🔐 Proteções Importantes

### Idempotência

Campo:

```
consequencia_executada
```

Garante:

* Estoque não baixa duas vezes
* E-mails não duplicam
* Webhook seguro e repetível

---

## 🧠 Decisões Arquiteturais Importantes

* Cliente **não usa** motor de notificações
* Admin **usa** motor de eventos
* Estoque baixa **no pagamento**, não na retirada
* `pagamentos_cobrancas` é a **fonte da verdade operacional**
* Financeiro é **camada administrativa**, não operacional

---

## 🚧 O QUE FALTA / PRÓXIMOS PASSOS

### Funcionais

* [ ] Front da loja
* [ ] Admin de pedidos (listagem + ação)
* [ ] Status `retirado` ou `enviado`

### Técnicos

* [ ] Alerta de estoque mínimo
* [ ] Suporte a encomenda (sem estoque)
* [ ] Paginação de pedidos

---

## 🏁 RESUMO FINAL

✔ Fluxo ponta a ponta validado
✔ Arquitetura limpa
✔ Idempotente
✔ Seguro
✔ Escalável
✔ Pronto para produção

📌 **Este é o guia oficial do módulo de Loja do Capoeira Base.**
