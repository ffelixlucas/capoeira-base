// 🎯 Service - Pré-Matrículas Públicas
// Contém as regras de negócio e validações antes de salvar no banco.

const preMatriculasRepository = require("./preMatriculasRepository");
const emailService = require("../../../services/emailService");
const notificacaoService = require("../../notificacaoDestinos/notificacaoDestinosService");
const db = require("../../../database/connection");
const logger = require("../../../utils/logger");
const bucket = require("../../../config/firebase"); 
const organizacaoService = require("../../shared/organizacoes/organizacaoService");
const {
  gerarEmailPreMatriculaAdmin, 
} = require("../../../services/templates/preMatriculaAdmin");
const { gerarEmailPreMatriculaAluno } = require("../../../services/templates/preMatriculaAluno");

// Loga apenas 1x no startup, útil para debug
logger.debug(`[preMatriculasService] Bucket em uso: ${bucket.name}`);

/**
 * Cria uma nova pré-matrícula
 * Faz upload da imagem (se houver), grava no banco e envia e-mails de confirmação
 */
async function criarPreMatricula(dados) {
  try {
    logger.info(
      "[preMatriculasService] Recebendo solicitação de pré-matrícula"
    );

    // 🧭 Resolver organização se vier slug no payload
    if (dados.slug && !dados.organizacao_id) {
      try {
        const orgId = await organizacaoService.resolverIdPorSlug(dados.slug);
        dados.organizacao_id = orgId;
        logger.debug(
          `[preMatriculasService] Organização resolvida via slug "${dados.slug}" → id ${orgId}`
        );
      } catch (err) {
        throw new Error("Organização inválida (slug não encontrado).");
      }
    }

    // 🔍 Validações básicas
    if (!dados.nome || !dados.nascimento || !dados.cpf || !dados.email) {
      throw new Error("Campos obrigatórios não preenchidos.");
    }

    if (!dados.organizacao_id) {
      throw new Error("Organização não informada ou inválida.");
    }

    // Normalizações
    dados.cpf = dados.cpf.replace(/\D/g, "");
    dados.email = dados.email.toLowerCase().trim();
    dados.telefone_aluno = dados.telefone_aluno?.replace(/\D/g, "") || null;
    dados.telefone_responsavel =
      dados.telefone_responsavel?.replace(/\D/g, "") || null;
    dados.responsavel_documento =
      dados.responsavel_documento?.replace(/\D/g, "") || null;
    dados.autorizacao_imagem = dados.autorizacao_imagem ? 1 : 0;
    dados.aceite_lgpd = dados.aceite_lgpd ? 1 : 0;
    dados.endereco = dados.endereco?.trim() || null;

    // Grupo de origem
    if (dados.grupo_personalizado) {
      dados.grupo_origem = dados.grupo_personalizado;
    }

    // Campo já treinou
    dados.ja_treinou =
      dados.ja_treinou === "sim" || dados.ja_treinou === "nao"
        ? dados.ja_treinou
        : "nao";

    // 📸 Upload da imagem, se enviada
    let fotoUrl = null;
    if (dados.imagemBase64) {
      try {
        const base64Data = dados.imagemBase64.split(",")[1];
        const buffer = Buffer.from(base64Data, "base64");

        const destino = `fotos-perfil/pre-matriculas/${Date.now()}_${dados.cpf}.jpg`;
        const file = bucket.file(destino);

        await file.save(buffer, { contentType: "image/jpeg" });

        logger.debug(
          `[preMatriculasService] Upload concluído → aguardando resize automático (extensão Firebase) para ${destino}`
        );

        const [url] = await file.getSignedUrl({
          action: "read",
          expires: "03-01-2030",
        });

        fotoUrl = url;
        dados.foto_url = url;
        logger.info(`[preMatriculasService] Foto enviada: ${destino}`);
      } catch (err) {
        logger.error(
          "[preMatriculasService] Falha ao enviar imagem:",
          err.message
        );
      }
    }

    // 🔎 Verifica se já existe pré-matrícula com este CPF
    const cpfDuplicado = await preMatriculasRepository.verificarCpfExistente(
      dados.cpf,
      dados.organizacao_id
    );

    if (cpfDuplicado) {
      logger.warn(
        `[preMatriculasService] CPF duplicado bloqueado: ${dados.cpf}`
      );
      throw new Error(
        "Já existe uma pré-matrícula com este CPF nesta organização."
      );
    }

    // 💾 Grava no banco via
    const id = await preMatriculasRepository.criarPreMatricula({
      ...dados,
      foto_url: fotoUrl,
    });

    logger.info(
      `[preMatriculasService] Pré-matrícula criada com sucesso (ID ${id})`
    );

    // ✉️ Envio de e-mails

    // 🔎 Buscar nome da organização para personalizar o e-mail
    const orgInfo = await preMatriculasRepository.buscarGrupoPorOrganizacaoId(
      dados.organizacao_id
    );
    const nomeInstituicao =
      orgInfo?.nome_fantasia || orgInfo?.nome || "Capoeira Base";

    try {
      // Para o aluno/responsável
      await emailService.enviarEmailCustom({
        to: dados.email,
        subject: "📩 Pré-matrícula recebida – estamos quase lá!",
        html: gerarEmailPreMatriculaAluno({
          ...dados,
          nome_fantasia: nomeInstituicao,
        }),
      });

      // Para administradores
      const emailsAdmin = await notificacaoService.getEmails(
        dados.organizacao_id,
        "matricula"
      );

      // 🔎 Buscar a pré-matrícula completa (com nomes de categoria e graduação)
      const preCompleta = await preMatriculasRepository.buscarPorId(
        id,
        dados.organizacao_id
      );

      for (const email of emailsAdmin) {
        await emailService.enviarEmailCustom({
          to: email,
          subject: `👥 Nova pré-matrícula pendente (${preCompleta.nome})`,
          html: gerarEmailPreMatriculaAdmin(preCompleta),
        });
      }

      logger.info(
        `[preMatriculasService] org ${dados.organizacao_id} - e-mails de notificação enviados (${emailsAdmin.length})`
      );
    } catch (emailErr) {
      logger.error(
        "[preMatriculasService] Erro ao enviar e-mails:",
        emailErr.message
      );
    }

    return {
      message: "Pré-matrícula criada com sucesso. Aguarde aprovação.",
      id,
      foto_url: fotoUrl,
    };
  } catch (err) {
    logger.error(
      "[preMatriculasService] Erro ao criar pré-matrícula:",
      err.message
    );
    throw err;
  }
}

