// src/services/shared/organizacaoService.js
import axios from "axios";
import { toast } from "react-toastify";
import { logger } from "../../utils/logger";

const API_URL = import.meta.env.VITE_API_URL;

/**
 * 🔹 Service híbrido multi-organização
 * Pode ser usado tanto por módulos públicos (pré-matrícula, inscrições)
 * quanto por módulos administrativos (dashboard, configurações, etc.)
 */
export async function buscarOrganizacaoPorSlug(slug) {
  try {
    const response = await axios.get(`${API_URL}/public/organizacoes/${slug}`);
    logger.info("[organizacaoService] Organização carregada via slug", response.data);
    return response.data;
  } catch (err) {
    logger.error("[organizacaoService] Erro ao buscar organização:", err.message);
    toast.error("Erro ao carregar dados da organização.");
    throw err;
  }
}
