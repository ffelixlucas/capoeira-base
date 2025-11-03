// 🎯 Service da Matrícula (Admin)
// Criação de aluno + matrícula real (multi-organização segura)

const matriculaRepository = require("./matriculaRepository");
const emailService = require("../../services/emailService");
const logger = require("../../utils/logger");
const notificacaoService = require("../notificacaoDestinos/notificacaoDestinosService");
const preMatriculasRepository = require("../public/preMatriculas/preMatriculasRepository");
const {
  gerarEmailMatriculaAprovada,
  gerarEmailMatriculaAprovadaAdmin,
} = require("../../services/templates/matriculaAprovada");
const { gerarEmailMatriculaRecusada } = require("../../services/templates/matriculaRecusada");

/**
 * Normaliza dados de CPF e e-mail
 */
function normalizarDadosPessoa(obj) {
  obj.cpf = obj.cpf?.replace(/\D/g, "") || "";
  obj.email = obj.email?.toLowerCase().trim() || null;
  return obj;
}

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
    // 🧩 Normalizações básicas
    normalizarDadosPessoa(dados);

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
    if (existente) throw new Error("Já existe um aluno com este CPF.");

    // 📅 Calcula idade
    const idade = calcularIdade(dados.nascimento);
    logger.debug(`[matriculaService] Idade calculada → ${idade}`);

    // 🔍 Busca turma compatível com a idade
    const turma = await matriculaRepository.buscarTurmaPorIdade(idade);
    logger.debug("[matriculaService] Turma detectada:", turma);

    if (!turma) throw new Error("Nenhuma turma disponível para esta idade.");

    // Atribui dados da turma
    dados.turma_id = turma.turma_id;
    dados.categoria_id = turma.categoria_id || null;
    dados.categoria_nome = turma.categoria_nome || null;
    logger.debug(`[matriculaService] turma_id atribuído → ${dados.turma_id}`);

    // 🔹 Fallback: busca organização da turma, caso ainda não tenha sido definida
    if (!dados.organizacao_id) {
      dados.organizacao_id =
        await matriculaRepository.buscarOrganizacaoPorTurmaId(turma.turma_id);
      logger.debug(
        `[matriculaService] organizacao_id herdado da turma → ${dados.organizacao_id}`
      );
    }

    if (!dados.organizacao_id)
      throw new Error("Falha ao determinar organização da matrícula.");

    logger.info("[matriculaService] Criando aluno/matrícula", {
      nome: dados.nome,
      idade,
      turma_id: dados.turma_id,
      organizacao_id: dados.organizacao_id,
    });

    // 💾 Cria aluno + matrícula
    const novoAluno = await matriculaRepository.criar(dados);

    logger.info("[matriculaService] Matrícula criada com sucesso", {
      alunoId: novoAluno.id,
      organizacao_id: dados.organizacao_id,
    });

    // ✉️ Envio de e-mails e notificações
    try {
      // 🧩 Garante que o turma_id exista antes do e-mail
      if (!dados.turma_id) {
        logger.warn(
          `[matriculaService] org ${dados.organizacao_id} - turma_id ausente antes do e-mail, tentando fallback...`
        );
        const turmaFallback = await matriculaRepository.buscarTurmaPorIdade(
          idade
        );
        if (turmaFallback) {
          dados.turma_id = turmaFallback.turma_id;
          logger.info(
            `[matriculaService] org ${dados.organizacao_id} - turma_id recuperado via fallback (${turmaFallback.turma_id}, ${turmaFallback.turma_nome})`
          );
        } else {
          logger.error(
            `[matriculaService] org ${dados.organizacao_id} - nenhum turma_id encontrado mesmo após fallback`
          );
        }
      }

      logger.debug(
        `[matriculaService] org ${dados.organizacao_id} - preparando envio de e-mail (turma_id=${dados.turma_id || "N/A"})`
      );

      const dadosEmail = await matriculaRepository.buscarDadosEmailAprovacao(
        dados.turma_id,
        dados.organizacao_id
      );

      logger.debug(
        "[matriculaService] Dados do e-mail de matrícula:",
        dadosEmail
      );

      // 🔹 E-mail do aluno
      if (dados.email) {
        const htmlAluno = gerarEmailMatriculaAprovada({
          ...dados,
          ...dadosEmail,
        });

        await emailService.enviarEmailCustom({
          to: dados.email,
          subject: "🎉 Matrícula aprovada – bem-vindo(a)!",
          html: htmlAluno,
        });
      }

      // 🔹 E-mails administrativos
      const emailsAdmin = await notificacaoService.getEmails(
        dados.organizacao_id,
        "matricula"
      );

      const htmlAdmin = gerarEmailMatriculaAprovadaAdmin({
        ...dados,
        ...dadosEmail,
      });

      for (const email of emailsAdmin) {
        try {
          await emailService.enviarEmailCustom({
            to: email,
            subject: "✅ Nova matrícula confirmada",
            html: htmlAdmin,
          });
        } catch (err) {
          logger.warn(
            `[matriculaService] Falha ao enviar e-mail admin ${email}: ${err.message}`
          );
        }
      }

      logger.info(
        `[matriculaService] org ${dados.organizacao_id} - e-mails de matrícula enviados (aluno + admin)`
      );
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
    normalizarDadosPessoa(pre);

    if (!pre.organizacao_id)
      throw new Error("Organização não identificada na pré-matrícula.");

    // 🚫 Evita duplicidade
    const existente = await matriculaRepository.buscarPorCpf(pre.cpf);
    if (existente)
      throw new Error("Já existe um aluno com este CPF nesta organização.");

    // 🧮 Calcula idade atual
    const idade = calcularIdade(pre.nascimento);
    logger.debug(`[matriculaService] Idade calculada → ${idade}`);

    // 🔍 Busca turma automaticamente pela idade
    const turma = await matriculaRepository.buscarTurmaPorIdade(idade);
    logger.debug("[matriculaService] Turma detectada:", turma);

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

    // 🧾 Mapeamento compatível com tabela alunos
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

    // 💾 Cria aluno
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

    // ✉️ Envio de e-mails (aluno + admin)
    // 🧩 Garante que o turma_id exista antes de montar o e-mail
    if (!pre.turma_id) {
      logger.warn(
        `[matriculaService] org ${organizacao_id} - turma_id ausente antes do e-mail, tentando fallback por idade...`
      );
      const turmaFallback = await matriculaRepository.buscarTurmaPorIdade(idade);
      if (turmaFallback) {
        pre.turma_id = turmaFallback.turma_id;
        logger.info(
          `[matriculaService] org ${organizacao_id} - turma_id recuperado via fallback (${turmaFallback.turma_id}, ${turmaFallback.turma_nome})`
        );
      } else {
        logger.error(
          `[matriculaService] org ${organizacao_id} - nenhuma turma encontrada mesmo após fallback (idade ${idade})`
        );
      }
    }

    logger.debug(
      `[matriculaService] org ${organizacao_id} - preparando envio de e-mail (turma_id=${pre.turma_id || "N/A"})`
    );

    const dadosEmail = await matriculaRepository.buscarDadosEmailAprovacao(
      pre.turma_id,
      pre.organizacao_id
    );

    logger.debug(
      "[matriculaService] Dados do e-mail de matrícula direta:",
      dadosEmail
    );

    if (pre.email) {
      try {
        const htmlAluno = gerarEmailMatriculaAprovada({
          ...pre,
          ...dadosEmail,
        });

        await emailService.enviarEmailCustom({
          to: pre.email,
          subject: "🎉 Matrícula aprovada – bem-vindo(a)!",
          html: htmlAluno,
        });

        const emailsAdmin = await notificacaoService.getEmails(
          pre.organizacao_id,
          "matricula"
        );

        const htmlAdmin = gerarEmailMatriculaAprovadaAdmin({
          ...pre,
          ...dadosEmail,
        });

        for (const email of emailsAdmin) {
          try {
            await emailService.enviarEmailCustom({
              to: email,
              subject: "✅ Nova matrícula confirmada",
              html: htmlAdmin,
            });
          } catch (err) {
            logger.warn(
              `[matriculaService] Falha ao enviar e-mail admin ${email}: ${err.message}`
            );
          }
        }

        logger.info(
          `[matriculaService] org ${organizacao_id} - e-mails de matrícula aprovados enviados`
        );
      } catch (err) {
        logger.error(
          `[matriculaService] org ${organizacao_id} - erro ao enviar e-mails de matrícula aprovada: ${err.message}`
        );
      }
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

/**
 * Envia e-mail de recusa de matrícula (admin)
 */
async function enviarEmailRecusaMatricula(matricula) {
  try {
    const org = await matriculaRepository.buscarDadosOrganizacao(matricula.organizacao_id);
    if (!org) {
      logger.warn(`[matriculaService] Organização não encontrada para matrícula rejeitada (org ${matricula.organizacao_id})`);
      return;
    }

    if (!matricula.email) {
      logger.warn(`[matriculaService] Matrícula rejeitada sem e-mail disponível para envio (aluno ${matricula.nome})`);
      return;
    }

    const html = gerarEmailMatriculaRecusada({
      ...matricula,
      nome_fantasia: org.nome_fantasia,
      telefone: org.telefone,
    });

    await emailService.enviarEmailCustom({
      to: matricula.email,
      subject: "⚠️ Atualização sobre sua matrícula",
      html,
    });

    logger.info(
      `[matriculaService] org ${matricula.organizacao_id} - e-mail de recusa enviado para ${matricula.email}`
    );
  } catch (err) {
    logger.error(`[matriculaService] Erro ao enviar e-mail de recusa: ${err.message}`);
  }
}


module.exports = { criarMatricula, criarMatriculaDireta, enviarEmailRecusaMatricula };
