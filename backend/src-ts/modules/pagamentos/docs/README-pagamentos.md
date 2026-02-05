# 💰 Módulo Pagamentos – Capoeira Base

## 🎯 Objetivo

O módulo **Pagamentos** é o **núcleo financeiro** do Capoeira Base. Ele foi criado para centralizar **todas as cobranças do sistema**, independentemente da origem:

* Loja pública
* Inscrições em eventos
* Matrículas
* Mensalidades
* Qualquer cobrança futura

Seu papel é **registrar, controlar e evoluir pagamentos**, mantendo o sistema desacoplado de gateways e preparado para crescimento.

---

## 🧠 Princípios Arquiteturais

* **Centralização financeira**: todo dinheiro passa por este módulo.
* **Multi-organização real**: dados sempre isolados por `organizacao_id`.
* **Frontend nunca envia `organizacao_id`**.
* **Slug é a fonte de verdade** para identificar a organização.
* **Nenhum módulo conhece o gateway de pagamento**.
* **Gateway (Mercado Pago) entra apenas aqui**.

---

## 🌍 Multi-organização (Slug)

O módulo resolve a organização a partir do `slug` recebido na URL.

### Exemplo de rota

```
POST /api/pagamentos/:slug
```

Fluxo interno:

```
slug → organizacoes.id → organizacao_id
```

Isso garante:

* Segurança
* Consistência
* Impossibilidade de fraude via frontend

---

## 📦 Contrato de Entrada (Payload)

Payload mínimo aceito pelo módulo:

```json
{
  "origem": "loja",
  "entidade_id": 1,
  "nome_pagador": "Nome do cliente",
  "cpf": "00000000000",
  "telefone": "41999999999",
  "email": "cliente@email.com",
  "valor_total": 85.00
}
```

### Significado dos campos

| Campo        | Descrição                                                  |
| ------------ | ---------------------------------------------------------- |
| origem       | Origem da cobrança (`loja`, `evento`, `mensalidade`, etc.) |
| entidade_id  | ID da entidade de origem (pedido, inscrição, etc.)         |
| nome_pagador | Nome do responsável pelo pagamento                         |
| cpf          | CPF do pagador                                             |
| telefone     | Telefone do pagador                                        |
| email        | E-mail do pagador                                          |
| valor_total  | Valor da cobrança                                          |

---

## 🗄️ Persistência

### Tabela: `pagamentos_cobrancas`

Campos principais:

* `id`
* `organizacao_id`
* `origem`
* `entidade_id`
* `nome_pagador`
* `cpf`
* `telefone`
* `email`
* `valor_total`
* `status` (`pendente`, `pago`, `cancelado`, etc.)
* `created_at`

Esta tabela representa a **fonte de verdade financeira** do sistema.

---

## 🔌 Endpoint Disponível

### Criar cobrança (intenção de pagamento)

```
POST /api/pagamentos/:slug
```

Resposta esperada:

```json
{
  "success": true,
  "data": {
    "cobranca_id": 1,
    "status": "pendente"
  }
}
```

---

## 🔒 O que este módulo NÃO faz (por enquanto)

* ❌ Não integra Mercado Pago
* ❌ Não gera PIX, cartão ou boleto
* ❌ Não processa webhook
* ❌ Não altera status para `pago`
* ❌ Não baixa estoque

Essas responsabilidades entram **em etapas futuras**, sem quebrar esta base.

---

## 🚀 Próximas Etapas Planejadas

* Integração com **Mercado Pago** (PIX / Cartão / Boleto)
* Uso de `external_reference = cobranca_id`
* Webhook centralizado
* Atualização automática de status
* Notificação do módulo de origem (pedido, inscrição, etc.)
* Migração gradual de eventos para este módulo

---

## ✅ Status do Módulo

* ✔ Estrutura criada
* ✔ Multi-org funcional
* ✔ Integração com Loja Pública
* ✔ Persistência validada
* ✔ Pronto para integração com gateway

---

📌 **Resumo**

Este módulo foi construído como uma **base financeira profissional**, preparada para crescer sem gerar dívida técnica e alinhada ao padrão SaaS multi-organização do Capoeira Base.
