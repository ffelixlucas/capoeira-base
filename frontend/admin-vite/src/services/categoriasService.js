import api from "./api";

export async function buscarCategorias() {
  const response = await api.get("/categorias");
  return response.data.data;
}

export async function buscarGraduacoesPorCategoria(categoriaId) {
  const response = await api.get(`/graduacoes/categoria/${categoriaId}`);
  return response.data.data;
}
