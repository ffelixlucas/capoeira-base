import { Resend } from "resend";
import logger from "../utils/logger";

/**
 * ⚠️ Lazy loading do Resend
 * Só cria a instância quando realmente for enviar um e-mail.
 * Assim, importar este arquivo NÃO quebra o servidor.
 */
function getResend() {
  const apiKey = process.env.RESEND_API_KEY;

  console.log("RESEND_API_KEY dentro do emailService:", apiKey);

  if (!apiKey) {
    logger.warn("[emailService] RESEND_API_KEY ausente — modo desenvolvimento.");
    return null;
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

interface PedidoItem {
  nome_produto: string;
  preco_unitario: number | string;
  quantidade: number | string;
  sku_codigo?: string;
  atributos?: Record<string, string>;
}

interface PedidoBase {
  id: string | number;
  email: string;
  nome_cliente: string;
  itens: PedidoItem[];
  telefone?: string;
  status_operacional?: string;
  convertido_em?: string;
  organizacao_id?: string;
}

interface PedidoCliente extends PedidoBase {}

interface PedidoAdmin extends PedidoBase {
  // campos extras que aparecem só no admin, se houver
}

function calcularTotalItens(itens: PedidoItem[]): number {
  return itens.reduce((acc, item) => {
    const preco = Number(item.preco_unitario) || 0;
    const qtd = Number(item.quantidade) || 0;
    return acc + preco * qtd;
  }, 0);
}

function gerarLinhaItemCliente(item: PedidoItem): string {
  const preco = Number(item.preco_unitario) || 0;
  const qtd = Number(item.quantidade) || 0;
  const subtotal = preco * qtd;

  const atributosStr = item.atributos
    ? Object.entries(item.atributos)
        .map(([k, v]) => `${k}: ${v}`)
        .join(' • ')
    : '';

  return `
    <tr>
      <td style="padding: 12px 0; border-bottom: 1px solid #eee;">
        <strong style="color: #1a1a1a;">${item.nome_produto}</strong><br>
        ${atributosStr ? `<small style="color: #555;">${atributosStr}</small>` : ''}
      </td>
      <td style="padding: 12px 0; text-align: center; border-bottom: 1px solid #eee;">
        ${qtd}
      </td>
      <td style="padding: 12px 0; text-align: right; border-bottom: 1px solid #eee;">
        R$ ${preco.toFixed(2).replace('.', ',')}
      </td>
      <td style="padding: 12px 0; text-align: right; font-weight: 600; border-bottom: 1px solid #eee;">
        R$ ${subtotal.toFixed(2).replace('.', ',')}
      </td>
    </tr>
  `;
}

function gerarLinhaItemAdmin(item: PedidoItem): string {
  const linhaCliente = gerarLinhaItemCliente(item);
  const sku = item.sku_codigo ? `<br><small style="color: #555;">SKU: ${item.sku_codigo}</small>` : '';
  return linhaCliente.replace('</td>', `${sku}</td>`);
}

function gerarEmailHtmlCliente(pedido: PedidoCliente): string {
  const total = calcularTotalItens(pedido.itens);
  const itensHtml = pedido.itens.map(gerarLinhaItemCliente).join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Pedido Confirmado #${pedido.id}</title>
</head>
<body style="margin:0; padding:0; font-family: Arial, Helvetica, sans-serif; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
    <div style="background: #0d47a1; color: white; padding: 24px 32px;">
      <h1 style="margin:0; font-size: 24px;">Pedido Confirmado</h1>
      <p style="margin: 8px 0 0; opacity: 0.9;">#${pedido.id}</p>
    </div>
    
    <div style="padding: 32px;">
      <p style="margin: 0 0 24px; font-size: 16px;">
        Olá <strong>${pedido.nome_cliente}</strong>,
      </p>
      <p style="margin: 0 0 32px; line-height: 1.6;">
        Seu pagamento foi aprovado com sucesso!<br>
        O pedido <strong>#${pedido.id}</strong> já está em processo de separação.
      </p>

      <h3 style="margin: 0 0 16px; color: #1a1a1a; font-size: 18px;">Itens do pedido</h3>
      
      <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
        <thead>
          <tr style="background: #f8f9fa; color: #444;">
            <th style="padding: 12px 16px; text-align: left; font-weight: 600;">Produto</th>
            <th style="padding: 12px; text-align: center; font-weight: 600;">Qtd</th>
            <th style="padding: 12px; text-align: right; font-weight: 600;">Unitário</th>
            <th style="padding: 12px; text-align: right; font-weight: 600;">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${itensHtml}
        </tbody>
      </table>

      <div style="margin-top: 24px; padding-top: 20px; border-top: 2px solid #0d47a1; text-align: right;">
        <span style="font-size: 18px; font-weight: 600; color: #0d47a1;">
          Total pago: R$ ${total.toFixed(2).replace('.', ',')}
        </span>
      </div>

      <div style="margin-top: 32px; font-size: 14px; color: #444; line-height: 1.5;">
        <p style="margin: 0 0 12px;"><strong>Status atual:</strong> Pagamento aprovado</p>
      </div>
    </div>

    <div style="background: #f8f9fa; padding: 24px; text-align: center; font-size: 13px; color: #666; border-top: 1px solid #eee;">
      <p style="margin: 0 0 8px;">Obrigado por comprar com a gente!</p>
      <p style="margin: 0; font-weight: 600; color: #0d47a1;">Capoeira Nota10</p>
    </div>
  </div>
</body>
</html>
  `;
}

async function enviarEmailPedidoCliente({ pedido }: { pedido: PedidoCliente }) {
  const resend = getResend();
  if (!resend) return;

  if (!pedido?.email || !pedido?.itens?.length) {
    // Aqui você pode usar um logger de verdade (Sentry, Logtail, etc)
    console.warn("[email:cliente] Dados insuficientes", { pedidoId: pedido?.id });
    return;
  }

  try {
    const html = gerarEmailHtmlCliente(pedido);

    const { data, error } = await resend.emails.send({
      from: "Capoeira Nota10 <contato@capoeiranota10.com.br>",
      to: pedido.email,
      subject: `Seu pedido foi confirmado – #${pedido.id}`,
      html,
    });

    if (error) throw error;

    console.info("[email:cliente] Enviado com sucesso", {
      pedidoId: pedido.id,
      to: pedido.email,
      resendId: data?.id,
    });
  } catch (err) {
    console.error("[email:cliente] Falha no envio", err);
    // Aqui idealmente reportar erro em observability
  }
}

