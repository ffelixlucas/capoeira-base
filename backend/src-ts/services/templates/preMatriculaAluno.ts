export interface DadosPreMatriculaAluno {
    nome: string;
    nome_fantasia?: string | null;
    nome_organizacao?: string | null;
  }
  
  /**
   * Template HTML enviado ao aluno após o envio da pré-matrícula.
   */
  export function gerarEmailPreMatriculaAluno(
    dados: DadosPreMatriculaAluno
  ): string {
    const primeiroNome = dados.nome?.split(" ")[0] || "Capoeirista";
    const instituicao =
      dados.nome_fantasia ||
      dados.nome_organizacao ||
      "nossa equipe";
  
    return `
      <div style="font-family: Poppins, Arial, sans-serif; color: #222; line-height: 1.6;">
        <p>Olá, <b>${primeiroNome}</b>.</p>
  
        <p>
          Sua pré-matrícula foi registrada com sucesso e está aguardando análise da equipe.
        </p>
  
        <p>
          Assim que for aprovada, você receberá uma confirmação por e-mail.
        </p>
  
        <p style="margin-top:20px; font-weight:600; color:#166534;">
          Equipe ${instituicao}
        </p>
      </div>
    `;
  }
  
  export default { gerarEmailPreMatriculaAluno };
  