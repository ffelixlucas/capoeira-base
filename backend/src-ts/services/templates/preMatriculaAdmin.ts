export interface DadosPreMatriculaAdmin {
    nome: string;
    apelido?: string | null;
    cpf: string;
    email: string;
    telefone_aluno?: string | null;
    telefone_responsavel?: string | null;
    categoria_nome?: string | null;
    categoria_id?: number | null;
    graduacao_nome?: string | null;
    graduacao_id?: number | null;
    nome_responsavel?: string | null;
    responsavel_parentesco?: string | null;
    endereco?: string | null;
    ja_treinou: string;
    grupo_origem?: string | null;
  }
  
  /**
   * Template HTML enviado ao administrador quando chega uma nova pré-matrícula.
   */
  export function gerarEmailPreMatriculaAdmin(
    dados: DadosPreMatriculaAdmin
  ): string {
    const telefone =
      dados.telefone_aluno ||
      dados.telefone_responsavel ||
      "não informado";
  
    const categoria =
      dados.categoria_nome ||
      dados.categoria_id ||
      "não informada";
  
    const graduacao =
      dados.graduacao_nome ||
      dados.graduacao_id ||
      "não informada";
  
    const apelido =
      dados.apelido?.trim() ? dados.apelido : "Não informado";
  
    const grupoOrigem = dados.grupo_origem?.trim()
      ? `<tr><td><b>Grupo de origem:</b></td><td>${dados.grupo_origem}</td></tr>`
      : "";
  
    const responsavel = dados.nome_responsavel
      ? `<tr><td><b>Responsável:</b></td><td>${dados.nome_responsavel} (${dados.responsavel_parentesco || "—"})</td></tr>`
      : "";
  
    return `
      <h2 style="font-family: Arial, sans-serif; color: #333;">
        Nova pré-matrícula recebida
      </h2>
  
      <p style="font-family: Arial, sans-serif; color: #444;">
        Uma nova pré-matrícula foi enviada e aguarda aprovação.
      </p>
  
      <table style="border-collapse: collapse; margin-top: 8px; font-family: Arial, sans-serif; color: #333;">
        <tr>
          <td><b>Categoria:</b></td>
          <td style="color: #ff7a00; font-weight: bold;">${categoria}</td>
        </tr>
  
        <tr><td><b>Nome:</b></td><td>${dados.nome}</td></tr>
  
        <tr><td><b>Apelido:</b></td><td>${apelido}</td></tr>
  
        <tr><td><b>CPF:</b></td><td>${dados.cpf}</td></tr>
  
        <tr><td><b>Email:</b></td><td>${dados.email}</td></tr>
  
        <tr><td><b>Telefone:</b></td><td>${telefone}</td></tr>
  
        ${responsavel}
  
        <tr><td><b>Endereço:</b></td><td>${dados.endereco || "—"}</td></tr>
  
        <tr><td><b>Já treinou antes:</b></td><td>${dados.ja_treinou}</td></tr>
  
        ${grupoOrigem}
  
        <tr><td><b>Graduação:</b></td><td>${graduacao}</td></tr>
      </table>
  
      <p style="margin-top: 10px; font-family: Arial, sans-serif; color: #444;">
        Acesse o painel administrativo para aprovar ou rejeitar a inscrição.
      </p>
    `;
  }
  
  export default { gerarEmailPreMatriculaAdmin };
  