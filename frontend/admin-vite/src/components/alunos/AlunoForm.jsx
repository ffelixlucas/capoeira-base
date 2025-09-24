import { useEffect, useState } from "react";
import { criarAluno, editarAluno } from "../../services/alunoService";
import { useTurmas } from "../../hooks/useTurmas";
import { toast } from "react-toastify";
import InputBase from "../ui/InputBase";

export default function AlunoForm({ onCriado, alunoParaEdicao }) {
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
    if (alunoParaEdicao) {
      setForm({
        nome: alunoParaEdicao.nome || "",
        apelido: alunoParaEdicao.apelido || "",
        nascimento: alunoParaEdicao.nascimento?.slice(0, 10) || "",
        telefone_responsavel: alunoParaEdicao.telefone_responsavel || "",
        nome_responsavel: alunoParaEdicao.nome_responsavel || "",
        endereco: alunoParaEdicao.endereco || "",
        graduacao: alunoParaEdicao.graduacao || "",
        observacoes_medicas: alunoParaEdicao.observacoes_medicas || "",
        turma_id: alunoParaEdicao.turma_id || "",
      });
    }
  }, [alunoParaEdicao]);

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

      if (alunoParaEdicao) {
        await editarAluno(alunoParaEdicao.id, dadosSanitizados);
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
    <form onSubmit={handleSubmit} className="space-y-3">
      <InputBase
        type="text"
        name="nome"
        placeholder="Nome completo *"
        value={form.nome}
        onChange={handleChange}
      />
      <InputBase
        type="text"
        name="apelido"
        placeholder="Apelido (se tiver)"
        value={form.apelido}
        onChange={handleChange}
      />
      <InputBase
        type="date"
        name="nascimento"
        value={form.nascimento}
        onChange={handleChange}
      />
      <InputBase
        type="text"
        name="telefone_responsavel"
        placeholder="Telefone do responsável"
        value={form.telefone_responsavel}
        onChange={handleChange}
      />
      <InputBase
        type="text"
        name="nome_responsavel"
        placeholder="Nome do responsável"
        value={form.nome_responsavel}
        onChange={handleChange}
      />
      <InputBase
        type="text"
        name="endereco"
        placeholder="Endereço"
        value={form.endereco}
        onChange={handleChange}
      />
      <InputBase
        type="text"
        name="graduacao"
        placeholder="Graduação (corda)"
        value={form.graduacao}
        onChange={handleChange}
      />
      <InputBase
        as="textarea"
        name="observacoes_medicas"
        placeholder="Observações médicas"
        value={form.observacoes_medicas}
        onChange={handleChange}
      />
      <InputBase
        as="select"
        name="turma_id"
        value={form.turma_id}
        onChange={handleChange}
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
      </InputBase>
    
      <button
        type="submit"
        disabled={salvando}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md py-2 transition"
      >
        {salvando ? "Salvando..." : alunoParaEdicao ? "Salvar alterações" : "Cadastrar"}
      </button>
    </form>
    
  );
}
