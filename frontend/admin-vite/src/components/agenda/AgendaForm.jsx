import { useEffect, useState } from "react";
import { criarEvento, atualizarEvento } from "../../services/agendaService";
import AgendaPreview from "./AgendaPreview";

function AgendaForm({ onCriado, eventoEditando, onLimparEdicao }) {
  const [form, setForm] = useState({
    titulo: "",
    descricao_curta: "",
    descricao_completa: "",
    local: "",
    endereco: "",
    telefone_contato: "",
    data_inicio: "",
    hora_inicio: "",
    data_fim: "",
    hora_fim: "",
    imagem_url: ""
  });

  const [mostrarDataFim, setMostrarDataFim] = useState(false);

  useEffect(() => {
    if (eventoEditando) {
      const dataInicio = new Date(eventoEditando.data_inicio);
      const dataFim = eventoEditando.data_fim ? new Date(eventoEditando.data_fim) : null;

      setForm({
        ...eventoEditando,
        data_inicio: dataInicio.toISOString().slice(0, 10),
        hora_inicio: dataInicio.toISOString().slice(11, 16),
        data_fim: dataFim ? dataFim.toISOString().slice(0, 10) : "",
        hora_fim: dataFim ? dataFim.toISOString().slice(11, 16) : ""
      });

      setMostrarDataFim(!!eventoEditando.data_fim);
    }
  }, [eventoEditando]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    const data_inicio = `${form.data_inicio}T${form.hora_inicio}`;
    const data_fim = form.data_fim && form.hora_fim
      ? `${form.data_fim}T${form.hora_fim}`
      : null;

    const dados = {
      ...form,
      data_inicio,
      data_fim
    };

    try {
      if (eventoEditando) {
        await atualizarEvento(eventoEditando.id, dados, token);
      } else {
        await criarEvento(dados, token);
      }

      setForm({
        titulo: "",
        descricao_curta: "",
        descricao_completa: "",
        local: "",
        endereco: "",
        telefone_contato: "",
        data_inicio: "",
        hora_inicio: "",
        data_fim: "",
        hora_fim: "",
        imagem_url: ""
      });
      setMostrarDataFim(false);
      if (onCriado) onCriado();
      if (onLimparEdicao) onLimparEdicao();
    } catch (err) {
      console.error("Erro ao salvar evento:", err);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <form
        onSubmit={handleSubmit}
        className="grid gap-3 bg-white p-4 rounded shadow mb-6"
      >
        <input name="titulo" placeholder="Título" value={form.titulo} onChange={handleChange} className="border p-2" required />
        <input name="descricao_curta" placeholder="Descrição Curta" value={form.descricao_curta} onChange={handleChange} className="border p-2" />
        <textarea name="descricao_completa" placeholder="Descrição Completa" value={form.descricao_completa} onChange={handleChange} className="border p-2" />
        <input name="local" placeholder="Local" value={form.local} onChange={handleChange} className="border p-2" />
        <input name="endereco" placeholder="Endereço" value={form.endereco} onChange={handleChange} className="border p-2" />
        <input name="telefone_contato" placeholder="Telefone/WhatsApp" value={form.telefone_contato} onChange={handleChange} className="border p-2" />

        <div className="grid grid-cols-2 gap-2">
          <input type="date" name="data_inicio" value={form.data_inicio} onChange={handleChange} className="border p-2" required />
          <input type="time" name="hora_inicio" value={form.hora_inicio} onChange={handleChange} className="border p-2" required />
        </div>

        {!mostrarDataFim && (
          <button
            type="button"
            onClick={() => setMostrarDataFim(true)}
            className="text-blue-600 underline text-sm self-start"
          >
            + Adicionar data final
          </button>
        )}

        {mostrarDataFim && (
          <div className="grid grid-cols-2 gap-2">
            <input type="date" name="data_fim" value={form.data_fim} onChange={handleChange} className="border p-2" />
            <input type="time" name="hora_fim" value={form.hora_fim} onChange={handleChange} className="border p-2" />
          </div>
        )}

        <input name="imagem_url" placeholder="URL da imagem/banner" value={form.imagem_url} onChange={handleChange} className="border p-2" />
        <button type="submit" className="bg-green-600 text-white py-2 rounded">
          {eventoEditando ? "Atualizar Evento" : "Salvar Evento"}
        </button>
      </form>

      <AgendaPreview
        evento={{
          ...form,
          data_inicio: form.data_inicio && form.hora_inicio
            ? `${form.data_inicio}T${form.hora_inicio}`
            : "",
          data_fim: form.data_fim && form.hora_fim
            ? `${form.data_fim}T${form.hora_fim}`
            : ""
        }}
      />
    </div>
  );
}

export default AgendaForm;