// ────────────────────────────────────────────────
// Versão ADMIN (similar, mas com mais informações)
// ────────────────────────────────────────────────

function gerarEmailHtmlAdmin(pedido: PedidoAdmin): string {
  const total = calcularTotalItens(pedido.itens);
  const itensHtml = pedido.itens.map(gerarLinhaItemAdmin).join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Novo Pedido #${pedido.id}</title>
</head>
<body style="margin:0; padding:0; font-family: Arial, Helvetica, sans-serif; background:#f5f5f5;">
  <div style="max-width: 680px; margin:20px auto; background:#fff; border-radius:8px; box-shadow:0 2px 12px rgba(0,0,0,0.1);">
    <div style="background:#c62828; color:white; padding:28px 36px;">
      <h1 style="margin:0; font-size:26px;">Novo Pedido Recebido</h1>
      <p style="margin:8px 0 0; font-size:18px; opacity:0.95;">#${pedido.id}</p>
    </div>

    <div style="padding:36px;">
      <h3 style="margin:0 0 16px; color:#c62828;">Cliente</h3>
      <div style="margin-bottom:32px; line-height:1.7;">
        <strong>${pedido.nome_cliente}</strong><br>
        ${pedido.email}<br>
        ${pedido.telefone || '—'}
      </div>

      <h3 style="margin:0 0 16px; color:#1a1a1a;">Itens para separação</h3>

      <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
        <thead>
          <tr style="background:#f8f9fa;">
            <th style="padding:12px 16px; text-align:left; font-weight:600;">Produto / SKU</th>
            <th style="padding:12px; text-align:center; font-weight:600;">Qtd</th>
            <th style="padding:12px; text-align:right; font-weight:600;">Unit.</th>
            <th style="padding:12px; text-align:right; font-weight:600;">Subtotal</th>
          </tr>
        </thead>
        <tbody>${itensHtml}</tbody>
      </table>

      <div style="margin:32px 0; text-align:right; font-size:20px; font-weight:700; color:#c62828;">
        Total: R$ ${total.toFixed(2).replace('.', ',')}
      </div>

      <div style="background:#fff8e1; padding:20px; border-radius:6px; margin:24px 0;">
        <strong>Instruções operacionais:</strong><br>
        → Separar os itens listados acima<br>
        → Atualizar status para <strong>pronto_retirada</strong> após conferência
      </div>

      <div style="font-size:13px; color:#555; margin-top:24px;">
        Confirmado em: ${pedido.convertido_em
          ? new Date(pedido.convertido_em).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })
          : '—'}
        <br>Organização: ${pedido.organizacao_id || '—'}
      </div>
    </div>
  </div>
</body>
</html>
  `;
}

async function enviarEmailPedidoAdmin({
  pedido,
  emailDestino,
}: {
  pedido: PedidoAdmin;
  emailDestino: string;
}) {
  const resend = getResend();
  if (!resend || !emailDestino) return;

  try {
    const html = gerarEmailHtmlAdmin(pedido);

    const { data, error } = await resend.emails.send({
      from: "Capoeira Nota10 <contato@capoeiranota10.com.br>",
      to: emailDestino,
      subject: `Novo pedido recebido – #${pedido.id}`,
      html,
      replyTo: pedido.email, // permite responder direto pro cliente
    });

    if (error) throw error;

    console.info("[email:admin] Enviado com sucesso", {
      pedidoId: pedido.id,
      to: emailDestino,
      resendId: data?.id,
    });
  } catch (err) {
    console.error("[email:admin] Falha no envio", err);
  }
}

