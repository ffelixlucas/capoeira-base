// 🎯 Service da Matrícula (Admin)
// Criação de aluno + matrícula real (multi-organização segura)

const matriculaRepository = require("./matriculaRepository");
const emailService = require("../../services/emailService");
const logger = require("../../utils/logger");
const notificacaoService = require("../notificacaoDestinos/notificacaoDestinosService");
const preMatriculasRepository = require("../public/preMatriculas/preMatriculasRepository");

/**
 * Calcula idade exata a partir da data de nascimento
 */
function calcularIdade(nascimento) {
  const hoje = new Date();
  const nasc = new Date(nascimento);
  let idade = hoje.getFullYear() - nasc.getFullYear();
  const m = hoje.getMonth() - nasc.getMonth();
  if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) idade--;
  return idade;
}

/**
 * Cria aluno e matrícula após aprovação ou manualmente
 */
async function criarMatricula(dados) {
  try {
    // Normalizações básicas
    dados.cpf = dados.cpf?.replace(/\D/g, "") || "";
    dados.email = dados.email?.toLowerCase().trim() || null;

    // 🔒 Garante que a organização esteja presente
    const usuario = dados.usuario || null;
    if (usuario?.organizacao_id && !dados.organizacao_id) {
      dados.organizacao_id = usuario.organizacao_id;
      logger.debug(
        `[matriculaService] organizacao_id herdado do token → ${dados.organizacao_id}`
      );
    }

    if (!dados.organizacao_id) {
      logger.warn(
        "[matriculaService] organizacao_id ausente, buscando fallback..."
      );
    }

    // 🚫 Evita duplicidade de CPF
    const existente = await matriculaRepository.buscarPorCpf(dados.cpf);
    if (existente) {
      throw new Error("Já existe um aluno com este CPF.");
    }

    // 📅 Calcula idade
    const idade = calcularIdade(dados.nascimento);

    // 🔍 Busca turma compatível com a idade
    const turma = await matriculaRepository.buscarTurmaPorIdade(idade);
    if (!turma) throw new Error("Nenhuma turma disponível para esta idade.");

    // Atribui dados da turma
    dados.turma_id = turma.turma_id;
    dados.categoria_id = turma.categoria_id || null;
    dados.categoria_nome = turma.categoria_nome || null;

    // 🔹 Fallback: busca organização da turma, caso ainda não tenha sido definida
    if (!dados.organizacao_id) {
      dados.organizacao_id =
        await matriculaRepository.buscarOrganizacaoPorTurmaId(turma.turma_id);
      logger.debug(
        `[matriculaService] organizacao_id herdado da turma → ${dados.organizacao_id}`
      );
    }

    if (!dados.organizacao_id) {
      throw new Error("Falha ao determinar organização da matrícula.");
    }

    logger.info("[matriculaService] Criando aluno/matrícula", {
      nome: dados.nome,
      idade,
      turma_id: dados.turma_id,
      organizacao_id: dados.organizacao_id,
    });

    // 🧾 Cria aluno + matrícula
    const novoAluno = await matriculaRepository.criar(dados);

    logger.info("[matriculaService] Matrícula criada com sucesso", {
      alunoId: novoAluno.id,
      organizacao_id: dados.organizacao_id,
    });

    // ✉️ Envio de e-mails e notificações
    try {
      if (dados.email) {
        await emailService.enviarEmailCustom({
          to: dados.email,
          subject: "🎓 Matrícula confirmada",
          html: `
            <p>Olá ${dados.nome},</p>
            <p>Sua matrícula foi <b>confirmada</b> com sucesso!</p>
            <p>Bem-vindo(a) à nossa organização 🎉</p>
          `,
        });
      }

      const emailsAdmin = await notificacaoService.getEmails(
        dados.organizacao_id,
        "matricula"
      );

      for (const email of emailsAdmin) {
        await emailService.enviarEmailCustom({
          to: email,
          subject: "✅ Nova matrícula confirmada",
          html: `
            <p>Nova matrícula confirmada:</p>
            <ul>
              <li><b>Nome:</b> ${dados.nome}</li>
              <li><b>CPF:</b> ${dados.cpf}</li>
              <li><b>Turma:</b> ${turma.turma_nome || "Não especificada"}</li>
            </ul>
          `,
        });
      }
    } catch (err) {
      logger.error("[matriculaService] Erro ao enviar e-mails:", err.message);
    }

    return novoAluno;
  } catch (err) {
    logger.error("[matriculaService] Erro:", err.message);
    throw err;
  }
}

/**
 * Cria matrícula direta a partir de uma pré-matrícula aprovada
 * Copia todos os dados da tabela pre_matriculas → alunos (mantendo foto)
 */
