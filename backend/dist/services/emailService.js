// backend/services/emailService.js
const { Resend } = require("resend");
const logger = require("../utils/logger.js");
const resend = new Resend(process.env.RESEND_API_KEY);
async function enviarEmailConfirmacao(inscricao) {
    const { nome, apelido, email, telefone, cpf, data_nascimento, codigo_inscricao, camiseta_tamanho, restricoes, evento, } = inscricao;
    const html = `
    <div style="font-family: Arial, sans-serif; font-size: 14px; color: #333;">
      <h2>Inscrição confirmada ✅</h2>
      <p>Olá <strong>${nome}</strong>, sua inscrição foi confirmada com sucesso no evento do 
      <strong>Grupo Capoeira Brasil</strong>!</p>

      <h3>📌 Dados do Evento</h3>
      <ul>
        <li><strong>Evento:</strong> ${evento.titulo}</li>
        <li><strong>Data:</strong> ${new Date(evento.data_inicio).toLocaleDateString("pt-BR")} 
          ${evento.data_fim ? " até " + new Date(evento.data_fim).toLocaleDateString("pt-BR") : ""}</li>
        <li><strong>Local:</strong> ${evento.local}</li>
        <li><strong>Endereço:</strong> ${evento.endereco || "-"}</li>
        <li><strong>Código de inscrição:</strong> <code>${codigo_inscricao}</code></li>
      </ul>

      <h3>🧾 Seus Dados</h3>
      <ul>
        <li><strong>Nome:</strong> ${nome}</li>
        ${apelido ? `<li><strong>Apelido:</strong> ${apelido}</li>` : ""}
        <li><strong>Data de nascimento:</strong> ${data_nascimento ? new Date(data_nascimento).toLocaleDateString("pt-BR") : "-"}</li>
        <li><strong>CPF:</strong> ${cpf || "-"}</li>
        <li><strong>E-mail:</strong> ${email}</li>
        <li><strong>Telefone:</strong> ${telefone || "-"}</li>
        ${camiseta_tamanho ? `<li><strong>Tamanho da camiseta:</strong> ${camiseta_tamanho}</li>` : ""}
        ${restricoes ? `<li><strong>Restrições/observações:</strong> ${restricoes}</li>` : ""}
      </ul>

      <p style="margin-top:20px;">
        ⚠️ Guarde este e-mail — o código de inscrição poderá ser solicitado na entrada do evento.
      </p>

      <p style="margin-top:20px; font-size:12px; color:#666;">
        Este é um e-mail automático enviado por <strong>capoeiranota10.com.br</strong>.<br/>
        Caso não reconheça esta inscrição, entre em contato pelo WhatsApp oficial: (41) 99618-9598.
      </p>
    </div>
  `;
    try {
        const to = String(email || "").trim();
        logger.log("📧 Enviando e-mail de confirmação para:", JSON.stringify(to));
        const { data, error } = await resend.emails.send({
            from: "Capoeira Nota10 – Inscrições <contato@capoeiranota10.com.br>",
            to,
            subject: `Inscrição confirmada – ${evento.titulo}`,
            html,
        });
        if (error) {
            logger.error("❌ Falha no envio (Resend):", error);
        }
        else {
            logger.log("✅ E-mail enviado via Resend:", data);
        }
    }
    catch (err) {
        logger.error("❌ Erro inesperado ao enviar e-mail:", err.message);
    }
}
async function enviarEmailExtorno(inscricao) {
    const { nome, apelido, email, telefone, cpf, data_nascimento, codigo_inscricao, evento, refund_valor, } = inscricao;
    const html = `
    <div style="font-family: Arial, sans-serif; font-size: 14px; color: #333;">
      <h2>Estorno realizado 💸</h2>
      <p>Olá <strong>${nome}</strong>, sua inscrição foi <span style="color:red">estornada</span> no evento do 
      <strong>Grupo Capoeira Brasil</strong>.</p>

      <h3>📌 Dados do Evento</h3>
      <ul>
        <li><strong>Evento:</strong> ${evento.titulo}</li>
        <li><strong>Data:</strong> ${new Date(evento.data_inicio).toLocaleDateString("pt-BR")} 
          ${evento.data_fim ? " até " + new Date(evento.data_fim).toLocaleDateString("pt-BR") : ""}</li>
        <li><strong>Local:</strong> ${evento.local}</li>
        <li><strong>Endereço:</strong> ${evento.endereco || "-"}</li>
        <li><strong>Código de inscrição:</strong> <code>${codigo_inscricao}</code></li>
      </ul>

      <h3>💰 Detalhes do Estorno</h3>
      <ul>
        <li><strong>Valor devolvido:</strong> R$ ${Number(refund_valor).toFixed(2)}</li>
        <li><strong>CPF:</strong> ${cpf || "-"}</li>
        <li><strong>E-mail:</strong> ${email}</li>
        <li><strong>Telefone:</strong> ${telefone || "-"}</li>
      </ul>

      <p style="margin-top:20px;">
        ⚠️ O valor pode levar de <strong>3 a 10 dias úteis</strong> para aparecer em sua conta/cartão.
      </p>

      <p style="margin-top:20px; font-size:12px; color:#666;">
        Este é um e-mail automático enviado por <strong>capoeiranota10.com.br</strong>.<br/>
        Caso não reconheça este estorno, entre em contato pelo WhatsApp oficial: (41) 99618-9598.
      </p>
    </div>
  `;
    try {
        const to = String(email || "").trim();
        logger.log("📧 Enviando e-mail de estorno para:", JSON.stringify(to));
        const { data, error } = await resend.emails.send({
            from: "Capoeira Nota10 – Inscrições <contato@capoeiranota10.com.br>",
            to,
            subject: `Estorno da inscrição – ${evento.titulo}`,
            html,
        });
        if (error) {
            logger.error("❌ Falha no envio (Resend):", error);
        }
        else {
            logger.log("✅ E-mail de estorno enviado via Resend:", data);
        }
    }
    catch (err) {
        logger.error("❌ Erro inesperado ao enviar e-mail de estorno:", err.message);
    }
}
async function enviarEmailReset({ email, link }) {
    const html = `
    <div style="font-family: Arial, sans-serif; font-size: 14px; color: #333;">
      <h2>Redefinição de senha 🔑</h2>
      <p>Recebemos um pedido para redefinir sua senha.</p>
      <p>
        Clique no link abaixo para escolher uma nova senha. 
        Este link é válido por 1 hora.
      </p>
      <p><a href="${link}" target="_blank">${link}</a></p>
      <p>Se você não pediu isso, pode ignorar este e-mail.</p>
    </div>
  `;
    try {
        const { data, error } = await resend.emails.send({
            from: "Capoeira Nota10 – Sistema <contato@capoeiranota10.com.br>",
            to: email,
            subject: "Redefinição de senha",
            html,
        });
        if (error) {
            logger.error("❌ Erro no envio de reset:", error);
        }
        else {
            logger.log("✅ E-mail de reset enviado:", data);
        }
    }
    catch (err) {
        logger.error("❌ Erro inesperado no envio de reset:", err.message);
    }
}
async function enviarEmailCustom({ to, subject, html }) {
    try {
        const { data, error } = await resend.emails.send({
            from: "Capoeira Nota10 <contato@capoeiranota10.com.br>",
            to,
            subject,
            html,
        });
        if (error) {
            logger.error("❌ Falha no envio (Resend):", error);
        }
        else {
            logger.log("✅ E-mail custom enviado via Resend:", data);
        }
    }
    catch (err) {
        logger.error("❌ Erro inesperado no envio de e-mail custom:", err.message);
    }
}
async function enviarEmailPendente(inscricao) {
    const { nome, apelido, email, telefone, cpf, data_nascimento, codigo_inscricao, evento, ticket_url, date_of_expiration, } = inscricao;
    const html = `
    <div style="font-family: Arial, sans-serif; font-size: 14px; color: #333;">
      <h2>Inscrição registrada 📝 (aguardando pagamento)</h2>
      <p>Olá <strong>${nome}</strong>, sua inscrição foi registrada no evento do 
      <strong>Grupo Capoeira Brasil</strong>.</p>

      <p style="color: #d9534f;">
        ⚠️ Atenção: sua inscrição só será <strong>confirmada</strong> após o pagamento do boleto.
      </p>

      <h3>📌 Dados do Evento</h3>
      <ul>
        <li><strong>Evento:</strong> ${evento.titulo}</li>
        <li><strong>Data:</strong> ${new Date(evento.data_inicio).toLocaleDateString("pt-BR")} 
          ${evento.data_fim ? " até " + new Date(evento.data_fim).toLocaleDateString("pt-BR") : ""}</li>
        <li><strong>Local:</strong> ${evento.local}</li>
        <li><strong>Endereço:</strong> ${evento.endereco || "-"}</li>
        <li><strong>Código de inscrição:</strong> <code>${codigo_inscricao}</code></li>
      </ul>

      <h3>🧾 Pagamento via Boleto</h3>
      <ul>
        <li><strong>Link do boleto:</strong> <a href="${ticket_url}" target="_blank">Clique aqui para acessar</a></li>
        <li><strong>Vencimento:</strong> ${date_of_expiration ? new Date(date_of_expiration).toLocaleDateString("pt-BR") : "-"}</li>
      </ul>

      <p style="margin-top:20px;">
        Após a compensação do pagamento (até 3 dias úteis), você receberá outro e-mail confirmando sua inscrição ✅.
      </p>

      <p style="margin-top:20px; font-size:12px; color:#666;">
        Este é um e-mail automático enviado por <strong>capoeiranota10.com.br</strong>.<br/>
        Caso não reconheça esta inscrição, entre em contato pelo WhatsApp oficial: (41) 99618-9598.
      </p>
    </div>
  `;
    try {
        const to = String(email || "").trim();
        logger.log("📧 Enviando e-mail de pendência para:", JSON.stringify(to));
        const { data, error } = await resend.emails.send({
            from: "Capoeira Nota10 – Inscrições <contato@capoeiranota10.com.br>",
            to,
            subject: `Inscrição registrada – aguardando pagamento (${evento.titulo})`,
            html,
        });
        if (error) {
            logger.error("❌ Falha no envio (Resend):", error);
        }
        else {
            logger.log("✅ E-mail de pendência enviado via Resend:", data);
        }
    }
    catch (err) {
        logger.error("❌ Erro inesperado ao enviar e-mail de pendência:", err.message);
    }
}
module.exports = {
    enviarEmailConfirmacao,
    enviarEmailExtorno,
    enviarEmailReset,
    enviarEmailCustom,
    enviarEmailPendente,
};
