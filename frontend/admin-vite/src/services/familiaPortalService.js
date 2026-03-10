import axios from "axios";

const TOKEN_KEY = "familia.token";

const familiaApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 15000,
});

familiaApi.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export async function loginFamiliaComFirebase(payload) {
  const { data } = await familiaApi.post("/familia/login-firebase", payload);
  return data;
}

export async function buscarPerfilFamilia() {
  const { data } = await familiaApi.get("/familia/me");
  return data;
}

export async function listarAlunosFamilia() {
  const { data } = await familiaApi.get("/familia/alunos");
  return Array.isArray(data) ? data : [];
}

export async function buscarAlunoFamilia(id) {
  const { data } = await familiaApi.get(`/familia/alunos/${id}`);
  return data;
}

export async function atualizarAlunoFamilia(id, payload) {
  const { data } = await familiaApi.put(`/familia/alunos/${id}`, payload);
  return data;
}

export async function uploadFotoAlunoFamilia(alunoId, file) {
  const formData = new FormData();
  formData.append("foto", file);
  formData.append("alunoId", String(alunoId));

  const { data } = await familiaApi.post("/upload/foto/aluno", formData, {
    timeout: 60000,
  });

  return data;
}

export { TOKEN_KEY };
