import preMatriculasRepository from "./preMatriculasRepository";
import preMatriculasGraduacoesRepository from "./preMatriculasGraduacoesRepository";
import matriculaService from "../../matricula/matriculaService";
import emailService from "../../../services/emailService";
import * as notificacaoService from "../../notificacaoDestinos/notificacaoDestinosService";
import { db } from "../../../database/connection";
import  logger  from "../../../utils/logger";
import bucket from "../../../config/firebase";
import * as organizacaoService from "../../shared/organizacoes/organizacaoService";
import { gerarEmailPreMatriculaAdmin } from "../../../services/templates/preMatriculaAdmin";
import { gerarEmailPreMatriculaAluno } from "../../../services/templates/preMatriculaAluno";


logger.debug(`[preMatriculasService] Bucket em uso: ${bucket.name}`);

class PreMatriculasService {
  async criarPreMatricula(dados: any) {
    try {
      logger.info("[preMatriculasService] Recebendo solicitação de pré-matrícula");

      if (dados.slug && !dados.organizacao_id) {
        const orgId = await organizacaoService.resolverIdPorSlug(dados.slug);
        dados.organizacao_id = orgId;
      }

      if (!dados.nome || !dados.nascimento || !dados.cpf || !dados.email) {
        throw new Error("Campos obrigatórios não preenchidos.");
      }

      if (!dados.organizacao_id) {
        throw new Error("Organização não informada ou inválida.");
      }

      dados.cpf = dados.cpf.replace(/\D/g, "");
      dados.email = dados.email.toLowerCase().trim();
      dados.telefone_aluno = dados.telefone_aluno?.replace(/\D/g, "") || null;
      dados.telefone_responsavel = dados.telefone_responsavel?.replace(/\D/g, "") || null;
      dados.responsavel_documento =
        dados.responsavel_documento?.replace(/\D/g, "") || null;
      dados.autorizacao_imagem = dados.autorizacao_imagem ? 1 : 0;
      dados.aceite_lgpd = dados.aceite_lgpd ? 1 : 0;
      dados.endereco = dados.endereco?.trim() || null;

      if (dados.grupo_personalizado) {
        dados.grupo_origem = dados.grupo_personalizado;
      }

      dados.ja_treinou =
        dados.ja_treinou === "sim" || dados.ja_treinou === "nao"
          ? dados.ja_treinou
          : "nao";

      let fotoUrl: string | null = null;

      if (dados.imagemBase64) {
        try {
          const base64Data = dados.imagemBase64.split(",")[1];
          const buffer = Buffer.from(base64Data, "base64");
          const nomeArquivo = `${Date.now()}_${dados.cpf}.jpg`;

          const destinoOriginal = `fotos-perfil/pre-matriculas/${nomeArquivo}`;
          const fileOriginal = bucket.file(destinoOriginal);

          await fileOriginal.save(buffer, { contentType: "image/jpeg" });

          const LABEL = process.env.RESIZED_LABEL || "400x400";
          const baseDir = "fotos-perfil/pre-matriculas";
          const resizedSub = `${baseDir}/fotos-perfil-resized`;
          const baseName = nomeArquivo.replace(/\.(jpe?g|png|webp)$/i, "");
          const ext = nomeArquivo.match(/\.(jpe?g|png|webp)$/i)?.[0] || ".jpg";

          const candidatos = [
            `${resizedSub}/${baseName}_${LABEL}${ext}`,
            `${baseDir}/${baseName}_${LABEL}${ext}`,
            `${baseDir}/${LABEL}_${nomeArquivo}`,
          ];

          let caminhoResizedEncontrado: string | null = null;

          for (let tentativa = 0; tentativa < 20 && !caminhoResizedEncontrado; tentativa++) {
            for (const path of candidatos) {
              const [exists] = await bucket.file(path).exists();
              if (exists) caminhoResizedEncontrado = path;
            }
            if (!caminhoResizedEncontrado) {
              await new Promise((r) => setTimeout(r, 1000));
            }
          }

          if (caminhoResizedEncontrado) {
            const [url] = await bucket.file(caminhoResizedEncontrado).getSignedUrl({
              action: "read",
              expires: "03-01-2030",
            });
            fotoUrl = url;
            dados.foto_url = url;
            await fileOriginal.delete().catch(() => {});
          } else {
            const [urlOriginal] = await fileOriginal.getSignedUrl({
              action: "read",
              expires: "03-01-2030",
            });
            fotoUrl = urlOriginal;
            dados.foto_url = urlOriginal;
          }
        } catch (err: any) {
          logger.error("[preMatriculasService] Falha ao enviar imagem:", err.message);
        }
      }

      const cpfDuplicado = await preMatriculasRepository.verificarCpfExistente(
        dados.cpf,
        dados.organizacao_id
      );

      if (cpfDuplicado) {
        throw new Error("Já existe uma pré-matrícula com este CPF nesta organização.");
      }

      const cpfEmAluno = await preMatriculasRepository.verificarCpfEmAlunos(
        dados.cpf,
        dados.organizacao_id
      );

      if (cpfEmAluno) {
        throw new Error("Este CPF já está matriculado. Não é possível criar nova pré-matrícula.");
      }

      const id = await preMatriculasRepository.criarPreMatricula({
        ...dados,
        foto_url: fotoUrl,
      });

      const resposta = {
        message: "Pré-matrícula enviada com sucesso! Aguarde confirmação por e-mail.",
        id,
        foto_url: fotoUrl,
      };

      (async () => {
        try {
          const orgInfo = await preMatriculasRepository.buscarGrupoPorOrganizacaoId(
            dados.organizacao_id
          );

          const nomeInstituicao =
            orgInfo?.nome_fantasia || orgInfo?.nome || "Capoeira Base";

          await emailService.enviarEmailCustom({
            to: dados.email,
            subject: "Pré-matrícula recebida",
            html: gerarEmailPreMatriculaAluno({
              ...dados,
              nome_fantasia: nomeInstituicao,
            }),
          });

          const emailsAdmin =
            (await notificacaoService.getEmails(
              dados.organizacao_id ?? null,
              "matricula"
            )) || [];

          const preCompleta = await preMatriculasRepository.buscarPorId(
            id,
            dados.organizacao_id
          );

          for (const email of emailsAdmin) {
            await emailService.enviarEmailCustom({
              to: email,
              subject: `Nova pré-matrícula pendente (${preCompleta.nome})`,
              html: gerarEmailPreMatriculaAdmin(preCompleta),
            });
          }
        } catch (err: any) {
          logger.error("[preMatriculasService] Erro no envio assíncrono de e-mails:", err.message);
        }
      })();

      return resposta;

    } catch (err: any) {
      logger.error("[preMatriculasService] Erro ao criar pré-matrícula:", err.message);
      throw err;
    }
  }

