import { Resend } from "resend";
import logger from "../utils/logger";

/**
 * ⚠️ Lazy loading do Resend
 * Só cria a instância quando realmente for enviar um e-mail.
 * Assim, importar este arquivo NÃO quebra o servidor.
 */
function getResend() {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    logger.warn("[emailService] RESEND_API_KEY ausente — modo desenvolvimento.");
    return null; // evita crash
  }

  return new Resend(apiKey);
}

type Evento = {
  titulo: string;
  data_inicio: string | Date;
  data_fim?: string | Date | null;
  local?: string | null;
  endereco?: string | null;
};

type Inscricao = {
  nome: string;
  apelido?: string | null;
  email: string;
  telefone?: string | null;
  cpf?: string | null;
  data_nascimento?: string | Date | null;
  codigo_inscricao: string;
  camiseta_tamanho?: string | null;
  restricoes?: string | null;
  evento: Evento;
  refund_valor?: number | string;
  ticket_url?: string;
  date_of_expiration?: string | Date | null;
};

function safe(to: string | undefined | null): string {
  return String(to || "").trim();
}

async function enviarEmailConfirmacao(inscricao: Inscricao) {
  const resend = getResend();
  if (!resend) return;

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
      <p>Olá <strong>${nome}</strong>, sua inscrição foi confirmada!</p>

      <h3>📌 Evento</h3>
      <ul>
        <li><strong>Evento:</strong> ${evento.titulo}</li>
        <li><strong>Data:</strong> ${new Date(evento.data_inicio).toLocaleDateString("pt-BR")}
          ${
            evento.data_fim
              ? " até " + new Date(evento.data_fim).toLocaleDateString("pt-BR")
              : ""
          }
        </li>
        <li><strong>Local:</strong> ${evento.local || "-"}</li>
        <li><strong>Endereço:</strong> ${evento.endereco || "-"}</li>
        <li><strong>Código:</strong> <code>${codigo_inscricao}</code></li>
      </ul>

      <h3>🧾 Seus Dados</h3>
      <ul>
        <li><strong>Nome:</strong> ${nome}</li>
        ${apelido ? `<li><strong>Apelido:</strong> ${apelido}</li>` : ""}
        <li><strong>Nascimento:</strong> ${
          data_nascimento
            ? new Date(data_nascimento).toLocaleDateString("pt-BR")
            : "-"
        }</li>
        <li><strong>CPF:</strong> ${cpf || "-"}</li>
        <li><strong>E-mail:</strong> ${email}</li>
        <li><strong>Telefone:</strong> ${telefone || "-"}</li>
        ${
          camiseta_tamanho
            ? `<li><strong>Tamanho da camiseta:</strong> ${camiseta_tamanho}</li>`
            : ""
        }
        ${restricoes ? `<li><strong>Restrições:</strong> ${restricoes}</li>` : ""}
      </ul>
    </div>
  `;

  try {
    const to = safe(email);

    logger.log("📧 Enviando e-mail de confirmação para:", to);

    const { data, error } = await resend.emails.send({
      from: "Capoeira Nota10 – Inscrições <contato@capoeiranota10.com.br>",
      to,
      subject: `Inscrição confirmada – ${evento.titulo}`,
      html,
    });

    if (error) logger.error("❌ Falha no envio (Resend):", error);
    else logger.log("✅ E-mail enviado via Resend:", data);
  } catch (err: any) {
    logger.error("❌ Erro inesperado ao enviar e-mail:", err.message);
  }
}

async function enviarEmailExtorno(inscricao: Inscricao) {
  const resend = getResend();
  if (!resend) return;

  const {
    nome,
    email,
    cpf,
    telefone,
    codigo_inscricao,
    evento,
    refund_valor,
  } = inscricao;

  const html = `
    <div style="font-family: Arial, sans-serif; font-size: 14px; color: #333;">
      <h2>Estorno realizado 💸</h2>
      <p>Olá <strong>${nome}</strong>, sua inscrição foi estornada.</p>

      <h3>📌 Evento</h3>
      <ul>
        <li><strong>Evento:</strong> ${evento.titulo}</li>
        <li><strong>Data:</strong> ${new Date(evento.data_inicio).toLocaleDateString("pt-BR")}</li>
      </ul>

      <h3>💰 Estorno</h3>
      <ul>
        <li><strong>Valor devolvido:</strong> R$ ${Number(refund_valor).toFixed(2)}</li>
        <li><strong>CPF:</strong> ${cpf || "-"}</li>
        <li><strong>E-mail:</strong> ${email}</li>
        <li><strong>Telefone:</strong> ${telefone || "-"}</li>
        <li><strong>Código de inscrição:</strong> ${codigo_inscricao}</li>
      </ul>
    </div>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: "Capoeira Nota10 – Inscrições <contato@capoeiranota10.com.br>",
      to: email,
      subject: `Estorno da inscrição – ${evento.titulo}`,
      html,
    });

    if (error) logger.error("❌ Falha no envio:", error);
    else logger.log("✅ E-mail enviado:", data);
  } catch (err: any) {
    logger.error("❌ Erro inesperado:", err.message);
  }
}

