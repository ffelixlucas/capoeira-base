// 📧 Template - Pré-Matrícula Recusada (para o aluno)
function gerarEmailMatriculaRecusada(dados) {
    const nome = dados.nome?.split(" ")[0] || "Capoeirista";
    const instituicao = dados.nome_fantasia || dados.nome_organizacao || "nossa equipe";
    const telefone = dados.telefone || "41999999999";
    // Remove caracteres não numéricos do telefone
    const whatsappLink = `https://wa.me/55${telefone.replace(/\D/g, "")}`;
    return `
      <div style="font-family:Poppins,Arial,sans-serif;color:#222;line-height:1.6;">
  
        <p>Olá, <b>${nome}</b>! 👋</p>
  
        <p>
          Agradecemos seu interesse em fazer parte da <b>${instituicao}</b>.
          Após análise da sua pré-matrícula, informamos que, no momento,
          <b>não há vagas disponíveis na categoria informada</b>.
        </p>
  
        <p>
          Caso tenha alguma dúvida ou queira mais informações sobre futuras oportunidades,
          nossa equipe está disponível para atendimento via WhatsApp.
        </p>
  
        <div style="margin-top:20px;">
          <a href="${whatsappLink}" target="_blank"
             style="background-color:#16a34a;color:#fff;text-decoration:none;
                    padding:10px 16px;border-radius:8px;font-weight:600;
                    display:inline-block;">
            💬 Falar com a equipe
          </a>
        </div>
  
        <p style="margin-top:25px;font-weight:600;color:#166534;">
          — Equipe ${instituicao}
        </p>
      </div>
    `;
}
module.exports = { gerarEmailMatriculaRecusada };