  async validarCpf(cpf: string, organizacao_id: number) {
    const cpfLimpo = cpf.replace(/\D/g, "");
  
    const cpfDuplicado = await preMatriculasRepository.verificarCpfExistente(
      cpfLimpo,
      organizacao_id
    );
  
    if (cpfDuplicado) {
      return {
        existe: true,
        tipo: "pre-matricula",
        mensagem: "Já existe uma pré-matrícula com este CPF.",
      };
    }
  
    const cpfEmAluno = await preMatriculasRepository.verificarCpfEmAlunos(
      cpfLimpo,
      organizacao_id
    );
  
    if (cpfEmAluno) {
      return {
        existe: true,
        tipo: "aluno",
        mensagem: "CPF já cadastrado para um aluno desta organização.",
      };
    }
  
    return { existe: false };
  }
  

  async listarPendentes(organizacaoId: number) {
    return preMatriculasRepository.listarPendentes(organizacaoId);
  }

  async buscarGrupoPorOrganizacaoId(organizacaoId: number) {
    try {
      return await preMatriculasRepository.buscarGrupoPorOrganizacaoId(
        organizacaoId
      );
    } catch (err: any) {
      logger.error(
        "[preMatriculasService] Erro ao buscar grupo por organização:",
        err.message
      );
      throw err;
    }
  }
  

  async atualizarStatus(id: number, status: string, organizacaoId: number) {
    await preMatriculasRepository.atualizarStatus(id, status, organizacaoId);

    if (status === "aprovado") {
      const pre = await preMatriculasRepository.buscarPorId(id, organizacaoId);
      if (!pre) return { sucesso: false, erro: "Pré-matrícula não encontrada." };

      await matriculaService.criarMatriculaDireta(pre);
      await preMatriculasRepository.deletar(id, organizacaoId);
    }

    if (status === "rejeitado") {
      const pre = await preMatriculasRepository.buscarPorId(id, organizacaoId);
      if (!pre) return { sucesso: false, erro: "Pré-matrícula não encontrada." };

      if (pre.foto_url) {
        const match = pre.foto_url.match(/fotos-perfil\/pre-matriculas\/([^?]+)/);
        if (match && match[1]) {
          const caminho = `fotos-perfil/pre-matriculas/${match[1]}`;
          await bucket.file(caminho).delete().catch(() => {});
        }
      }

      await preMatriculasRepository.deletar(id, organizacaoId);

      if (pre.email) {
        await matriculaService.enviarEmailRecusaMatricula({
          nome: pre.nome,
          email: pre.email,
          organizacao_id: pre.organizacao_id,
        });
      }
    }

    return { sucesso: true, mensagem: `Status atualizado para ${status}` };
  }

  async buscarPorId(id: number, organizacao_id: number) {
    return preMatriculasRepository.buscarPorId(id, organizacao_id);
  }

  async detectarTurmaPorIdade(payload: { slug: string; idade: number }) {
    const { slug, idade } = payload;

    const organizacaoId = await organizacaoService.resolverIdPorSlug(slug);
    if (!organizacaoId) throw new Error("Organização não encontrada pelo slug.");

    return preMatriculasRepository.buscarTurmaPorIdade(organizacaoId, idade);
  }

  async listarGraduacoesPorCategoriaPublic(payload: {
    slug: string;
    categoriaId: string;
  }) {
    const { slug, categoriaId } = payload;

    const organizacaoId = await organizacaoService.resolverIdPorSlug(slug);
    if (!organizacaoId) throw new Error("Organização não encontrada pelo slug.");

    return preMatriculasGraduacoesRepository.listarGraduacoesPublic({
      categoriaId,
      organizacaoId,
    });
  }
}

export default new PreMatriculasService();
