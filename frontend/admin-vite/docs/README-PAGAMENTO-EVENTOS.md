# 💳 Módulo de Pagamento por PIX em eventos – Capoeira Base

## ✅ Descrição

Este módulo é responsável por gerar cobranças PIX via Mercado Pago para confirmar inscrições em eventos do Capoeira Base. Toda inscrição só é considerada válida após o pagamento confirmado.

---

## 🎯 Objetivo

- Garantir que o usuário possa gerar ou reutilizar um pagamento PIX.
- Corrigir possíveis dados errados antes da confirmação de pagamento.
- Evitar duplicações ou conflitos de dados no banco.
- Manter o processo fluido e sem frustrações para o usuário.

---

## 🔄 Fluxo de Funcionamento

### 1️⃣ Envio do formulário de inscrição pública

- O usuário preenche os dados (nome, camiseta, responsável, etc.).
- O frontend envia os dados completos via `POST /api/public/inscricoes/pagar`.

---

### 2️⃣ Backend detecta se já existe inscrição pendente (via CPF)

- Chamada da função `buscarInscricaoPendente(cpf)`.

#### 🔍 Se já existir:
- O backend **atualiza os dados com os novos valores**:
  - Nome, email, tamanho da camiseta, responsável, etc.
- Reaproveita o QR code, pagamento_id e validade anteriores.
- Retorna o mesmo QR code para o frontend com os **dados corrigidos no banco**.

> ✅ Isso garante que erros na primeira tentativa não sejam mantidos no sistema.

#### 🆕 Se **não existir**:
- Cria uma nova inscrição pendente no banco.
- Gera um pagamento PIX no Mercado Pago.
- Atualiza a inscrição com:
  - `pagamento_id`
  - `ticket_url`
  - `qr_code_base64`
  - `qr_code` (copia e cola)
  - `valor`
  - `date_of_expiration`

---

### 3️⃣ Webhook confirma pagamento

- Quando o Mercado Pago notifica que o pagamento foi **aprovado**:
  - A inscrição é marcada como `status = 'pago'`.
  - O campo `valor` é atualizado.
  - O campo `atualizado_em` é preenchido automaticamente.

---

## 🧪 Testes executados

- Geração de nova inscrição com dados válidos → **QR gerado**
- Preenchimento errado → nova tentativa → **dados corrigidos antes de reaproveitar o QR**
- Após pagamento → status atualizado para `pago`
- Modal mostra o valor + QR code + botão copiar (frontend)

---

## 🚀 Melhorias Futuras

- [ ] Validação de duplicidade por CPF + evento.
- [ ] Notificações por email após pagamento confirmado.
- [ ] Reenvio de boleto/QR por link público.
- [ ] Pagamentos por cartão de crédito (futuro).

---

## 📁 Arquivo

**/docs/README-PAGAMENTO.md**  
**Versão:** 1.0 – **Status:** ✅ Fluxo completo e validado