interface PedidoBase {
  id: string | number;
  nome_cliente: string;
  email: string;
  // Campos opcionais que podem vir a ser úteis
  local_retirada?: string;          // ex: "Loja Centro - Rua XV de Novembro, 123"
  endereco_retirada?: string;
  prazo_retirada_dias?: number;     // ex: 7
  // ... outros campos existentes
}

function gerarEmailHtmlProntoRetirada(
  pedido: PedidoBase,
  agendaTexto?: string,
  enderecoRetirada?: string,
  whatsappContato?: string
): string {

  const mensagem = encodeURIComponent(
    `Olá! Meu pedido #${pedido.id} está pronto para retirada`
  );
  return `

  
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pedido pronto para retirada</title>
</head>
<body style="margin:0;padding:0;background:#f4f6f8;font-family:Arial,Helvetica,sans-serif;color:#333;">
  
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:30px 0;">
    <tr>
      <td align="center">
        
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 6px 18px rgba(0,0,0,0.06);">
          
          <!-- HEADER -->
          <tr>
            <td style="background:#111827;padding:30px;text-align:center;color:#ffffff;">
              <h1 style="margin:0;font-size:22px;font-weight:600;">
                Pedido pronto para retirada 🎉
              </h1>
              <p style="margin:10px 0 0;font-size:14px;opacity:0.8;">
                Pedido #${pedido.id}
              </p>
            </td>
          </tr>

          <!-- BODY -->
          <tr>
            <td style="padding:30px;font-size:15px;line-height:1.6;">
              
              <p style="margin-top:0;">
                Olá <strong>${pedido.nome_cliente}</strong>,
              </p>

              <p>
                Seu pedido <strong>#${pedido.id}</strong> já está separado e disponível para retirada.
              </p>

              ${
                agendaTexto
                  ? `
                  <div style="margin:25px 0;padding:18px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;">
                    <strong style="display:block;margin-bottom:8px;">
                      Horários disponíveis:
                    </strong>
                    <div style="color:#374151;">
                      ${agendaTexto}
                    </div>
                  </div>
                `
                  : ""
              }

              ${
                enderecoRetirada
                  ? `
                  <div style="margin:20px 0;">
                    <strong>Local de retirada:</strong><br>
                    <span style="color:#4b5563;">
                      ${enderecoRetirada}
                    </span>
                  </div>
                `
                  : ""
              }

        
              ${
                whatsappContato
                  ? `
                  <div style="margin:30px 0;text-align:center;">
                  <a 
                    href="https://wa.me/${whatsappContato}?text=${mensagem}"
                    style="display:inline-block;background:#25D366;color:#ffffff;padding:14px 28px;border-radius:30px;text-decoration:none;font-weight:600;font-size:15px;"
                  >
                    Falar com a equipe no WhatsApp
                  </a>

                  </div>
                `
                  : ""
              }

              <p style="margin-top:30px;color:#6b7280;font-size:13px;">
                Em caso de dúvidas, estamos à disposição.
              </p>

            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background:#f9fafb;padding:20px;text-align:center;font-size:12px;color:#9ca3af;">
              © ${new Date().getFullYear()} Capoeira Base  
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>
  `;
}



async function enviarEmailPedidoProntoRetirada({
  pedido,
  agendaTexto,
  enderecoRetirada,
  whatsappContato,
}: {
  pedido: PedidoBase;
  agendaTexto?: string;
  enderecoRetirada?: string;
  whatsappContato?: string;
})
 {
  const resend = getResend();
  if (!resend) {
    console.warn("[email:pronto] Resend não inicializado");
    return;
  }

  if (!pedido?.email) {
    console.warn("[email:pronto] Email do cliente ausente", { pedidoId: pedido?.id });
    return;
  }

  try {
    const html = gerarEmailHtmlProntoRetirada(pedido, agendaTexto, enderecoRetirada, whatsappContato);

    const { data, error } = await resend.emails.send({
      from: "Capoeira Nota10 <contato@capoeiranota10.com.br>",
      to: pedido.email,
      subject: `Seu pedido #${pedido.id} está pronto para retirada!`,
      html,
      replyTo: "contato@capoeiranota10.com.br", // facilita respostas
    });

    if (error) throw error;

    console.info("[email:pronto] Enviado com sucesso", {
      pedidoId: pedido.id,
      to: pedido.email,
      resendId: data?.id,
    });
  } catch (err) {
    console.error("[email:pronto] Falha ao enviar email", {
      pedidoId: pedido.id,
      error: err,
    });
    // Opcional: reportar erro em ferramenta de observability (Sentry, etc.)
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
  enviarEmailPedidoCliente,
  enviarEmailPedidoAdmin,
  enviarEmailPedidoProntoRetirada,
  enviarEmailPendente,
};
