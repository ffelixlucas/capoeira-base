# 📌 README – Módulo de Inscrições de Eventos

## 1️⃣ Descrição e Objetivo
Este módulo permite que qualquer pessoa se inscreva em um evento de capoeira de forma simples e segura, com **pagamento via PIX** integrado ao **Mercado Pago**.  

O fluxo cobre:
- Formulário público para inscrições (adultos e menores de idade).
- Geração automática de cobrança PIX.
- Atualização de status via webhook.
- Confirmação visual imediata (modal) e por e-mail.
- Gestão de inscritos no painel admin.

---

## 2️⃣ Tecnologias Utilizadas
- **Frontend:** React + Vite (mobile-first)
- **Backend:** Node.js + Express
- **Banco de dados:** MySQL (Railway)
- **Pagamentos:** Mercado Pago PIX
- **E-mails:** Resend (via webhook)
- **Storage:** Firebase (imagens dos eventos)

---

## 3️⃣ Componentes e Arquivos Principais
### Frontend
- `InscricaoEventoPublic.jsx` → página do formulário de inscrição.
- `FormInscricaoPublic.jsx` → formulário validado (campos obrigatórios, máscaras, checkboxes).
- `ModalPagamentoPix.jsx` → exibe QR Code e link de pagamento.
- `ModalConfirmacaoPagamento.jsx` → mostra confirmação visual após pagamento aprovado.
- `agendaService.js` → busca eventos disponíveis.
- `inscricoesService.js` → envia inscrições e integra com backend.

### Backend
- `modules/public/inscricoes/inscricoesRoutes.js`
- `inscricoesController.js`
- `inscricoesService.js`
- `inscricoesRepository.js`

---

## 4️⃣ Fluxo de Funcionamento

### **Cadastro e Pagamento**
1. O usuário acessa o formulário público `/inscrever/:eventoId`.
2. Preenche os dados obrigatórios:
   - Adulto: nome, CPF, e-mail, telefone.
   - Menor de idade: dados do inscrito **+ responsável (nome, CPF, contato)**.
3. O backend gera a cobrança PIX:
   - Busca o **valor do evento direto no banco** (`agenda.valor`).
   - Cria a inscrição com status **pendente**.
   - Retorna `ticket_url`, `qr_code` e `codigo_inscricao`.
4. Usuário paga via PIX.
5. O **webhook do Mercado Pago** atualiza a inscrição:
   - `status` → `pago`
   - grava valor líquido (`valor_liquido`)
   - salva dados da transação.
6. O backend dispara **e-mail automático de confirmação** (Resend).
7. O frontend exibe o **Modal de Confirmação** com:
   - Nome do inscrito
   - Evento, data, local
   - Código único de inscrição

---

## 5️⃣ Tabela `inscricoes_evento`

Campos principais:
- `id`
- `evento_id` → chave estrangeira para `agenda`
- `nome`, `cpf`, `email`, `telefone`
- `responsavel_nome`, `responsavel_documento`, `responsavel_contato`
- `status` → `pendente` | `pago`
- `codigo_inscricao` → ex.: `GCB-2025-EVT16-0028`
- `ticket_url`, `qr_code_base64`, `qr_code`
- `pagamento_id`
- `valor` (do evento)
- `valor_liquido` (do Mercado Pago)
- `date_of_expiration`
- `created_at`, `updated_at`

---

## 6️⃣ Regras Especiais

### 🔒 Pagador Menor de Idade
- Inscrição sempre no nome do **aluno**.
- PIX gerado no CPF e nome do **responsável**.
- O **e-mail do pagador** é o mesmo informado no formulário principal (normalmente do responsável).

### 🔎 Validações Backend
- CPF deve ser válido (inscrito ou responsável).
- `valor` precisa ser positivo (checado no banco).
- Consentimentos obrigatórios: LGPD e uso de imagem.
- Impede inscrições duplicadas para o mesmo CPF + evento (se já pago).

### 💰 Valor arrecadado
- Apenas inscrições com `status = pago` contam no cálculo.
- Usa sempre `valor_liquido` retornado pelo Mercado Pago.

---

## 7️⃣ Relação com Página Pública
- Eventos vêm de `/api/public/agenda`.
- Inscrição é feita em `/api/public/inscricoes/pagamento`.
- Webhook recebe confirmações em `/api/public/inscricoes/webhook`.

---

## 8️⃣ Melhorias Futuras
- [ ] Paginação e filtros avançados no admin.
- [ ] Validar código de inscrição no dia do evento (check-in).
- [ ] Campo separado `responsavel_email` (se necessário futuramente).

---

## 9️⃣ Status Atual
✅ Funcional e testado end-to-end:  
- Formulário público → PIX → Webhook → E-mail → Confirmação visual  

