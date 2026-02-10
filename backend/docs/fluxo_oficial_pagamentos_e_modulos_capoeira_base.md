Perfeito.
Segue o **documento completo, revisado e alinhado com a arquitetura final** — pronto para ser considerado **oficial e definitivo**.

---

# 📄 Fluxo Oficial de Pagamentos e Relacionamento entre Módulos

Projeto **Capoeira Base**

---

## 🎯 Objetivo do Documento

Este documento descreve **de forma oficial, definitiva e reutilizável** o fluxo de relacionamento entre os módulos do Capoeira Base envolvidos em **qualquer tipo de pagamento**, garantindo:

* Arquitetura desacoplada
* Suporte total a **multi-organização (multi-org)**
* Reutilização para **loja, mensalidades, matrículas e eventos**
* Evolução futura **sem refatoração estrutural**

Este material deve servir como **referência técnica permanente**.

---

## 🧠 Princípio Central (Regra de Ouro)

> **Todo pagamento no sistema nasce como uma COBRANÇA.**

Não importa a origem:

* Venda de produto
* Mensalidade
* Matrícula
* Inscrição em evento

Regras:

* 👉 A origem **gera um pedido ou entidade de negócio** (quando aplicável)
* 👉 O módulo **Pagamentos cria e controla a cobrança operacional**
* 👉 O pagamento **altera o status da cobrança e dispara consequências**

---

## 🌍 Multi-Organização (Fundamental)

### Regras obrigatórias

* Todas as tabelas possuem `organizacao_id`
* O **frontend nunca envia `organizacao_id`**
* A organização é resolvida via **slug público**

Fluxo:

```
slug → organizacoes.id → organizacao_id
```

Isso garante:

* Isolamento total de dados
* Segurança
* Prevenção de fraude

---

## 🧩 Visão Geral dos Módulos

```
[ Origem Pública ]
        ↓
[ Pedido (pendente) ]
        ↓
[ Pagamentos ]
        ↓
[ Gateway (Mercado Pago) ]
        ↓
[ Webhook ]
```

---

## 1️⃣ Origem Pública (Loja, Evento, Matrícula)

### Exemplos

* Loja pública
* Página de evento
* Página de matrícula

### Responsabilidades

* Expor informações ao usuário
* Capturar intenção de compra
* **Nunca cria cobrança**
* **Nunca integra gateway**

### Multi-org

* Identificada apenas pelo `slug`

---

## 2️⃣ Pedido Público (Quando aplicável)

### Quando existe

* Loja com múltiplos itens

### Responsabilidades

* Registrar SKUs selecionados
* Quantidade
* Calcular valor total
* Criar **pedido pendente**
* Preparar dados para pagamento

📌 O pedido nasce com status **pendente** e **só é confirmado após o pagamento**.

### O que NÃO faz

* ❌ Não cria cobrança
* ❌ Não integra pagamento
* ❌ Não controla status financeiro

---

## 3️⃣ Módulo Pagamentos (Núcleo Público)

### Papel

O módulo **Pagamentos** é o **núcleo financeiro público do sistema**.

Ele é responsável por:

* Criar cobranças operacionais
* Integrar gateway
* Controlar status de pagamento

---

### Endpoint Base

```
POST /api/pagamentos/:slug
```

### Payload genérico

```json
{
  "origem": "loja | evento | mensalidade | matricula",
  "entidade_id": 1,
  "nome_pagador": "Nome",
  "cpf": "00000000000",
  "telefone": "41999999999",
  "email": "email@email.com",
  "valor_total": 100.00
}
```

📌 `entidade_id` referencia:

* **pedido_id** (loja)
* evento, matrícula ou mensalidade (demais casos)

---

### Validações

* Campos obrigatórios
* Valor válido
* Resolução do `slug`
* Criação da cobrança

---

## 4️⃣ Criação da Cobrança

Ao receber o payload:

* Resolve `organizacao_id`
* Cria registro de cobrança
* Status inicial: `pendente`

### Fonte da Verdade

* A cobrança criada no **módulo Pagamentos** é a **fonte de verdade operacional do pagamento**
* O **módulo Financeiro** mantém uma **visão administrativa e contábil** dessa cobrança

---

## 5️⃣ Integração com Gateway (Mercado Pago)

O módulo Pagamentos:

* Gera pagamento via API do Mercado Pago
* Suporta:

  * PIX (QR Code)
  * Cartão de crédito
  * Boleto

### Referência externa

```
external_reference = cobranca_id
```

---

## 6️⃣ Webhook de Pagamento

### Função

* Receber confirmação do gateway
* Identificar cobrança via `external_reference`
* Atualizar status da cobrança operacional

### Status possíveis

* `pendente`
* `pago`
* `cancelado`
* `rejeitado`

O webhook **não contém regras de negócio**.

---

## 7️⃣ Consequências Pós-Pagamento

⚠️ **Nunca ficam no módulo Pagamentos**

Exemplos:

* Baixa de estoque
* Confirmação de pedido
* Liberação de matrícula
* Confirmação de inscrição
* Envio de e-mail

Essas ações ficam nos **módulos de origem** e são executadas **após a cobrança ser marcada como `pago`**.

---

## 8️⃣ Processamento Pós-Pagamento (Função Oficial)

Após a cobrança ser marcada como `pago`, o sistema executa **uma única função genérica e oficial**:

```
processarCobrancaPaga(cobranca_id)
```

### Responsabilidades

* Garantir idempotência
* Verificar status da cobrança
* Verificar se a consequência já foi executada
* Disparar ações conforme a origem

---

### 🔒 Idempotência

A cobrança possui o campo:

```
consequencia_executada = false
```

Fluxo:

* A função executa apenas se:

  * `status === pago`
  * `consequencia_executada === false`
* Após executar:

  * `consequencia_executada = true`

Isso garante:

* Estoque não baixa duas vezes
* E-mails não duplicam
* Webhook seguro contra repetição

---

## ♻️ Reutilização do Fluxo

O mesmo fluxo serve para:

| Origem      | Pedido | Pagamentos | Webhook |
| ----------- | ------ | ---------- | ------- |
| Loja        | ✅      | ✅          | ✅       |
| Evento      | ❌      | ✅          | ✅       |
| Matrícula   | ❌      | ✅          | ✅       |
| Mensalidade | ❌      | ✅          | ✅       |

---

## ✅ Conclusão Oficial

* Arquitetura correta
* Fluxo profissional
* Separação clara entre **pedido**, **pagamento** e **consequência**
* Multi-org seguro
* Pronto para escalar

📌 **Este fluxo é definitivo no Capoeira Base e deve ser seguido em todos os módulos futuros.**
