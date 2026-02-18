# 📦 DOCUMENTAÇÃO OFICIAL DEFINITIVA — LOJA CAPOEIRA BASE
## Estrutura Real do Banco + Relacionamentos + Fluxo Completo

---

# 🎯 OBJETIVO

Este documento descreve EXATAMENTE:

- Todas as tabelas envolvidas na Loja
- Todas as colunas relevantes
- Todas as chaves estrangeiras (FK)
- Regras de ON DELETE
- Fluxo completo de produto até pagamento
- Ordem correta de criação e limpeza

Documento definitivo para continuidade futura.

---

# 🧱 VISÃO GERAL DO FLUXO

Produto → SKU → Estoque → Pedido → Itens → Cobrança → Baixa Estoque → Movimentação → Financeiro

---

# 🏢 TABELA: organizacoes

Campos principais:
- id (INT, PK, AUTO_INCREMENT)
- nome
- slug (UNIQUE)
- status
- plano

Relacionamentos:
- 1 organização → N produtos
- 1 organização → N pedidos
- 1 organização → N cobranças
- 1 organização → N estoques

---

# 🛍 TABELA: produtos

Campos:
- id (BIGINT, PK)
- organizacao_id (INT, FK → organizacoes.id ON DELETE CASCADE)
- nome
- descricao
- categoria
- ativo
- created_at
- updated_at

Relacionamento:
- 1 produto → N produtos_skus

---

# 🧩 TABELA: produtos_skus

Campos:
- id (BIGINT, PK)
- organizacao_id (BIGINT)
- produto_id (BIGINT, FK → produtos.id ON DELETE CASCADE)
- sku_codigo (UNIQUE por organização)
- preco
- atributos (JSON)
- pronta_entrega
- encomenda
- ativo
- created_at
- updated_at

Relacionamentos:
- 1 SKU → 1 produto
- 1 SKU → 1 estoque
- 1 SKU → N pedido_itens
- 1 SKU → N estoque_movimentacoes

---

# 📦 TABELA: estoque

Campos:
- id (BIGINT, PK)
- organizacao_id (BIGINT)
- sku_id (BIGINT, FK → produtos_skus.id ON DELETE CASCADE)
- quantidade
- quantidade_minima
- created_at
- updated_at

Regras:
- UNIQUE (organizacao_id, sku_id)
- Nunca permitir estoque negativo (regra de aplicação)

---

# 🔁 TABELA: estoque_movimentacoes

Campos:
- id (BIGINT, PK)
- organizacao_id (INT, FK → organizacoes.id)
- sku_id (BIGINT, FK → produtos_skus.id)
- pedido_id (BIGINT, FK → pedidos.id)
- tipo ('entrada','saida')
- quantidade
- origem ('loja')
- created_at

Função:
- Histórico auditável
- Permite estorno futuro

---

# 🧾 TABELA: pedidos

Campos:
- id (BIGINT, PK)
- organizacao_id (INT, FK → organizacoes.id ON DELETE CASCADE)
- status ('aberto','convertido','cancelado')
- status_operacional
- criado_em
- convertido_em
- nome_cliente
- telefone
- email

Relacionamentos:
- 1 pedido → N pedido_itens
- 1 pedido → 1 cobrança
- 1 pedido → N estoque_movimentacoes

---

# 📄 TABELA: pedido_itens

Campos:
- id (BIGINT, PK)
- organizacao_id (INT, FK → organizacoes.id ON DELETE CASCADE)
- pedido_id (BIGINT, FK → pedidos.id ON DELETE CASCADE)
- sku_id (BIGINT, FK → produtos_skus.id ON DELETE RESTRICT)
- quantidade
- preco_unitario
- criado_em

Relacionamentos:
- N itens → 1 pedido
- N itens → 1 SKU

---

# 💳 TABELA: pagamentos_cobrancas

Campos:
- id (BIGINT, PK)
- organizacao_id (INT, FK → organizacoes.id ON DELETE CASCADE)
- origem ('loja')
- entidade_id (BIGINT, FK → pedidos.id ON DELETE RESTRICT)
- nome_pagador
- cpf
- telefone
- email
- valor_total
- status ('pendente','pago','rejeitado','cancelado')
- pagamento_id
- metodo_pagamento
- valor_bruto
- valor_liquido
- taxa_valor
- taxa_percentual
- consequencia_executada
- created_at

Função:
- Controla pagamento
- Dispara consequência única

---

# 🏦 TABELA: financeiro_cobrancas

Função:
- Controle contábil
- Relatórios financeiros

Relacionamento lógico:
- 1 pagamento → 1 registro financeiro

---

# 🔄 FLUXO COMPLETO OFICIAL

1. Produto criado
2. SKU criado
3. Estoque criado
4. Cliente cria pedido (status = aberto)
5. Sistema cria cobrança (pagamentos_cobrancas)
6. Webhook confirma pagamento
7. processarCobrancaPaga executa:
   - converterPedidoPorId
   - baixarEstoquePorPedido (TRANSACTION)
   - criar estoque_movimentacoes
   - registrar financeiro
8. pedido.status = convertido
9. consequencia_executada = 1

---

# 🧨 ORDEM CORRETA PARA LIMPAR BANCO

1. estoque_movimentacoes
2. pedido_itens
3. pagamentos_cobrancas
4. financeiro_cobrancas
5. pedidos
6. estoque
7. produtos_skus
8. produtos

---

# 🧱 ORDEM CORRETA PARA CRIAR TABELAS

1. organizacoes
2. produtos
3. produtos_skus
4. estoque
5. pedidos
6. pedido_itens
7. pagamentos_cobrancas
8. financeiro_cobrancas
9. estoque_movimentacoes

---

# 🔐 REGRAS CRÍTICAS

- Sempre validar estoque antes de converter pedido
- Nunca permitir estoque negativo
- Sempre usar TRANSACTION ao baixar estoque
- Nunca executar consequência duas vezes
- Multi-organização protegida por FK real
- Não permitir exclusão de pedido com pagamento existente

---

Status: Estrutura Blindada — Loja v2 Oficial

Documento definitivo para continuidade futura.

