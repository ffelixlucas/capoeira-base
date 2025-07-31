# 🧹 Módulo: limparPendentes – Remoção de inscrições expiradas

## **1️⃣ Objetivo**

Este script é responsável por **remover automaticamente** as inscrições de eventos com status `pendente` cujo QR Code do pagamento (Pix) já expirou.  
- Evita acúmulo de registros inválidos.  
- Mantém o banco de dados limpo e consistente.  

---

## **2️⃣ Localização**

O script está localizado em:  
```
/backend/modules/scripts/limparPendentes.js
```

---

## **3️⃣ Lógica**

O script conecta no banco de dados e executa a seguinte query:  

```sql
DELETE FROM inscricoes_evento 
WHERE status = 'pendente' 
AND date_of_expiration < NOW();
```

- **status = 'pendente'** → apenas inscrições que não foram pagas.  
- **date_of_expiration < NOW()** → apenas registros já vencidos.  

---

## **4️⃣ Configuração no Railway (CRON)**

Criamos um serviço separado no Railway para executar esse script automaticamente:  

1. **Build Command:**  
   ```
   npm ci
   ```

2. **Start Command:**  
   ```
   node modules/scripts/limparPendentes.js
   ```

3. **Cron Schedule:**  
   ```
   0 0 * * *
   ```
   - Executa **todos os dias à meia-noite (UTC)**.  

4. **Restart Policy:**  
   - **Never** (não reinicia, pois o container finaliza após rodar o script).  

---

## **5️⃣ Teste configurado**

Para testar o cron:  

1. Inserimos manualmente uma inscrição pendente com `date_of_expiration` retroativo (ex: 30/07).  
   ```sql
   INSERT INTO inscricoes_evento (..., status, date_of_expiration)
   VALUES ('pendente', '2025-07-30 12:00:00');
   ```

2. Quando o cron executar, essa inscrição deverá ser **removida automaticamente**.  

3. Validar com:  
   ```sql
   SELECT * FROM inscricoes_evento WHERE status = 'pendente';
   ```
   - O registro expirado **não deve mais aparecer**.  

---

## **6️⃣ Log esperado**

Quando executado manualmente:  
```bash
node modules/scripts/limparPendentes.js
```

Exemplo de retorno no log:  
```
🗑️ 1 inscrições pendentes expiradas foram deletadas.
```