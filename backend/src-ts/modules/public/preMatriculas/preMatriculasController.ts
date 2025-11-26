import { Request, Response } from "express";
import preMatriculasService from "./preMatriculasService";
import matriculaService from "../../matricula/matriculaService";
import * as organizacaoService from "../../shared/organizacoes/organizacaoService";
import logger from "../../../utils/logger";

class PreMatriculasController {
  async criarPreMatricula(req: Request, res: Response) {
    try {
      if (req.params.slug) {
        req.body.slug = req.params.slug;
        logger.debug(
          `[preMatriculasController] Slug detectado na rota: ${req.params.slug}`
        );
      }

      const dados = req.body;
      const usuario = (req as any).usuario || (req as any).user;

      if (usuario?.organizacao_id) {
        dados.organizacao_id = usuario.organizacao_id;
      } else {
        dados.organizacao_id = req.body.organizacao_id;
      }

      if (!dados.organizacao_id && !dados.slug) {
        return res
          .status(400)
          .json({ error: "Organização não informada ou inválida." });
      }

      logger.info(
        `[preMatriculasController] Nova pré-matrícula recebida (${dados.organizacao_id ? "org " + dados.organizacao_id : "via slug"})`
      );

      const resultado = await preMatriculasService.criarPreMatricula(dados);
      return res.status(201).json(resultado);
    } catch (err: any) {
      logger.error(
        "[preMatriculasController] Erro ao criar pré-matrícula:",
        err.message
      );
      return res
        .status(400)
        .json({ error: err.message || "Erro ao criar pré-matrícula." });
    }
  }

  async listarPendentes(req: Request, res: Response) {
    try {
      const usuario = (req as any).usuario || (req as any).user;
      const organizacaoId = Number(usuario?.organizacao_id);

      if (isNaN(organizacaoId)) {
        return res.status(403).json({
          error: "Acesso negado: organização não identificada no token.",
        });
      }

      const lista = await preMatriculasService.listarPendentes(organizacaoId);
      return res.json(lista);
    } catch (err: any) {
      logger.error(
        "[preMatriculasController] Erro ao listar pendentes:",
        err.message
      );
      return res
        .status(400)
        .json({ error: "Erro ao listar pré-matrículas pendentes." });
    }
  }

  async atualizarStatus(req: Request, res: Response) {
    const id = Number(req.params.id);
    const { status } = req.body;
    const organizacao_id = Number((req as any).usuario?.organizacao_id);

    if (isNaN(id)) {
      return res.status(400).json({ message: "ID inválido." });
    }

    if (isNaN(organizacao_id)) {
      return res.status(403).json({
        message: "Organização não identificada no token.",
      });
    }

    try {
      logger.info(
        `[preMatriculasController] org ${organizacao_id} - atualização solicitada da pré ${id} → ${status}`
      );

      const resultado = await preMatriculasService.atualizarStatus(
        id,
        status,
        organizacao_id
      );

      logger.info(
        `[preMatriculasController] org ${organizacao_id} - status ${status} concluído`
      );

      return res.json({
        sucesso: resultado?.sucesso ?? true,
        mensagem:
          resultado?.mensagem ||
          `Status atualizado para ${status} com sucesso.`,
      });
    } catch (err: any) {
      logger.error(
        `[preMatriculasController] org ${organizacao_id} - erro ao atualizar status da pré ${id}:`,
        err.message
      );
      return res.status(500).json({
        sucesso: false,
        mensagem: "Erro ao atualizar status da pré-matrícula.",
        erro: err.message,
      });
    }
  }

  async getGrupo(req: Request, res: Response) {
    try {
      const organizacaoId = Number(req.params.organizacaoId);

      if (isNaN(organizacaoId)) {
        return res.status(400).json({ error: "Organização inválida." });
      }

      const grupo =
        await preMatriculasService.buscarGrupoPorOrganizacaoId(organizacaoId);

      return res.json({ grupo });
    } catch (err: any) {
      logger.error(
        "[preMatriculasController] Erro ao buscar grupo:",
        err.message
      );
      return res.status(400).json({ error: "Erro ao buscar grupo." });
    }
  }

  async detectarTurmaPorIdade(req: Request, res: Response) {
    try {
      const { slug, idade } = req.params;

      logger.debug(
        `[preMatriculasController] Detectando turma slug=${slug} idade=${idade}`
      );

      const turma = await preMatriculasService.detectarTurmaPorIdade({
        slug,
        idade: Number(idade),
      });

      return res.json({ data: turma });
    } catch (err: any) {
      logger.error(
        "[preMatriculasController] Erro ao detectar turma:",
        err.message
      );
      return res
        .status(400)
        .json({ error: "Erro ao detectar turma para a idade informada." });
    }
  }

  async listarGraduacoesPorCategoriaPublic(req: Request, res: Response) {
    try {
      const { slug, categoriaId } = req.params;

      logger.debug(
        `[preMatriculasController] Buscando graduações slug=${slug}, categoria=${categoriaId}`
      );

      const graduacoes =
        await preMatriculasService.listarGraduacoesPorCategoriaPublic({
          slug,
          categoriaId,
        });

      return res.json({ data: graduacoes });
    } catch (err: any) {
      logger.error(
        "[preMatriculasController] Erro ao listar graduações públicas:",
        err.message
      );
      return res.status(400).json({
        error: "Erro ao listar graduações para essa categoria.",
      });
    }
  }
  async validarCpf(req: Request, res: Response) {
    try {
      const { cpf, slug } = req.query as { cpf: string; slug: string };

      if (!cpf || !slug) {
        return res.status(400).json({ erro: "CPF e slug são obrigatórios." });
      }

      const organizacao_id = await organizacaoService.resolverIdPorSlug(slug);

      if (!organizacao_id) {
        return res
          .status(404)
          .json({ erro: "Organização não encontrada pelo slug." });
      }

      const resultado = await preMatriculasService.validarCpf(
        String(cpf),
        Number(organizacao_id)
      );

      return res.json(resultado);
    } catch (err: any) {
      logger.error(
        "[preMatriculasController] Erro ao validar CPF:",
        err.message
      );
      return res.status(500).json({ erro: "Erro interno ao validar CPF." });
    }
  }
}

export default new PreMatriculasController();
