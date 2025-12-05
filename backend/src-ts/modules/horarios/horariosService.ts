import horariosRepository, {
    DadosCriarHorario,
  } from "./horariosRepository";
  import logger from "../../utils/logger";
  
  async function criarHorario(dados: DadosCriarHorario) {
    logger.info("[horariosService] Criando horário:", dados);
    return horariosRepository.criarHorario(dados);
  }
  
  async function listarPorTurma(turmaId: number, organizacaoId: number) {
    logger.debug("[horariosService] Listando horários da turma", {
      turmaId,
      organizacaoId,
    });
    return horariosRepository.listarPorTurma(turmaId, organizacaoId);
  }
  
  async function deletarHorario(id: number, organizacaoId: number) {
    logger.warn("[horariosService] Removendo horário", { id, organizacaoId });
    return horariosRepository.deletarHorario(id, organizacaoId);
  }
  
  export default {
    criarHorario,
    listarPorTurma,
    deletarHorario,
  };
  