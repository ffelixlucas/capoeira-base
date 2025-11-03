// 🎯 Service - Pré-Matrículas Públicas
// Contém as regras de negócio e validações antes de salvar no banco.

const preMatriculasRepository = require("./preMatriculasRepository");
const matriculaService = require("../../matricula/matriculaService");

const emailService = require("../../../services/emailService");
const notificacaoService = require("../../notificacaoDestinos/notificacaoDestinosService");
const db = require("../../../database/connection");
const logger = require("../../../utils/logger");
const bucket = require("../../../config/firebase");
const organizacaoService = require("../../shared/organizacoes/organizacaoService");
const {
  gerarEmailPreMatriculaAdmin,
} = require("../../../services/templates/preMatriculaAdmin");
const {
  gerarEmailPreMatriculaAluno,
} = require("../../../services/templates/preMatriculaAluno");

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

        // Caminho da imagem original
        const nomeArquivo = `${Date.now()}_${dados.cpf}.jpg`;
        const destinoOriginal = `fotos-perfil/pre-matriculas/${nomeArquivo}`;
        const fileOriginal = bucket.file(destinoOriginal);

        await fileOriginal.save(buffer, { contentType: "image/jpeg" });

        logger.info(
          `[preMatriculasService] Upload concluído → ${destinoOriginal}`
        );

        // 🚀 Aguarda o processamento da extensão "Resize Images"
        const LABEL = process.env.RESIZED_LABEL || "400x400";
        const baseDir = "fotos-perfil/pre-matriculas";
        const resizedSub = `${baseDir}/fotos-perfil-resized`; // ✅ subpasta real
        const baseName = nomeArquivo.replace(/\.(jpe?g|png|webp)$/i, "");
        const ext = (nomeArquivo.match(/\.(jpe?g|png|webp)$/i) || [".jpg"])[0];

        // 🔎 candidatos no formato real (sufixo _400x400)
        const candidatos = [
          `${resizedSub}/${baseName}_${LABEL}${ext}`, // ✅ padrão real
          `${baseDir}/${baseName}_${LABEL}${ext}`, // compat
          `${baseDir}/${LABEL}_${nomeArquivo}`, // compat prefixo
        ];

        let caminhoResizedEncontrado = null;

        // ⏳ tenta até 20s (20 x 1s)
        for (
          let tentativa = 0;
          tentativa < 20 && !caminhoResizedEncontrado;
          tentativa++
        ) {
          for (const path of candidatos) {
            const [exists] = await bucket.file(path).exists();
            if (exists) {
              caminhoResizedEncontrado = path;
              break;
            }
          }
          if (!caminhoResizedEncontrado) {
            await new Promise((r) => setTimeout(r, 1000));
          }
        }

        if (caminhoResizedEncontrado) {
          const [resizedUrl] = await bucket
            .file(caminhoResizedEncontrado)
            .getSignedUrl({
              action: "read",
              expires: "03-01-2030",
            });
          fotoUrl = resizedUrl;
          dados.foto_url = resizedUrl;
          logger.info(
            `[preMatriculasService] Imagem redimensionada usada → ${caminhoResizedEncontrado}`
          );

          // 🧹 remove o original
          try {
            await fileOriginal.delete();
            logger.debug(
              `[preMatriculasService] Original removido: ${destinoOriginal}`
            );
          } catch (err) {
            logger.warn(
              `[preMatriculasService] Falha ao remover original (${destinoOriginal}): ${err.message}`
            );
          }
        } else {
          // ⚠️ fallback: usa original
          const [urlOriginal] = await fileOriginal.getSignedUrl({
            action: "read",
            expires: "03-01-2030",
          });
          fotoUrl = urlOriginal;
          dados.foto_url = urlOriginal;
          logger.warn(
            `[preMatriculasService] Redimensionado não encontrado; usando original (${destinoOriginal})`
          );
        }
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
    // 🔍 Verifica se já existe aluno cadastrado com este CPF
    const cpfEmAluno = await preMatriculasRepository.verificarCpfEmAlunos(
      dados.cpf,
      dados.organizacao_id
    );

    if (cpfEmAluno) {
      logger.warn(
        `[preMatriculasService] CPF já pertence a um aluno ativo: ${dados.cpf}`
      );
      throw new Error(
        "Este CPF já está matriculado. Não é possível criar nova pré-matrícula."
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

    // 🔁 Retorna resposta rápida ao usuário antes dos e-mails
const resposta = {
  message: "Pré-matrícula enviada com sucesso! 👊 Aguarde confirmação por e-mail.",
  id,
  foto_url: fotoUrl,
};

// 🚀 Dispara envio de e-mails em segundo plano (não bloqueia resposta)
(async () => {
  try {
    // 🔎 Buscar nome da organização para personalizar o e-mail
    const orgInfo = await preMatriculasRepository.buscarGrupoPorOrganizacaoId(
      dados.organizacao_id
    );
    const nomeInstituicao =
      orgInfo?.nome_fantasia || orgInfo?.nome || "Capoeira Base";

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
    const emailsAdmin =
    (await notificacaoService.getEmails(
      dados.organizacao_id ?? null,
      "matricula"
    )) || [];
  

    // 🔎 Buscar a pré-matrícula completa (com nomes de categoria e graduação)
    const preCompleta = await preMatriculasRepository.buscarPorId(
      id,
      dados.organizacao_id
    );

    if (!Array.isArray(emailsAdmin) || emailsAdmin.length === 0) {
      logger.warn(
        `[preMatriculasService] org ${dados.organizacao_id} - nenhum e-mail admin configurado para tipo 'matricula'`
      );
      return;
    }
    

    for (const email of emailsAdmin) {
      await emailService.enviarEmailCustom({
        to: email,
        subject: `👥 Nova pré-matrícula pendente (${preCompleta.nome})`,
        html: gerarEmailPreMatriculaAdmin(preCompleta),
      });
    }

    logger.info(
      `[preMatriculasService] org ${dados.organizacao_id} - e-mails enviados (modo assíncrono)`
    );
  } catch (emailErr) {
    logger.error(
      "[preMatriculasService] Erro no envio assíncrono de e-mails:",
      emailErr.message
    );
  }
})();

// 🔚 Retorna imediatamente para o front
return resposta;

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

    // ⚙️ Quando aprovado → cria aluno e matrícula real
    if (status === "aprovado") {
      logger.debug(
        `[preMatriculasService] org ${organizacaoId} - status aprovado → iniciando criação de matrícula`
      );

      const pre = await preMatriculasRepository.buscarPorId(id, organizacaoId);

      if (!pre) {
        logger.warn(
          `[preMatriculasService] org ${organizacaoId} - pré-matrícula ${id} não encontrada ao tentar aprovar`
        );
        return { sucesso: false, erro: "Pré-matrícula não encontrada." };
      }

      await matriculaService.criarMatriculaDireta(pre);

      // 🧹 Remove pré-matrícula antiga
      await preMatriculasRepository.deletar(id, organizacaoId);
      logger.info(
        `[preMatriculasService] org ${organizacaoId} - pré-matrícula ${id} aprovada e removida após criação de matrícula`
      );
    }

    // ⚠️ Quando rejeitado → exclui foto, registro e envia e-mail
    if (status === "rejeitado") {
      logger.debug(
        `[preMatriculasService] org ${organizacaoId} - status rejeitado → iniciando limpeza e notificação`
      );

      const pre = await preMatriculasRepository.buscarPorId(id, organizacaoId);

      if (!pre) {
        logger.warn(
          `[preMatriculasService] org ${organizacaoId} - pré-matrícula ${id} não encontrada ao rejeitar`
        );
        return { sucesso: false, erro: "Pré-matrícula não encontrada." };
      }

      // 🧹 1. Exclui foto do Firebase (original + resized), se existir
      if (pre.foto_url) {
        try {
          // 🔍 Extrai caminho da URL salva
          const filePath = decodeURIComponent(
            pre.foto_url.split(`${bucket.name}/`)[1].split("?")[0]
          );

          // Nome base (sem prefixo do resize)
          const nomeArquivo = filePath.split("/").pop();

          // Caminhos possíveis (completo para todos os formatos conhecidos)
          const baseDir = "fotos-perfil/pre-matriculas";
          const candidatos = [
            `${baseDir}/${nomeArquivo}`, // original
            `${baseDir}/400x400_${nomeArquivo}`, // prefixo antigo
            `fotos-perfil-resized/400x400_${nomeArquivo}`, // raiz antiga
            `${baseDir}/fotos-perfil-resized/${nomeArquivo}`, // ✅ caminho atual (redimensionada dentro da pasta)
            `${baseDir}/fotos-perfil-resized/${nomeArquivo.replace(".jpg", "_400x400.jpg")}`, // ✅ variação com sufixo
          ];

          logger.debug(
            `[preMatriculasService] Tentando deletar possíveis caminhos:`
          );
          for (const c of candidatos) logger.debug(`→ ${c}`);

          // 🧹 Deleta todos silenciosamente (mesmo se não existirem)
          await Promise.allSettled(
            candidatos.map((path) => bucket.file(path).delete())
          );

          logger.info(
            `[preMatriculasService] org ${organizacaoId} - fotos removidas do Firebase (${nomeArquivo})`
          );
        } catch (err) {
          logger.warn(
            `[preMatriculasService] org ${organizacaoId} - falha ao excluir fotos do Firebase (${id}): ${err.message}`
          );
        }
      }

      // 🧹 2. Remove registro da tabela
      await preMatriculasRepository.deletar(id, organizacaoId);
      logger.info(
        `[preMatriculasService] org ${organizacaoId} - pré-matrícula ${id} removida do banco após rejeição`
      );

      // 📧 3. Envia e-mail de recusa
      if (pre.email) {
        await matriculaService.enviarEmailRecusaMatricula({
          nome: pre.nome,
          email: pre.email,
          organizacao_id: pre.organizacao_id,
        });
        logger.info(
          `[preMatriculasService] org ${organizacaoId} - e-mail de recusa enviado com sucesso (pré ${id})`
        );
      } else {
        logger.warn(
          `[preMatriculasService] org ${organizacaoId} - pré ${id} sem e-mail, recusa não enviada`
        );
      }
    }

    return { sucesso: true, mensagem: `Status atualizado para ${status}` };
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