/**
 * Lista pré-matrículas pendentes por organização
 */
async function listarPendentes(organizacaoId) {
  try {
    return await preMatriculasRepository.listarPendentes(organizacaoId);
  } catch (err) {
    logger.error(
      "[preMatriculasService] Erro ao listar pendentes:",
      err.message
    );
    throw err;
  }
}

async function atualizarStatus(id, status, organizacaoId) {
  try {
    logger.debug(
      `[preMatriculasService] org ${organizacaoId} - iniciando atualização de status da pré ${id} → ${status}`
    );

    // 🧩 Atualiza o status no banco
    await preMatriculasRepository.atualizarStatus(id, status, organizacaoId);
    logger.info(
      `[preMatriculasService] org ${organizacaoId} - status atualizado para ${status} (pré ${id})`
    );

    // ⚙️ Quando aprovado, cria aluno e matrícula real
    if (status === "aprovado") {
      logger.debug(
        `[preMatriculasService] org ${organizacaoId} - status aprovado → iniciando criação de matrícula`
      );

      const matriculaService = require("../../matricula/matriculaService");
      const pre = await preMatriculasRepository.buscarPorId(id, organizacaoId);

      if (!pre) {
        logger.warn(
          `[preMatriculasService] org ${organizacaoId} - pré-matrícula ${id} não encontrada ao tentar aprovar`
        );
        return {
          sucesso: false,
          erro: "Pré-matrícula não encontrada.",
        };
      }

      await matriculaService.criarMatriculaDireta(pre);

      // 🧹 Remove pré-matrícula antiga
      await preMatriculasRepository.deletar(id, organizacaoId);
      logger.info(
        `[preMatriculasService] org ${organizacaoId} - pré-matrícula ${id} aprovada e removida após criação de matrícula`
      );
    }

    return {
      sucesso: true,
      mensagem: `Status atualizado para ${status}`,
    };
  } catch (err) {
    logger.error(
      `[preMatriculasService] Erro ao atualizar status (pré ${id}):`,
      err.message
    );
    return {
      sucesso: false,
      erro: err.message || "Erro ao atualizar status da pré-matrícula.",
    };
  }
}

