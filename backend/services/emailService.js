// backend/services/emailService.js
const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

async function enviarEmailConfirmacao(inscricao) {
  const {
    nome,
    apelido,
    email,
    telefone,
    cpf,
    data_nascimento,
    codigo_inscricao,
    camiseta_tamanho,
    restricoes,
    evento,
  } = inscricao;

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

      <p>Axé,<br />Organização do evento<br /><strong>Grupo Capoeira Brasil</strong></p>
    </div>
  `;

  try {
    await resend.emails.send({
      from: "Grupo Capoeira Brasil <onboarding@resend.dev>",
      to: email,
      subject: `Inscrição confirmada – ${evento.titulo}`,
      html,
    });
  } catch (err) {
    console.error("❌ Falha ao enviar e-mail de confirmação:", err.message);
  }
}

module.exports = { enviarEmailConfirmacao };
