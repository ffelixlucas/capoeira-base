const turmasRepository = require("./turmasRepository");
const logger = require("../../utils/logger");

/* -------------------------------------------------------------------------- */
/* 🔍 Listar todas as turmas da organização                                   */
/* -------------------------------------------------------------------------- */
async function listarTurmasAtivas(organizacaoId) {
  const turmas = await turmasRepository.buscarTodasComInstrutor(organizacaoId);
  logger.debug("[turmasService] Turmas listadas", { total: turmas.length });
  return turmas;
}

/* -------------------------------------------------------------------------- */
/* ➕ Criar nova turma (com normalização da faixa etária)                     */
/* -------------------------------------------------------------------------- */
async function criarTurma(data, organizacaoId) {
  let { idade_min, idade_max, faixa_etaria } = data;

  const texto = faixa_etaria?.toLowerCase().trim();
  const matchRange = texto?.match(/(\d+)\s*a\s*(\d+)/);
  const matchMais = texto?.match(/(\d+)\s*\+/);
  const matchAte = texto?.match(/até\s*(\d+)/);

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
    faixa_etaria = idade_min && idade_max
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

  return turmasRepository.inserirTurma(payload);
}

/* -------------------------------------------------------------------------- */
/* ✏️ Atualizar turma existente                                              */
/* -------------------------------------------------------------------------- */
async function atualizarTurma(id, data, organizacaoId) {
  return turmasRepository.atualizarTurma(id, organizacaoId, data);
}

/* -------------------------------------------------------------------------- */
/* ❌ Excluir turma                                                          */
/* -------------------------------------------------------------------------- */
async function excluirTurma(id, organizacaoId) {
  return turmasRepository.deletarTurma(id, organizacaoId);
}

/* -------------------------------------------------------------------------- */
/* 👨‍🏫 Listar turmas por equipe                                             */
/* -------------------------------------------------------------------------- */
async function listarTurmasPorEquipe(equipeId, organizacaoId) {
  return turmasRepository.listarPorEquipe(equipeId, organizacaoId);
}

/* -------------------------------------------------------------------------- */
/* 🎯 Buscar turma por idade (uso interno — ModalPendentes)                  */
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
  const possui = await turmasRepository.verificarVinculos(origemId, organizacaoId);

  if (possui) {
    logger.debug("[turmasService] Turma com vínculos, migrando alunos...", {
      origemId,
      destinoId,
    });
    // 🚧 Implementar migração no futuro
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
  buscarTurmaPorIdade, // 🔥 adicionado
  encerrarTurmaComMigracao,
};