async function criarMatriculaDireta(pre) {
  const organizacao_id = pre.organizacao_id;
  logger.debug(
    `[matriculaService] org ${organizacao_id} - iniciando criação de matrícula direta para pré ${pre.id} (${pre.nome})`
  );

  try {
    // 🧩 Normalizações básicas
    pre.cpf = pre.cpf?.replace(/\D/g, "") || "";
    pre.email = pre.email?.toLowerCase().trim() || null;

    if (!pre.organizacao_id) {
      throw new Error("Organização não identificada na pré-matrícula.");
    }

    // 🚫 Evita duplicidade
    const existente = await matriculaRepository.buscarPorCpf(pre.cpf);
    if (existente) {
      logger.warn(
        `[matriculaService] org ${organizacao_id} - CPF duplicado detectado: ${pre.cpf}`
      );
      throw new Error("Já existe um aluno com este CPF.");
    }

    // 🎯 Define status e turma
    pre.status = "ativo";
    pre.turma_id = pre.turma_id || null;

    // 🧮 Calcula idade atual a partir da data de nascimento
    const nascimento = new Date(pre.nascimento);
    const hoje = new Date();
    const idade =
      hoje.getFullYear() -
      nascimento.getFullYear() -
      (hoje.getMonth() < nascimento.getMonth() ||
      (hoje.getMonth() === nascimento.getMonth() &&
        hoje.getDate() < nascimento.getDate())
        ? 1
        : 0);

    // 🔍 Busca turma automaticamente pela idade
    const turma = await matriculaRepository.buscarTurmaPorIdade(idade);

    if (turma) {
      pre.turma_id = turma.turma_id;
      logger.info(
        `[matriculaService] org ${organizacao_id} - turma ${turma.turma_id} atribuída automaticamente (${turma.turma_nome}, idade ${idade})`
      );
    } else {
      logger.warn(
        `[matriculaService] org ${organizacao_id} - nenhuma turma encontrada compatível com idade ${idade}`
      );
    }

    // 🧾 Mapeamento 100% compatível com a tabela alunos
    const dadosAluno = {
      organizacao_id: pre.organizacao_id,
      nome: pre.nome,
      apelido: pre.apelido || null,
      nascimento: pre.nascimento,
      cpf: pre.cpf,
      email: pre.email,
      telefone_aluno: pre.telefone_aluno || null,
      telefone_responsavel: pre.telefone_responsavel || null,
      nome_responsavel: pre.nome_responsavel || null,
      responsavel_documento: pre.responsavel_documento || null,
      responsavel_parentesco: pre.responsavel_parentesco || null,
      endereco: pre.endereco || null,
      observacoes_medicas: pre.observacoes_medicas || null,
      autorizacao_imagem: pre.autorizacao_imagem ? 1 : 0,
      aceite_lgpd: pre.aceite_lgpd ? 1 : 0,
      foto_url: pre.foto_url || null,
      categoria_id: pre.categoria_id || null,
      graduacao_id: pre.graduacao_id || null,
      turma_id: pre.turma_id || null,
      status: "ativo",
      criado_por: null,
    };

    logger.debug(
      `[matriculaService] org ${organizacao_id} - payload final do aluno:`,
      dadosAluno
    );

    // 💾 Cria aluno e matrícula vinculada
    const novoAluno = await matriculaRepository.criar(dadosAluno);
    logger.info(
      `[matriculaService] org ${organizacao_id} - aluno criado com ID ${novoAluno.id} a partir da pré ${pre.id}`
    );

    // 🔄 Atualiza status da pré-matrícula
    await preMatriculasRepository.atualizarStatus(
      pre.id,
      "aprovado",
      organizacao_id
    );

    // 🧩 Vínculo com tabela matriculas (se existir)
    if (matriculaRepository.criarMatriculaInicial) {
      const matriculaId = await matriculaRepository.criarMatriculaInicial(
        novoAluno.id,
        organizacao_id
      );
      logger.info(
        `[matriculaService] org ${organizacao_id} - matrícula ${matriculaId} criada com sucesso para aluno ${novoAluno.id}`
      );
    } else {
      logger.debug(
        `[matriculaService] org ${organizacao_id} - método criarMatriculaInicial não encontrado (ignorando etapa de vínculo)`
      );
    }

    // ✉️ Envia e-mails
    try {
      if (pre.email) {
        await emailService.enviarEmailCustom({
          to: pre.email,
          subject: "🎓 Matrícula confirmada",
          html: `
            <p>Olá ${pre.nome},</p>
            <p>Sua matrícula foi <b>confirmada</b> com sucesso!</p>
            <p>Bem-vindo(a) à nossa organização 🎉</p>
          `,
        });
        logger.info(
          `[matriculaService] org ${organizacao_id} - e-mail de confirmação enviado para ${pre.email}`
        );
      }

      const emailsAdmin = await notificacaoService.getEmails(
        pre.organizacao_id,
        "matricula"
      );

      for (const email of emailsAdmin) {
        await emailService.enviarEmailCustom({
          to: email,
          subject: "✅ Nova matrícula confirmada",
          html: `
            <p>Nova matrícula confirmada:</p>
            <ul>
              <li><b>Nome:</b> ${pre.nome}</li>
              <li><b>CPF:</b> ${pre.cpf}</li>
              <li><b>Email:</b> ${pre.email}</li>
            </ul>
          `,
        });
      }

      logger.info(
        `[matriculaService] org ${organizacao_id} - e-mails administrativos enviados`
      );
    } catch (emailErr) {
      logger.error(
        `[matriculaService] org ${organizacao_id} - erro ao enviar e-mails: ${emailErr.message}`
      );
    }

    logger.info(
      `[matriculaService] org ${organizacao_id} - matrícula direta concluída com sucesso (pré ${pre.id} → aluno ${novoAluno.id})`
    );

    return novoAluno.id;
  } catch (err) {
    logger.error(
      `[matriculaService] org ${organizacao_id} - erro em criarMatriculaDireta: ${err.message}`
    );
    throw err;
  }
}

module.exports = { criarMatricula, criarMatriculaDireta };
