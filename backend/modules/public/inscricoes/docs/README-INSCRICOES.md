# 📌 Módulo de Inscrições Públicas

## 1️⃣ Descrição e objetivo

Este módulo gerencia as **inscrições públicas de eventos**, permitindo que qualquer usuário preencha o formulário online, gere um pagamento via PIX (Mercado Pago) e tenha a inscrição confirmada apenas após a compensação do pagamento.

---

## 2️⃣ Tecnologias utilizadas

- **Node.js + Express**
- **MySQL** (tabela `inscricoes_evento`)
- **Mercado Pago SDK** para criação de QR Code PIX e webhooks
- **Cron jobs** para limpar inscrições pendentes expiradas

---

## 3️⃣ Estrutura de arquivos

/inscricoes
├── docs/README-INSCRICOES.md # Documentação do módulo
├── inscricoesController.js # Controller das rotas
├── inscricoesRoutes.js # Rotas públicas
├── inscricoesRepository.js # Acesso ao banco de dados
└── inscricoesService.js # Regras de negócio

yaml
Copiar
Editar

---

## 4️⃣ Fluxo de funcionamento

### **Cadastro e Pagamento**

1. O usuário acessa o formulário público `/inscrever/:eventoId` no frontend.
2. O formulário é enviado para a rota `POST /api/public/inscricoes/pagamento-pix`.
3. O **Service**:
   - Verifica se já existe uma inscrição pendente para o **CPF** informado.
     - Se sim: retorna o mesmo QR Code gerado anteriormente.
     - Se não: cria um registro com status **pendente**, chama a API do Mercado Pago e retorna o QR Code e ticket URL.
4. O usuário paga via PIX.
5. O **Webhook** do Mercado Pago (`POST /api/public/inscricoes/webhook`) recebe a confirmação e:
   - Atualiza a inscrição para **pago**.
   - Salva o valor do pagamento no banco.

---

## 5️⃣ Tabela `inscricoes_evento`

Campos principais:
- **status**: `pendente` ou `pago`
- **date_of_expiration**: usado para expirar QR Codes antigos
- **pagamento_id**, **ticket_url**, **qr_code_base64**: dados do PIX

---

## 6️⃣ Limpeza automática de pendências

- Script: **`modules/scripts/limparPendentes.js`**
- Deleta inscrições com `status = 'pendente'` e `date_of_expiration < NOW()`.
- Pode ser configurado no Railway via **Cron Schedule** (`0 0 * * *` - todos os dias à meia-noite).

---

## 7️⃣ Melhorias futuras

- [ ] Enviar **e-mail de confirmação** após pagamento aprovado.
- [ ] Implementar paginação e filtros no admin para visualizar inscritos.
- [ ] Reprocessar inscrições pendentes expiradas (se necessário).

---

## 8️⃣ Status atual

✅ Módulo finalizado, integrado ao Mercado Pago e testado com pagamentos reais.