// 📧 Template - Pré-matrícula recebida (para o aluno)
function gerarEmailPreMatriculaAluno(dados) {
  const nome = dados.nome?.split(" ")[0] || "Capoeirista";
  const instituicao =
    dados.nome_fantasia || dados.nome_organizacao || "nossa equipe";

  return `
      <div style="font-family: Poppins, Arial, sans-serif; color: #222; line-height: 1.6;">
        <h2 style="color:#166534; font-weight:600;">📩 Pré-matrícula recebida – estamos quase lá!</h2>
        <p>Olá, <b>${nome}</b>! 👋</p>
  
        <p>
          Recebemos sua <b>pré-matrícula</b> com sucesso.<br>
          Ela está <b>aguardando aprovação</b> da nossa equipe.
        </p>
  
        <p>
          Assim que for aprovada, você receberá um novo e-mail de confirmação.
        </p>
  
        <p style="margin-top:20px; font-weight:600; color:#166534;">
            💚 Equipe ${dados.nome_fantasia}
        </p>

      </div>
    `;
}

module.exports = { gerarEmailPreMatriculaAluno };
