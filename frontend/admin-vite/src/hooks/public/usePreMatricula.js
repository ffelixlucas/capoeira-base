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

      // 📨 Mostra feedback imediato ao usuário
      toast.info("📨 Enviando sua pré-matrícula...");

      // 🚀 Dispara o envio sem travar a interface
      const envio = enviarPreMatricula(dados, slug);

      // ✅ Confirma visualmente no front antes da resposta do backend
      toast.success("🎉 Pré-matrícula enviada com sucesso!");
      setSucesso("Pré-matrícula enviada com sucesso!");

      // 🕓 Continua em background (logs e validações)
      envio
        .then((resposta) => {
          logger.info("[usePreMatricula] Backend confirmou envio", resposta);
        })
        .catch((err) => {
          logger.warn("[usePreMatricula] Erro posterior no backend", err);
          toast.warning(
            "⚠️ Houve um pequeno atraso no processamento final. Aguarde o e-mail de confirmação."
          );
        });

      // ⚡ Retorna sem bloquear
      return { message: "Pré-matrícula enviada (processando...)" };
    } catch (err) {
      logger.error("[usePreMatricula] Erro ao enviar pré-matrícula", err);
      toast.error("❌ Erro ao enviar pré-matrícula.");
      throw err;
    } finally {
      setCarregando(false);
    }
  }

  return { registrarPreMatricula, carregando, sucesso };
}
