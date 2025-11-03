import { useState } from "react";
import { enviarPreMatricula } from "../../services/public/preMatriculaPublicService";
import { toast } from "react-toastify";
import { logger } from "../../utils/logger";

/**
 * Hook para gerenciar pré-matrícula pública
 */
export function usePreMatricula() {
  const [carregando, setCarregando] = useState(false);
  const [sucesso, setSucesso] = useState(null);

  async function registrarPreMatricula(dados, slug) {
    try {
      setCarregando(true);
      setSucesso(null);

      logger.info("[usePreMatricula] Enviando pré-matrícula", dados);

      const resposta = await enviarPreMatricula(dados, slug);

      logger.info("[usePreMatricula] Pré-matrícula criada com sucesso", resposta);

      setSucesso(resposta.message || "Pré-matrícula enviada com sucesso!");
      toast.success("Pré-matrícula recebida, aguarde aprovação.");
      return resposta;
    } catch (err) {
      logger.error("[usePreMatricula] Erro ao enviar pré-matrícula", err);
      toast.error(err.message);
      throw err;
    } finally {
      setCarregando(false);
    }
  }

  return { registrarPreMatricula, carregando, sucesso };
}
