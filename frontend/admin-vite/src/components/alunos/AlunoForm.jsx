import { useEffect, useState } from "react";
import { criarAluno, editarAluno } from "../../services/alunoService";
import { useTurmas } from "../../hooks/useTurmas";
import { toast } from "react-toastify";

export default function AlunoForm({ onCriado, aluno }) {
  const { turmas, carregando: carregandoTurmas } = useTurmas();

  const [form, setForm] = useState({
    nome: "",
    apelido: "",
    nascimento: "",
    telefone_responsavel: "",
    nome_responsavel: "",
    endereco: "",
    graduacao: "",
    observacoes_medicas: "",
    turma_id: "",
  });

  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (aluno) {
      setForm({
        nome: aluno.nome || "",
        apelido: aluno.apelido || "",
        nascimento: aluno.nascimento?.slice(0, 10) || "",
        telefone_responsavel: aluno.telefone_responsavel || "",
        nome_responsavel: aluno.nome_responsavel || "",
        endereco: aluno.endereco || "",
        graduacao: aluno.graduacao || "",
        observacoes_medicas: aluno.observacoes_medicas || "",
        turma_id: aluno.turma_id || "",
      });
    }
  }, [aluno]);

  const inputBase =
    "w-full px-3 py-2 rounded-md bg-cor-clara text-cor-escura placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-cor-primaria";

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.nome || !form.turma_id) {
      toast.warn("Preencha os campos obrigatórios");
      return;
    }

    try {
      setSalvando(true);
      const dadosSanitizados = Object.fromEntries(
        Object.entries(form).map(([key, value]) => [key, value === "" ? null : value])
      );

      if (aluno) {
        await editarAluno(aluno.id, dadosSanitizados);
        toast.success("Aluno atualizado com sucesso!");
      } else {
        await criarAluno(dadosSanitizados);
        toast.success("Aluno cadastrado com sucesso!");
      }

      onCriado?.();
    } catch (err) {
      toast.error("Erro ao salvar aluno");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-cor-secundaria rounded-xl p-4 shadow space-y-3 max-w-md mx-auto text-cor-texto"
    >
      <h2 className="text-lg font-bold text-center text-cor-titulo">
        {aluno ? "Editar Aluno" : "Cadastrar Aluno"}
      </h2>

      <input
        type="text"
        name="nome"
        placeholder="Nome completo *"
        value={form.nome}
        onChange={handleChange}
        className={inputBase}
      />
      <input
        type="text"
        name="apelido"
        placeholder="Apelido"
        value={form.apelido}
        onChange={handleChange}
        className={inputBase}
      />
      <input
        type="date"
        name="nascimento"
        value={form.nascimento}
        onChange={handleChange}
        className={inputBase}
      />
      <input
        type="text"
        name="telefone_responsavel"
        placeholder="Telefone do responsável"
        value={form.telefone_responsavel}
        onChange={handleChange}
        className={inputBase}
      />
      <input
        type="text"
        name="nome_responsavel"
        placeholder="Nome do responsável"
        value={form.nome_responsavel}
        onChange={handleChange}
        className={inputBase}
      />
      <input
        type="text"
        name="endereco"
        placeholder="Endereço"
        value={form.endereco}
        onChange={handleChange}
        className={inputBase}
      />
      <input
        type="text"
        name="graduacao"
        placeholder="Graduação (corda)"
        value={form.graduacao}
        onChange={handleChange}
        className={inputBase}
      />
      <textarea
        name="observacoes_medicas"
        placeholder="Observações médicas"
        value={form.observacoes_medicas}
        onChange={handleChange}
        className={inputBase}
      ></textarea>
      <select
        name="turma_id"
        value={form.turma_id}
        onChange={handleChange}
        className={inputBase}
        required
      >
        <option value="">Selecione a turma *</option>
        {carregandoTurmas ? (
          <option>Carregando...</option>
        ) : (
          turmas.map((turma) => (
            <option key={turma.id} value={turma.id}>
              {turma.nome} ({turma.faixa_etaria})
            </option>
          ))
        )}
      </select>

      <button
        type="submit"
        disabled={salvando}
        className="w-full bg-cor-primaria hover:bg-cor-destaque text-cor-escura font-semibold rounded-md py-2 transition"
      >
        {salvando ? "Salvando..." : aluno ? "Salvar alterações" : "Cadastrar"}
      </button>
    </form>
  );
}