/**
 * Busca pré-matrícula por ID
 */
async function buscarPorId(id) {
  const [rows] = await db.execute("SELECT * FROM pre_matriculas WHERE id = ?", [
    id,
  ]);
  return rows.length ? rows[0] : null;
}

/**
 * Busca grupo pelo ID da organização
 */
async function buscarGrupoPorOrganizacaoId(organizacaoId) {
  try {
    return await preMatriculasRepository.buscarGrupoPorOrganizacaoId(
      organizacaoId
    );
  } catch (err) {
    logger.error("[preMatriculasService] Erro ao buscar grupo:", err.message);
    throw err;
  }
}

/**
 * 🧹 Deleta uma pré-matrícula (somente do banco)
 * Usado quando o status é "aprovado" — mantém a imagem no Firebase.
 */
async function deletarPreMatricula(id, organizacao_id) {
  try {
    const removida = await preMatriculasRepository.deletar(id, organizacao_id);

    if (removida) {
      logger.info(
        `[preMatriculasService] org ${organizacao_id} - pré-matrícula ${id} removida do banco (imagem mantida)`
      );
    } else {
      logger.warn(
        `[preMatriculasService] org ${organizacao_id} - tentativa de remoção sem sucesso (id ${id})`
      );
    }

    return removida;
  } catch (err) {
    logger.error(
      `[preMatriculasService] Erro ao deletar pré-matrícula ${id}:`,
      err.message
    );
    throw err;
  }
}

async function deletarPreMatriculaComImagem(id, organizacao_id) {
  try {
    logger.debug(
      `[preMatriculasService] org ${organizacao_id} - iniciando exclusão com imagem (pré ${id})`
    );

    // 🔍 Busca via repository
    const pre = await preMatriculasRepository.buscarPorId(id, organizacao_id);
    if (!pre) {
      logger.warn(
        `[preMatriculasService] org ${organizacao_id} - pré-matrícula ${id} não encontrada`
      );
      return false;
    }

    // 📸 Apagar imagem no Firebase
    if (pre.foto_url) {
      try {
        const match = pre.foto_url.match(
          /fotos-perfil\/pre-matriculas\/([^?]+)/
        );
        if (match && match[1]) {
          const caminhoArquivo = `fotos-perfil/pre-matriculas/${match[1]}`;
          const file = bucket.file(caminhoArquivo);
          const [exists] = await file.exists();

          if (exists) {
            await file.delete();
            logger.info(
              `[preMatriculasService] org ${organizacao_id} - imagem removida do Firebase: ${caminhoArquivo}`
            );
          } else {
            logger.warn(
              `[preMatriculasService] org ${organizacao_id} - imagem não encontrada no Firebase: ${caminhoArquivo}`
            );
          }
        } else {
          logger.warn(
            `[preMatriculasService] org ${organizacao_id} - caminho da imagem inválido: ${pre.foto_url}`
          );
        }
      } catch (err) {
        logger.error(
          `[preMatriculasService] org ${organizacao_id} - erro ao remover imagem Firebase: ${err.message}`
        );
      }
    } else {
      logger.debug(
        `[preMatriculasService] org ${organizacao_id} - pré-matrícula ${id} sem imagem para remover`
      );
    }

    // 🗑️ Apagar do banco
    const removida = await preMatriculasRepository.deletar(id, organizacao_id);
    if (removida) {
      logger.info(
        `[preMatriculasService] org ${organizacao_id} - pré-matrícula ${id} removida (imagem e banco)`
      );
    }

    return removida;
  } catch (err) {
    logger.error(
      `[preMatriculasService] Erro ao deletar pré-matrícula ${id} com imagem: ${err.message}`
    );
    throw err;
  }
}

module.exports = {
  criarPreMatricula,
  listarPendentes,
  atualizarStatus,
  buscarPorId,
  buscarGrupoPorOrganizacaoId,
  deletarPreMatricula,
  deletarPreMatriculaComImagem,
};
