 # 📬 Serviço de E-mails – Capoeira Base

## ✅ Objetivo

Centralizar o envio de e-mails automáticos do sistema, começando com a confirmação de inscrição em eventos.

---

## 📂 Localização

`backend/services/emailService.js`

---

## 🚀 Funções implementadas

### `enviarEmailConfirmacao(inscricao)`

Envia um e-mail de confirmação de inscrição após o pagamento aprovado via Mercado Pago.

#### Parâmetros:
```js
{
  nome: string,
  email: string,
  codigo_inscricao: string,
  evento: {
    titulo: string,
    data: string (ISO),
    local: string
  }
}
```

#### Exemplo de uso:
```js
await enviarEmailConfirmacao(inscricao);
```

---

## 🛠️ Tecnologias utilizadas

- [Resend](https://resend.com/) – Serviço externo de envio de e-mails
- Chave configurada via `.env`:
  ```
  RESEND_API_KEY=re_...
  ```

---

## 📬 Remetente atual

Usa remetente padrão da Resend (sem necessidade de domínio próprio):

```js
from: 'Capoeira Base <onboarding@resend.dev>'
```

> ⚠️ Para uso profissional, recomenda-se configurar um domínio customizado no futuro.

---

## 🧪 Logs e tratamento de erros

- **Logs de sucesso foram removidos para ambiente de produção**
- **Logs de erro mantêm apenas a mensagem principal para debug leve:**
  ```js
  logger.error("❌ Falha ao enviar e-mail de confirmação:", err.message);
  ```

---

## 🧩 Integração atual

Este serviço é utilizado no webhook de pagamento:

- `backend/modules/public/inscricoes/inscricoesService.js`
  - Função `processarWebhookService`

---

## ✅ Status

- [x] Implementado e testado com sucesso  
- [x] Funcional em produção  
- [ ] Futuro: envio de e-mail para redefinição de senha  
- [ ] Futuro: e-mails da loja virtual
