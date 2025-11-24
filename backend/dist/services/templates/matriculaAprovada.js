// 📧 Template - Matrícula aprovada (para o aluno)
function gerarEmailMatriculaAprovada(dados) {
    const nome = dados.nome?.split(" ")[0] || "Capoeirista";
    const turma = dados.turma_nome || "Turma não informada";
    const dias = dados.dias || "—";
    const horario = dados.horario || "—";
    const professor = dados.professor_nome || "—";
    const funcao = dados.professor_funcao || ""; // vem da tabela equipe.funcao
    const local = dados.local ||
        dados.endereco ||
        "Endereço da organização não informado";
    const instituicao = dados.nome_fantasia || dados.nome_organizacao || "nossa equipe";
    // 🔎 monta texto condicionalmente
    const responsavelTexto = funcao && professor !== "—"
        ? `${funcao} ${professor}`
        : professor !== "—"
            ? professor
            : "—";
    return `
      <div style="font-family:Poppins,Arial,sans-serif;color:#222;line-height:1.6;">
  
        <p>Olá, <b>${nome}</b>! 👋</p>
  
        <p>
          Sua <b>matrícula foi aprovada</b> com sucesso.<br>
        </p>
  
        <h3 style="margin-top:20px;color:#166534;">📅 Informações da sua turma</h3>
        <p>
          <b>Turma:</b> ${turma}<br>
          <b>Dias:</b> ${dias}<br>
          <b>Horário:</b> ${horario}<br>
          <b>Responsável:</b> ${responsavelTexto}<br>
          <b>Local:</b> ${local}
        </p>
  
        <p style="margin-top:25px;font-weight:600;color:#166534;">
           Equipe ${instituicao}
        </p>
      </div>
    `;
}
// 📧 Template - Matrícula aprovada (para o admin)
function gerarEmailMatriculaAprovadaAdmin(dados) {
    const nome = dados.nome || "Aluno não informado";
    const turma = dados.turma_nome || "Turma não informada";
    const dias = dados.dias || "—";
    const horario = dados.horario || "—";
    const professor = dados.professor_nome || "—";
    const funcao = dados.professor_funcao || "";
    const instituicao = dados.nome_fantasia || dados.nome_organizacao || "nossa organização";
    const responsavelTexto = funcao && professor !== "—"
        ? `${funcao} ${professor}`
        : professor !== "—"
            ? professor
            : "—";
    return `
      <div style="font-family:Poppins,Arial,sans-serif;color:#222;line-height:1.6;">
        <h2 style="color:#166534;">Uma nova matrícula foi aprovada na organização <b>${instituicao}</b></h2>
  

        <p>
          <b>Aluno:</b> ${nome}<br>
          <b>Turma:</b> ${turma}<br>
          <b>Dias:</b> ${dias}<br>
          <b>Horário:</b> ${horario}<br>
          <b>Responsável:</b> ${responsavelTexto}
        </p>
  
        <p style="margin-top:25px;font-weight:600;color:#166534;">
          📅 Matrícula registrada com sucesso.
        </p>
      </div>
    `;
}
module.exports = {
    gerarEmailMatriculaAprovada,
    gerarEmailMatriculaAprovadaAdmin,
};
