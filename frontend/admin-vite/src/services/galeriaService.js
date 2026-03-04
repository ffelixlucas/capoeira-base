// galeriaService.js (transição galeria -> noticias)
import api from './api';

const PRIMARY_PATH = '/noticias';
const LEGACY_PATH = '/galeria';

async function requestWithLegacyFallback(config) {
  const suffix = config.url || '';

  try {
    return await api.request({
      ...config,
      url: `${PRIMARY_PATH}${suffix}`,
      meta: { ...(config.meta || {}), suppressWarn: true },
    });
  } catch (error) {
    const status = error?.response?.status;
    if (status !== 404) throw error;

    return api.request({
      ...config,
      url: `${LEGACY_PATH}${suffix}`,
    });
  }
}

export const uploadImagem = async (formData) => {
  const response = await requestWithLegacyFallback({
    method: 'post',
    url: '/upload',
    data: formData,
  });
  return response.data;
};

export const listarImagens = async () => {
  const response = await requestWithLegacyFallback({
    method: 'get',
    url: '',
  });
  return response.data;
};

export const deletarImagem = async (id) => {
  const response = await requestWithLegacyFallback({
    method: 'delete',
    url: `/${id}`,
  });
  return response.data;
};

export const atualizarOrdem = async (lista) => {
  const response = await requestWithLegacyFallback({
    method: 'put',
    url: '/ordem',
    data: { ordem: lista },
  });
  return response.data;
};

export const atualizarNoticia = async (id, payload) => {
  const response = await requestWithLegacyFallback({
    method: 'put',
    url: `/${id}`,
    data: payload,
  });
  return response.data;
};

// compatibilidade legado
export const atualizarLegenda = async (id, legenda) => {
  return atualizarNoticia(id, { legenda });
};
