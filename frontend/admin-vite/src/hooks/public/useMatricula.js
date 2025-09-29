import { useState } from "react";
import { enviarMatricula } from "../../services/public/matriculaPublicService";
import { toast } from "react-toastify";
import { logger } from "../../utils/logger";

/**
 * Hook para gerenciar matrícula pública
 */
export function useMatricula() {
  const [carregando, setCarregando] = useState(false);
  const [sucesso, setSucesso] = useState(null);

  async function registrarMatricula(dados) {
    try {
      setCarregando(true);
      setSucesso(null);

      logger.info("[useMatricula] Enviando matrícula", dados);

      const resposta = await enviarMatricula(dados);

      logger.info("[useMatricula] Matrícula criada com sucesso", resposta);

      setSucesso(resposta.message || "Matrícula enviada com sucesso!");
      toast.success("Matrícula recebida, aguarde aprovação.");
      return resposta;
    } catch (err) {
      logger.error("[useMatricula] Erro ao enviar matrícula", err);
      toast.error(err.message);
      throw err;
    } finally {
      setCarregando(false);
    }
  }

  return { registrarMatricula, carregando, sucesso };
}
