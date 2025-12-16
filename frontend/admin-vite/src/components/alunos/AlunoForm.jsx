// src/components/alunos/AlunoForm.jsx
import { useEffect, useState } from "react";
import {
  criarAluno,
  editarAluno,
  trocarTurma,
} from "../../services/alunoService";
import api from "../../services/api";
import { useTurmas } from "../../hooks/useTurmas";
import { toast } from "react-toastify";
import InputBase from "../ui/InputBase";
import {
  User,
  Phone,
  Home,
  Calendar,
  Award,
  Users,
  Heart,
  GraduationCap,
} from "lucide-react";

export default function AlunoForm({ alunoParaEdicao, onCriado }) {
  const { turmas } = useTurmas();

  const [categorias, setCategorias] = useState([]);
  const [graduacoes, setGraduacoes] = useState([]);
  const [form, setForm] = useState({
    nome: "",
    apelido: "",
    nascimento: "",
    telefone_aluno: "",
    telefone_responsavel: "",
    nome_responsavel: "",
    endereco: "",
    categoria_id: "",
    graduacao_id: "",
    observacoes_medicas: "",
    turma_id: "",
    fotoBase64: "",
  });

  const [salvando, setSalvando] = useState(false);

  /* -------------------------------------------------------------
   🔹 Determinar se é maior de idade
  ------------------------------------------------------------- */
  function isMaiorDeIdade(dataNasc) {
    if (!dataNasc) return true;
    const hoje = new Date();
    const nasc = new Date(dataNasc);
    let idade = hoje.getFullYear() - nasc.getFullYear();
    const m = hoje.getMonth() - nasc.getMonth();
    if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) idade--;
    return idade >= 18;
  }

  const maior = isMaiorDeIdade(form.nascimento);

  /* -------------------------------------------------------------
   🔹 1. Carregar categorias
  ------------------------------------------------------------- */
  useEffect(() => {
    async function carregarCategorias() {
      try {
        const res = await api.get("/categorias");
        setCategorias(res.data.data || []);
      } catch {
        toast.error("Erro ao carregar categorias.");
      }
    }
    carregarCategorias();
  }, []);

  /* -------------------------------------------------------------
   🔹 2. Se for edição → preencher
  ------------------------------------------------------------- */
  useEffect(() => {
    if (!alunoParaEdicao) return;

    setForm({
      nome: alunoParaEdicao.nome || "",
      apelido: alunoParaEdicao.apelido || "",
      nascimento: alunoParaEdicao.nascimento?.slice(0, 10) || "",
      telefone_aluno: alunoParaEdicao.telefone_aluno || "",
      telefone_responsavel: alunoParaEdicao.telefone_responsavel || "",
      nome_responsavel: alunoParaEdicao.nome_responsavel || "",
      endereco: alunoParaEdicao.endereco || "",
      categoria_id: alunoParaEdicao.categoria_id || "",
      graduacao_id: alunoParaEdicao.graduacao_id || "",
      observacoes_medicas: alunoParaEdicao.observacoes_medicas || "",
      turma_id: alunoParaEdicao.turma_id || "",
    });
  }, [alunoParaEdicao]);

  /* -------------------------------------------------------------
   🔹 3. Carregar graduações quando escolher categoria
  ------------------------------------------------------------- */
  useEffect(() => {
    async function carregarGraduacoes() {
      if (!form.categoria_id) return;

      try {
        const res = await api.get(`/graduacoes/categoria/${form.categoria_id}`);
        setGraduacoes(res.data.data || []);
      } catch {
        toast.error("Erro ao carregar graduações.");
      }
    }

    carregarGraduacoes();
  }, [form.categoria_id]);

  /* -------------------------------------------------------------
   🔹 Atualização de campos
  ------------------------------------------------------------- */
  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  /* -------------------------------------------------------------
   🔹 Enviar formulário
  ------------------------------------------------------------- */
  async function handleSubmit(e) {
    e.preventDefault();

    if (!form.nome || !form.turma_id || !form.categoria_id) {
      toast.warn("Preencha os campos obrigatórios.");
      return;
    }

    try {
      setSalvando(true);

      const payload = Object.fromEntries(
        Object.entries(form).map(([k, v]) => [k, v === "" ? null : v])
      );

      /* EDITAR */
      if (alunoParaEdicao) {
        await editarAluno(alunoParaEdicao.id, payload);

        if (String(form.turma_id) !== String(alunoParaEdicao.turma_id)) {
          await trocarTurma(alunoParaEdicao.id, form.turma_id);
        }

        toast.success("Aluno atualizado!");
      } else {
        /* CRIAR */
        await criarAluno(payload);
        toast.success("Aluno cadastrado!");
      }

      onCriado?.();
    } catch (err) {
      console.error(err);
      toast.error("Erro ao salvar aluno.");
    } finally {
      setSalvando(false);
    }
  }

  /* -------------------------------------------------------------
   🔹 FORM COMPACTO COM SCROLL FUNCIONAL
  ------------------------------------------------------------- */
  return (
    <div className="max-h-[80vh] flex flex-col">
      {/* ÁREA ROLÁVEL DO FORMULÁRIO */}
      <div className="flex-1 overflow-y-auto p-4">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* INFORMAÇÕES PESSOAIS */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-gray-500" />
              <h4 className="font-semibold text-gray-800 text-sm">
                Informações Pessoais
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* NOME */}
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Nome completo *
                </label>
                <InputBase
                  name="nome"
                  value={form.nome}
                  onChange={handleChange}
                  className="w-full text-sm"
                  placeholder="Digite o nome completo"
                />
              </div>

              {/* APELIDO */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Apelido
                </label>
                <InputBase
                  name="apelido"
                  value={form.apelido}
                  onChange={handleChange}
                  className="text-sm"
                  placeholder="Nome de roda ou apelido"
                />
              </div>

              {/* NASCIMENTO */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Data de nascimento *
                </label>
                <InputBase
                  type="date"
                  name="nascimento"
                  value={form.nascimento}
                  onChange={handleChange}
                  className="text-sm"
                />
              </div>
            </div>
          </div>

          {/* CONTATO */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-gray-500" />
              <h4 className="font-semibold text-gray-800 text-sm">Contato</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* TELEFONE ALUNO */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Telefone do aluno
                </label>
                <InputBase
                  name="telefone_aluno"
                  value={form.telefone_aluno}
                  onChange={handleChange}
                  className="text-sm"
                  placeholder="(00) 00000-0000"
                />
              </div>

              {/* ENDEREÇO */}
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Endereço
                </label>
                <InputBase
                  name="endereco"
                  value={form.endereco}
                  onChange={handleChange}
                  className="text-sm"
                  placeholder="Rua, número, bairro, cidade"
                />
              </div>
            </div>
          </div>

          {/* RESPONSÁVEL - apenas se menor */}
          {!maior && (
            <div className="space-y-3 bg-amber-50 p-3 rounded-lg border border-amber-100">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-amber-700" />
                <h4 className="font-semibold text-amber-800 text-sm">
                  Responsável Legal
                </h4>
                <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-medium">
                  Menor de idade
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-amber-700 mb-1">
                    Telefone do responsável *
                  </label>
                  <InputBase
                    name="telefone_responsavel"
                    value={form.telefone_responsavel}
                    onChange={handleChange}
                    className="text-sm"
                    placeholder="(00) 00000-0000"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-amber-700 mb-1">
                    Nome do responsável *
                  </label>
                  <InputBase
                    name="nome_responsavel"
                    value={form.nome_responsavel}
                    onChange={handleChange}
                    className="text-sm"
                    placeholder="Nome completo do responsável"
                  />
                </div>
              </div>
            </div>
          )}

          {/* INFORMAÇÕES ESPORTIVAS */}
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* CATEGORIA */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Categoria *
                </label>
                <InputBase
                  as="select"
                  name="categoria_id"
                  value={form.categoria_id}
                  onChange={handleChange}
                  className="text-sm"
                >
                  <option value="">Selecione uma categoria...</option>
                  {categorias.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nome}
                    </option>
                  ))}
                </InputBase>
              </div>

              {/* GRADUAÇÃO */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Graduação
                </label>
                <InputBase
                  as="select"
                  name="graduacao_id"
                  value={form.graduacao_id}
                  onChange={handleChange}
                  className="text-sm"
                >
                  <option value="">Selecione uma graduação...</option>
                  {graduacoes.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.nome}
                    </option>
                  ))}
                </InputBase>
              </div>

              {/* TURMA */}
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Turma *
                </label>
                <InputBase
                  as="select"
                  name="turma_id"
                  value={form.turma_id}
                  onChange={handleChange}
                  className="text-sm"
                >
                  <option value="">Selecione uma turma...</option>
                  {turmas.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.nome}
                    </option>
                  ))}
                </InputBase>
              </div>
            </div>
          </div>

          {/* OBSERVAÇÕES MÉDICAS */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-gray-500" />
              <h4 className="font-semibold text-gray-800 text-sm">
                Observações Médicas
              </h4>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Informações importantes de saúde
              </label>
              <InputBase
                as="textarea"
                name="observacoes_medicas"
                value={form.observacoes_medicas}
                onChange={handleChange}
                rows={2}
                placeholder="Restrições, alergias, medicações..."
                className="resize-none text-sm"
              />
            </div>
          </div>

          {/* ESPAÇO PARA O BOTÃO */}
          <div className="h-4"></div>
        </form>
      </div>

      {/* BOTÃO FIXO NA PARTE INFERIOR */}
      <div className="flex-shrink-0 border-t bg-white p-4">
        <button
          type="submit"
          onClick={handleSubmit}
          disabled={salvando}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-4 rounded-lg transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
        >
          {salvando ? (
            <>
              <div className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Salvando...
            </>
          ) : alunoParaEdicao ? (
            "Salvar Alterações"
          ) : (
            "Cadastrar Aluno"
          )}
        </button>
      </div>
    </div>
  );
}
