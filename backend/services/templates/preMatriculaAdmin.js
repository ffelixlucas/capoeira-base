// 📧 Template institucional - Nova pré-matrícula (para admin)
function gerarEmailPreMatriculaAdmin(dados) {
    const telefone =
      dados.telefone_aluno || dados.telefone_responsavel || "não informado";
  
    const responsavel = dados.nome_responsavel
      ? `${dados.nome_responsavel} (${dados.responsavel_parentesco || "—"})`
      : "—";
  
    return `
      <h2>Nova pré-matrícula recebida</h2>
      <p>Uma nova pré-matrícula foi enviada e aguarda aprovação:</p>
      <table style="border-collapse: collapse; margin-top: 8px;">
        <tr><td><b>Nome:</b></td><td>${dados.nome}</td></tr>
        <tr><td><b>Apelido:</b></td><td>${dados.apelido || "—"}</td></tr>
        <tr><td><b>CPF:</b></td><td>${dados.cpf}</td></tr>
        <tr><td><b>Email:</b></td><td>${dados.email}</td></tr>
        <tr><td><b>Telefone:</b></td><td>${telefone}</td></tr>
        <tr><td><b>Responsável:</b></td><td>${responsavel}</td></tr>
        <tr><td><b>Endereço:</b></td><td>${dados.endereco || "—"}</td></tr>
        <tr><td><b>Já treinou antes:</b></td><td>${dados.ja_treinou}</td></tr>
        <tr><td><b>Grupo de origem:</b></td><td>${dados.grupo_origem || "—"}</td></tr>
        <tr><td><b>Categoria:</b></td><td>${dados.categoria_id || "—"}</td></tr>
        <tr><td><b>Graduação:</b></td><td>${dados.graduacao_id || "—"}</td></tr>
      </table>
      <p style="margin-top: 10px;">Acesse o painel administrativo para aprovar ou rejeitar a inscrição.</p>
    `;
  }
  
  module.exports = { gerarEmailPreMatriculaAdmin };
  