// backend/services/emailService.js
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

async function enviarEmailConfirmacao(inscricao) {
  const { nome, email, codigo_inscricao, evento } = inscricao;

  const html = `
    <div style="font-family: Arial, sans-serif; font-size: 14px; color: #333;">
      <h2>Inscrição confirmada ✅</h2>
      <p>Olá <strong>${nome}</strong>, sua inscrição está confirmada com sucesso no evento:</p>
      <ul>
        <li><strong>Evento:</strong> ${evento.titulo}</li>
        <li><strong>Data:</strong> ${new Date(evento.data).toLocaleDateString('pt-BR')}</li>
        <li><strong>Local:</strong> ${evento.local}</li>
        <li><strong>Código de inscrição:</strong> <code>${codigo_inscricao}</code></li>
      </ul>
      <p>Guarde este código para validar sua participação no evento.</p>
      <p>Axé,<br />Equipe Capoeira Base</p>
    </div>
  `;

  try {
    await resend.emails.send({
      from: 'Capoeira Base <onboarding@resend.dev>',
      to: email,
      subject: 'Inscrição confirmada com sucesso!',
      html,
    });
  } catch (err) {
    console.error("❌ Falha ao enviar e-mail de confirmação:", err.message);
  }
  
}

module.exports = { enviarEmailConfirmacao };