async function enviarEmailReset({ email, link }: { email: string; link: string }) {
  const resend = getResend();
  if (!resend) return;

  const html = `
    <div style="font-family: Arial, sans-serif; font-size: 14px; color: #333;">
      <h2>Redefinição de senha 🔑</h2>
      <p>Clique abaixo para redefinir sua senha.</p>
      <p><a href="${link}" target="_blank">${link}</a></p>
    </div>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: "Capoeira Nota10 – Sistema <contato@capoeiranota10.com.br>",
      to: email,
      subject: "Redefinição de senha",
      html,
    });

    if (error) logger.error("❌ Erro no envio de reset:", error);
    else logger.log("✅ Reset enviado:", data);
  } catch (err: any) {
    logger.error("❌ Erro inesperado:", err.message);
  }
}

async function enviarEmailCustom({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  const resend = getResend();
  if (!resend) return;

  try {
    const { data, error } = await resend.emails.send({
      from: "Capoeira Nota10 <contato@capoeiranota10.com.br>",
      to,
      subject,
      html,
    });

    if (error) logger.error("❌ Falha no envio custom:", error);
    else logger.log("✅ Custom enviado:", data);
  } catch (err: any) {
    logger.error("❌ Erro inesperado:", err.message);
  }
}

async function enviarEmailPendente(inscricao: Inscricao) {
  const resend = getResend();
  if (!resend) return;

  const {
    nome,
    email,
    cpf,
    telefone,
    codigo_inscricao,
    evento,
    ticket_url,
    date_of_expiration,
  } = inscricao;

  const html = `
    <div style="font-family: Arial, sans-serif; font-size: 14px; color: #333;">
      <h2>Inscrição registrada 📝</h2>
      <p>Aguardando pagamento.</p>

      <h3>📌 Evento</h3>
      <ul>
        <li><strong>${evento.titulo}</strong></li>
        <li><strong>Data:</strong> ${new Date(evento.data_inicio).toLocaleDateString("pt-BR")}</li>
      </ul>

      <h3>Boleto</h3>
      <ul>
        <li><a href="${ticket_url}" target="_blank">Abrir boleto</a></li>
        <li><strong>Vencimento:</strong> ${
          date_of_expiration
            ? new Date(date_of_expiration).toLocaleDateString("pt-BR")
            : "-"
        }</li>
      </ul>
    </div>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: "Capoeira Nota10 – Inscrições <contato@capoeiranota10.com.br>",
      to: email,
      subject: `Inscrição registrada – ${evento.titulo}`,
      html,
    });

    if (error) logger.error("❌ Falha no envio pendente:", error);
    else logger.log("✅ Pendente enviado:", data);
  } catch (err: any) {
    logger.error("❌ Erro inesperado:", err.message);
  }
}

export default {
  enviarEmailConfirmacao,
  enviarEmailExtorno,
  enviarEmailReset,
  enviarEmailCustom,
  enviarEmailPendente,
};
