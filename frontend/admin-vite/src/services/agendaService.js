import api from './api';
import logger from '../utils/logger';

/* ============================
   ROTAS PÚBLICAS (somente leitura)
============================ */
export async function listarEventosPublicos(slug) {
  try {
    const endpoint = slug
      ? `/public/agenda?slug=${slug}`
      : "/public/agenda";

    const { data } = await api.get(endpoint);
    return data.data || [];
  } catch (error) {
    console.error("[listarEventosPublicos] Erro ao buscar eventos:", error);
    return [];
  }
}


// 🔹 Busca evento público por ID e slug (multi-org seguro)
export const buscarEventoPublicoPorId = async (id, slug) => {
  try {
    const { data } = await api.get(`/public/agenda/${id}?slug=${slug}`);
    console.log("[DEBUG AGENDA SERVICE] Evento público carregado:", data);
    return data;
  } catch (error) {
    console.error("[AGENDA SERVICE] Erro ao buscar evento público:", error);
    throw error;
  }
};


/* ============================
   ROTAS ADMIN (mantidas 100% como estavam)
============================ */
export async function listarEventos() {
  logger.log("📡 Chamando backend /api/agenda...");
  try {
    const token = localStorage.getItem("token");
    const orgAtiva = JSON.parse(localStorage.getItem("organizacaoAtiva") || "{}");

    // tenta pegar slug da org ativa (multi-org)
    const slug = orgAtiva?.slug || localStorage.getItem("slug") || null;

    const response = await api.get("/agenda", {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      params: slug ? { slug } : {}, // manda slug só se existir
    });

    logger.log("✅ Resposta bruta da API:", response);
    return response.data?.data || [];
  } catch (error) {
    logger.warn("⚠️ Erro na chamada /api/agenda:", error.response?.data || error.message);
    throw error;
  }
}



export const buscarEventoPorId = async (id) => {
  const response = await api.get(`/agenda/${id}`);
  return response.data;
};

export const criarEvento = async (dados, token) => {
  const response = await api.post('/agenda', dados, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const criarEventoComImagem = async (formData, token) => {
  const response = await api.post('/agenda/upload-imagem', formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

export const excluirEvento = async (id, token) => {
  const response = await api.delete(`/agenda/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const atualizarEvento = async (id, dados, token) => {
  const response = await api.put(`/agenda/${id}`, dados, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const atualizarStatusEvento = async (id, status, token) => {
  const resp = await api.put(`/agenda/${id}/status`, { status }, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return resp.data;
};

export const arquivarEvento = async (id, token) => {
  const resp = await api.put(`/agenda/${id}/arquivar`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return resp.data;
};
