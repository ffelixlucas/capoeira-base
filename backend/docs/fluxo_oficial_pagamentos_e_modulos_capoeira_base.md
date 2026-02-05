# 📄 Fluxo Oficial de Pagamentos e Relacionamento entre Módulos

Projeto **Capoeira Base**

---

## 🎯 Objetivo do Documento

Este documento descreve **de forma oficial, definitiva e reutilizável** o fluxo de relacionamento entre os módulos do Capoeira Base envolvidos em **qualquer tipo de pagamento**, garantindo:

- Arquitetura desacoplada
- Suporte total a **multi-organização (multi-org)**
- Reutilização para **loja, mensalidades, matrículas e eventos**
- Evolução futura sem refatoração estrutural

Este material deve servir como **referência técnica permanente**.

---

## 🧠 Princípio Central (Regra de Ouro)

> **Todo pagamento no sistema nasce como uma COBRANÇA.**

Não importa a origem:
- Venda de produto
- Mensalidade
- Matrícula
- Inscrição em evento

👉 A origem **apenas gera uma cobrança**.
👉 O pagamento **apenas altera o status da cobrança**.

---

## 🌍 Multi‑Organização (Fundamental)

### Regras obrigatórias

- Todas as tabelas possuem `organizacao_id`
- O **frontend nunca envia `organizacao_id`**
- A organização é resolvida via **slug público**

Fluxo:

```
slug → organizacoes.id → organizacao_id
```

Isso garante:
- Isolamento total de dados
- Segurança
- Prevenção de fraude

---

## 🧩 Visão Geral dos Módulos

```
[ Origem Pública ]
        ↓
[ Carrinho (opcional) ]
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
- Loja pública
- Página de evento
- Página de matrícula

### Responsabilidades
- Expor informações ao usuário
- Capturar intenção de compra
- **Nunca cria cobrança**
- **Nunca integra gateway**

### Multi‑org
- Identificada apenas pelo `slug`

---

## 2️⃣ Carrinho Público (Quando aplicável)

### Quando existe
- Loja com múltiplos itens

### Responsabilidades
- Registrar SKUs selecionados
- Quantidade
- Calcular valor total
- Preparar dados para pagamento

### O que NÃO faz
- ❌ Não cria cobrança
- ❌ Não integra pagamento
- ❌ Não controla status financeiro

---

## 3️⃣ Módulo Pagamentos (Núcleo Público)

### Papel

O módulo **Pagamentos** é o **núcleo financeiro público** do sistema.

Ele é responsável por:
- Criar cobranças
- Integrar gateway
- Controlar status de pagamento

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

### Validações
- Campos obrigatórios
- Valor válido
- Resolução do `slug`
- Criação da cobrança

---

## 4️⃣ Criação da Cobrança

Ao receber o payload:

- Resolve `organizacao_id`
- Cria registro de cobrança
- Status inicial: `pendente`

A cobrança é a **fonte de verdade**.

---

## 5️⃣ Integração com Gateway (Mercado Pago)

O módulo Pagamentos:

- Gera pagamento via API do Mercado Pago
- Suporta:
  - PIX (QR Code)
  - Cartão de crédito
  - Boleto

### Referência externa

```
external_reference = cobranca_id
```

---

## 6️⃣ Webhook de Pagamento

### Função

- Receber confirmação do gateway
- Identificar cobrança via `external_reference`
- Atualizar status

### Status possíveis
- `pendente`
- `pago`
- `cancelado`
- `rejeitado`

---

## 7️⃣ Consequências Pós‑Pagamento (Futuro)

⚠️ **Nunca ficam no Pagamentos**

Exemplos:
- Baixa de estoque
- Liberação de matrícula
- Confirmação de inscrição
- Envio de e-mail

Essas ações ficam nos **módulos de origem**.

---

## ♻️ Reutilização do Fluxo

O mesmo fluxo serve para:

| Origem | Carrinho | Pagamentos | Webhook |
|------|----------|------------|---------|
| Loja | ✅ | ✅ | ✅ |
| Evento | ❌ | ✅ | ✅ |
| Matrícula | ❌ | ✅ | ✅ |
| Mensalidade | ❌ | ✅ | ✅ |

---

## ✅ Conclusão Oficial

- Arquitetura correta
- Fluxo profissional
- Multi‑org seguro
- Pronto para escalar

📌 **Este fluxo é definitivo no Capoeira Base.**

