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
import { User, Phone, Home, Calendar, Award, Users, Heart, GraduationCap } from "lucide-react";

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
   🔹 FORM VISUALMENTE MELHORADO
  ------------------------------------------------------------- */
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* CABEÇALHO */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-xl border border-indigo-100">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <User className="h-6 w-6 text-indigo-600" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-lg">
              {alunoParaEdicao ? "Editar Aluno" : "Novo Aluno"}
            </h3>
            <p className="text-sm text-gray-600">
              {alunoParaEdicao ? "Atualize os dados do aluno" : "Preencha os dados para cadastrar um novo aluno"}
            </p>
          </div>
        </div>
      </div>

      {/* INFORMAÇÕES PESSOAIS */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <User className="h-5 w-5 text-gray-500" />
          <h4 className="font-semibold text-gray-800">Informações Pessoais</h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* NOME */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome completo *
            </label>
            <InputBase 
              name="nome" 
              value={form.nome} 
              onChange={handleChange}
              className="w-full"
              placeholder="Digite o nome completo"
            />
            <p className="text-xs text-gray-500 mt-1">
              Nome que aparecerá em chamadas e certificados.
            </p>
          </div>

          {/* APELIDO */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Apelido
            </label>
            <InputBase 
              name="apelido" 
              value={form.apelido} 
              onChange={handleChange}
              placeholder="Nome de roda ou apelido"
            />
          </div>

          {/* NASCIMENTO */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Data de nascimento *
            </label>
            <InputBase
              type="date"
              name="nascimento"
              value={form.nascimento}
              onChange={handleChange}
            />
          </div>
        </div>
      </div>

      {/* CONTATO */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Phone className="h-5 w-5 text-gray-500" />
          <h4 className="font-semibold text-gray-800">Contato</h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* TELEFONE ALUNO */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Telefone do aluno
            </label>
            <InputBase
              name="telefone_aluno"
              value={form.telefone_aluno}
              onChange={handleChange}
              placeholder="(00) 00000-0000"
            />
          </div>

          {/* ENDEREÇO */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
              <Home className="h-4 w-4" />
              Endereço
            </label>
            <InputBase
              name="endereco"
              value={form.endereco}
              onChange={handleChange}
              placeholder="Rua, número, bairro, cidade"
            />
            <p className="text-xs text-gray-500 mt-1">
              Apenas referência interna. Não é obrigatório.
            </p>
          </div>
        </div>
      </div>

      {/* RESPONSÁVEL - apenas se menor */}
      {!maior && (
        <div className="space-y-4 bg-amber-50 p-4 rounded-xl border border-amber-100">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-amber-100 rounded-md">
              <User className="h-4 w-4 text-amber-700" />
            </div>
            <h4 className="font-semibold text-amber-800">Responsável Legal</h4>
            <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full font-medium">
              Menor de idade
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-amber-700 mb-1">
                Telefone do responsável *
              </label>
              <InputBase
                name="telefone_responsavel"
                value={form.telefone_responsavel}
                onChange={handleChange}
                placeholder="(00) 00000-0000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-amber-700 mb-1">
                Nome do responsável *
              </label>
              <InputBase
                name="nome_responsavel"
                value={form.nome_responsavel}
                onChange={handleChange}
                placeholder="Nome completo do responsável"
              />
            </div>
          </div>
        </div>
      )}

      {/* INFORMAÇÕES ESPORTIVAS */}
      <div className="space-y-4">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* CATEGORIA */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Categoria *
            </label>
            <InputBase
              as="select"
              name="categoria_id"
              value={form.categoria_id}
              onChange={handleChange}
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
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              Graduação
            </label>
            <InputBase
              as="select"
              name="graduacao_id"
              value={form.graduacao_id}
              onChange={handleChange}
            >
              <option value="">Selecione uma graduação...</option>
              {graduacoes.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.nome}
                </option>
              ))}
            </InputBase>
            <p className="text-xs text-gray-500 mt-1">
              Corda atual do aluno.
            </p>
          </div>

          {/* TURMA */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Turma *
            </label>
            <InputBase
              as="select"
              name="turma_id"
              value={form.turma_id}
              onChange={handleChange}
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
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Heart className="h-5 w-5 text-gray-500" />
          <h4 className="font-semibold text-gray-800">Observações Médicas</h4>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Informações importantes de saúde
          </label>
          <InputBase
            as="textarea"
            name="observacoes_medicas"
            value={form.observacoes_medicas}
            onChange={handleChange}
            rows={3}
            placeholder="Restrições, alergias, medicações ou outras observações importantes..."
            className="resize-none"
          />
          <p className="text-xs text-gray-500 mt-1">
            Essas informações são importantes para a segurança do aluno durante as atividades.
          </p>
        </div>
      </div>

      {/* BOTÃO */}
      <div className="pt-4 border-t">
        <button
          type="submit"
          disabled={salvando}
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 shadow-sm hover:shadow disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {salvando ? (
            <>
              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Salvando...
            </>
          ) : alunoParaEdicao ? (
            "Salvar Alterações"
          ) : (
            "Cadastrar Aluno"
          )}
        </button>

        <p className="text-xs text-center text-gray-500 mt-3">
          Campos marcados com * são obrigatórios
        </p>
      </div>
    </form>
  );
}