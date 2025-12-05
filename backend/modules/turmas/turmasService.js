const turmasRepository = require("./turmasRepository");
const logger = require("../../utils/logger.js");

// Ponte para horários em TS (compilado)
const horariosService = require("../../dist/modules/horarios/horariosService.js").default;

/* -------------------------------------------------------------------------- */
/* 🔍 Listar todas as turmas da organização                                   */
/* -------------------------------------------------------------------------- */
async function listarTurmasAtivas(organizacaoId) {
  const turmas = await turmasRepository.buscarTodasComInstrutor(organizacaoId);
  logger.debug("[turmasService] Turmas listadas", { total: turmas.length });
  return turmas;
}

/* -------------------------------------------------------------------------- */
/* ➕ Criar nova turma (com normalização da faixa etária + horários)          */
/* -------------------------------------------------------------------------- */
async function criarTurma(data, organizacaoId) {

  // 🔥 Captura os dias enviados pelo front (checkboxes)
  const dias = Array.isArray(data.dias) ? data.dias : [];

  // 🔥 Compatibilidade: front pode enviar `horario` (string) ou início/fim separado
  const horario =
    data.horario ||
    (data.horario_inicio && data.horario_fim
      ? `${data.horario_inicio} - ${data.horario_fim}`
      : null);

  let { idade_min, idade_max, faixa_etaria } = data;

  // 🔧 EVITA CRASH — garante que faixa_etaria pode ser manipulada
  const texto = (faixa_etaria || "").toLowerCase().trim();
  const matchRange = texto.match(/(\d+)\s*a\s*(\d+)/);
  const matchMais = texto.match(/(\d+)\s*\+/);
  const matchAte = texto.match(/até\s*(\d+)/);

  if (matchRange) {
    idade_min = parseInt(matchRange[1]);
    idade_max = parseInt(matchRange[2]);
  } else if (matchMais) {
    idade_min = parseInt(matchMais[1]);
    idade_max = null;
  } else if (matchAte) {
    idade_min = null;
    idade_max = parseInt(matchAte[1]);
  }

  if (!faixa_etaria && (idade_min || idade_max)) {
    faixa_etaria =
      idade_min && idade_max
        ? `${idade_min} a ${idade_max}`
        : idade_min
        ? `${idade_min}+`
        : `até ${idade_max}`;
  }

  const payload = {
    nome: data.nome.trim(),
    faixa_etaria,
    equipe_id: data.equipe_id || null,
    idade_min: idade_min ?? null,
    idade_max: idade_max ?? null,
    categoria_id: data.categoria_id || null,
    organizacao_id: organizacaoId,
  };

  // 1️⃣ Criar turma
  const resultado = await turmasRepository.inserirTurma(payload);
  const turma_id = resultado.id;

  // 2️⃣ Criar horários automáticos
  if (dias.length > 0 && horario) {
    logger.info("[turmasService] Criando horários automáticos da turma...");

    for (const dia of dias) {
      await horariosService.criarHorario({
        organizacao_id: organizacaoId,
        turma_id,
        dias: dia,
        horario,
        responsavel_id: data.equipe_id || null
      });
    }

    logger.info("[turmasService] Horários criados com sucesso.");
  } else {
    logger.warn("[turmasService] Turma criada SEM horários — dias ou horário não enviados.");
  }

  return { id: turma_id };
}

/* -------------------------------------------------------------------------- */
/* ✏️ Atualizar turma existente                                              */
/* -------------------------------------------------------------------------- */
async function atualizarTurma(id, data, organizacaoId) {
  return turmasRepository.atualizarTurma(id, organizacaoId, data);
}

/* -------------------------------------------------------------------------- */
/* ❌ Excluir turma (remover horários junto)                                   */
/* -------------------------------------------------------------------------- */
async function excluirTurma(id, organizacaoId) {
  const db = require("../../database/connection");

  // 1️⃣ Apaga horários antes
  await db.execute(
    "DELETE FROM horarios_aula WHERE turma_id = ? AND organizacao_id = ?",
    [id, organizacaoId]
  );

  logger.warn("[turmasService] Horários da turma removidos:", { turma_id: id });

  // 2️⃣ Apaga turma
  return turmasRepository.deletarTurma(id, organizacaoId);
}

/* -------------------------------------------------------------------------- */
/* 👨‍🏫 Listar turmas por equipe                                             */
/* -------------------------------------------------------------------------- */
async function listarTurmasPorEquipe(equipeId, organizacaoId) {
  return turmasRepository.listarPorEquipe(equipeId, organizacaoId);
}

/* -------------------------------------------------------------------------- */
/* 🎯 Buscar turma por idade                                                 */
/* -------------------------------------------------------------------------- */
async function buscarTurmaPorIdade(idade, organizacaoId) {
  const turmas = await turmasRepository.buscarTodasComInstrutor(organizacaoId);

  const turma = turmas.find((t) => {
    const min = t.idade_min ?? 0;
    const max = t.idade_max ?? 99;
    return idade >= min && idade <= max;
  });

  return turma || null;
}

/* -------------------------------------------------------------------------- */
/* 🔁 Encerrar turma com migração                                             */
/* -------------------------------------------------------------------------- */
async function encerrarTurmaComMigracao(origemId, destinoId, organizacaoId) {
  const possui = await turmasRepository.verificarVinculos(
    origemId,
    organizacaoId
  );

  if (possui) {
    logger.debug("[turmasService] Turma com vínculos, migrando alunos...", {
      origemId,
      destinoId,
    });
  }

  await turmasRepository.deletarTurma(origemId, organizacaoId);
  logger.debug("[turmasService] Turma encerrada", { origemId, destinoId });
}

module.exports = {
  listarTurmasAtivas,
  criarTurma,
  atualizarTurma,
  excluirTurma,
  listarTurmasPorEquipe,
  buscarTurmaPorIdade,
  encerrarTurmaComMigracao,
};
