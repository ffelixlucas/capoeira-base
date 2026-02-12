# 📦 MÓDULO LOJA PÚBLICA — ESTADO ATUAL

## 🎯 Objetivo

Implementar a vitrine pública da loja com:

* Listagem real de SKUs por organização
* Página individual de produto
* Integração completa com backend
* Multi-organização via slug
* Arquitetura separada (service / hook / page / component)

---

# 🏗️ Arquitetura Implementada

## 🔹 Backend

### 📁 modules/public/loja

Arquivos modificados:

* `lojaPublicRoutes.ts`
* `lojaPublicController.ts`
* `lojaPublicService.ts`
* `lojaPublicRepository.ts`

---

## 🔹 Rotas Públicas Disponíveis

### 1️⃣ Listar SKUs

```
GET /api/public/loja/:slug/skus
```

Retorno:

```json
{
  "success": true,
  "data": [ ... ]
}
```

Responsável por:

* Resolver slug → organizacao_id
* Listar SKUs ativos
* Retornar dados prontos para vitrine

---

### 2️⃣ Buscar SKU por ID

```
GET /api/public/loja/:slug/sku/:id
```

Criado agora.

Fluxo:

Controller → Service → Repository

Repository realiza:

```sql
JOIN produtos
JOIN organizacoes
WHERE slug = ?
AND ps.id = ?
AND p.ativo = 1
```

Garante:

* Segurança multi-org
* Produto pertence à organização correta
* Produto ativo

---

# 🌍 Multi-Organização

Fluxo aplicado corretamente:

```
slug → organizacoes.id → organizacao_id
```

Nunca recebemos `organizacao_id` do frontend.

---

# 🖥️ Frontend Implementado

## 📁 Estrutura

```
pages/public/
   LojaPublic.jsx
   ProdutoPublic.jsx

components/public/loja/
   ProdutoCard.jsx

hooks/public/
   useLojaSkus.js
   useProdutoPublic.js

services/public/
   lojaPublicService.js
```

Separação correta:

* service → chama API
* hook → controla estado e loading
* page → organiza layout
* component → renderização visual

---

# 🛒 Fluxo Atual da Loja

## 1️⃣ Página Vitrine

Rota:

```
/loja/:slug
```

Comportamento:

* Busca SKUs via hook
* Renderiza grid responsivo
* Cada card é clicável
* Multi-org funcionando

Responsável:
`LojaPublic.jsx`

---

## 2️⃣ Página Produto

Rota:

```
/loja/:slug/produto/:id
```

Comportamento:

* Busca SKU por ID
* Valida slug
* Renderiza:

  * Nome
  * Descrição
  * Preço
  * Badge pronta_entrega
  * Botão Comprar

Responsável:
`ProdutoPublic.jsx`

---

# 🔥 Estado Atual do Sistema

✔ Backend preparado
✔ Endpoints funcionais
✔ Multi-org validado
✔ Integração frontend completa
✔ Grid responsivo
✔ Página de produto funcional
✔ Arquitetura organizada

---

# 🚧 Próxima Fase — Venda Real

Agora entramos na parte operacional.

Segundo o fluxo oficial:

```
Loja → Pedido → Pagamento → Webhook → Consequência
```

---

# 🎯 Próximos Passos Técnicos

## 1️⃣ Adicionar quantidade na página do produto

Campo:

* Input number
* Limite mínimo 1
* Validação estoque (se pronta_entrega)

---

## 2️⃣ Criar Pedido Pendente

Nova rota backend (se ainda não existir):

```
POST /api/public/pedidos/:slug
```

Payload:

```json
{
  "sku_id": 2,
  "quantidade": 1
}
```

Responsável por:

* Criar pedido
* Criar pedido_itens
* Status inicial: pendente_pagamento

---

## 3️⃣ Integrar com módulo Pagamentos

Após criar pedido:

```
POST /api/public/pagamentos/:slug
```

Origem:

```
origem: "loja"
entidade_id: pedido_id
```

---

## 4️⃣ Após pagamento aprovado

Fluxo já existente:

```
processarCobrancaPaga(cobranca_id)
```

Consequências:

* Confirmar pedido
* Baixar estoque
* Enviar e-mails
* Marcar consequencia_executada = true

---

# 🧠 Decisão Arquitetural Importante

Estamos seguindo corretamente:

* Loja não integra gateway
* Pagamentos é núcleo financeiro
* Financeiro é administrativo
* Estoque baixa somente após pagamento
* Idempotência garantida

---

# 🏁 Conclusão

A loja pública saiu de:

```
Placeholder
```

Para:

```
Vitrine real + Página de produto + Backend conectado + Multi-org validado
```

Agora entramos na fase:

> Transformar visual em venda real.

---
