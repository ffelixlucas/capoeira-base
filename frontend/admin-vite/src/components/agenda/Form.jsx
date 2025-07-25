import { useEffect, useState } from "react";
import {
  criarEventoComImagem,
  atualizarEvento,
} from "../../services/agendaService";
import AgendaPreview from "./Preview";

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
    imagem: null,
  });

  const [mostrarDataFim, setMostrarDataFim] = useState(false);

  useEffect(() => {
    if (eventoEditando) {
      const dataInicio = new Date(eventoEditando.data_inicio);
      const dataFim = eventoEditando.data_fim
        ? new Date(eventoEditando.data_fim)
        : null;

      setForm({
        ...eventoEditando,
        data_inicio: dataInicio.toISOString().slice(0, 10),
        hora_inicio: dataInicio.toISOString().slice(11, 16),
        data_fim: dataFim ? dataFim.toISOString().slice(0, 10) : "",
        hora_fim: dataFim ? dataFim.toISOString().slice(11, 16) : "",
        imagem: null,
      });

      setMostrarDataFim(!!eventoEditando.data_fim);
    }
  }, [eventoEditando]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    const data_inicio = `${form.data_inicio} ${form.hora_inicio}:00`;
    const data_fim =
      form.data_fim && form.hora_fim
        ? `${form.data_fim} ${form.hora_fim}:00`
        : null;

    try {
      if (eventoEditando) {
        const dados = { ...form, data_inicio, data_fim };
        await atualizarEvento(eventoEditando.id, dados, token);
      } else {
        const formData = new FormData();
        formData.append("titulo", form.titulo);
        formData.append("descricao_curta", form.descricao_curta);
        formData.append("descricao_completa", form.descricao_completa);
        formData.append("local", form.local);
        formData.append("endereco", form.endereco);
        formData.append("telefone_contato", form.telefone_contato);
        formData.append("data_inicio", data_inicio);
        if (data_fim) formData.append("data_fim", data_fim);
        if (form.imagem) formData.append("imagem", form.imagem);

        await criarEventoComImagem(formData, token);
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
        imagem: null,
      });

      setMostrarDataFim(false);
      onCriado?.();
      onLimparEdicao?.();
    } catch (err) {
      console.error("Erro ao salvar evento:", err);
    }
  };

  return (
    <div className="w-full bg-white max-h-screen overflow-y-auto px-2 py-4">
      <form onSubmit={handleSubmit} className="grid gap-3">
        <input
          name="titulo"
          placeholder="Título"
          value={form.titulo}
          onChange={handleChange}
          className="border p-2 bg-white text-black"
          required
        />
        <input
          name="descricao_curta"
          placeholder="Descrição Curta"
          value={form.descricao_curta}
          onChange={handleChange}
          className="border p-2 bg-white text-black"
        />
        <textarea
          name="descricao_completa"
          placeholder="Descrição Completa"
          value={form.descricao_completa}
          onChange={handleChange}
          className="border p-2 bg-white text-black"
        />
        <input
          name="local"
          placeholder="Local"
          value={form.local}
          onChange={handleChange}
          className="border p-2 bg-white text-black"
        />
        <input
          name="endereco"
          placeholder="Endereço"
          value={form.endereco}
          onChange={handleChange}
          className="border p-2 bg-white text-black"
        />
        <input
          name="telefone_contato"
          placeholder="Telefone/WhatsApp"
          value={form.telefone_contato}
          onChange={handleChange}
          className="border p-2 bg-white text-black"
        />

        <div className="grid grid-cols-2 gap-2">
          <input
            type="date"
            name="data_inicio"
            value={form.data_inicio}
            onChange={handleChange}
            className="border p-2 bg-white text-black"
            required
          />
          <input
            type="time"
            name="hora_inicio"
            value={form.hora_inicio}
            onChange={handleChange}
            className="border p-2 bg-white text-black"
            required
          />
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
            <input
              type="date"
              name="data_fim"
              value={form.data_fim}
              onChange={handleChange}
              className="border p-2 bg-white text-black"
            />
            <input
              type="time"
              name="hora_fim"
              value={form.hora_fim}
              onChange={handleChange}
              className="border p-2 bg-white text-black"
            />
          </div>
        )}

        <input
          type="file"
          accept="image/*"
          onChange={(e) =>
            setForm((prev) => ({ ...prev, imagem: e.target.files[0] }))
          }
          className="border p-2 bg-white text-black"
        />

        <button type="submit" className="bg-green-600 text-white py-2 rounded">
          {eventoEditando ? "Atualizar Evento" : "Salvar Evento"}
        </button>
      </form>

      <AgendaPreview
        evento={{
          ...form,
          data_inicio:
            form.data_inicio && form.hora_inicio
              ? `${form.data_inicio}T${form.hora_inicio}`
              : "",
          data_fim:
            form.data_fim && form.hora_fim
              ? `${form.data_fim}T${form.hora_fim}`
              : "",
        }}
      />
    </div>
  );
}

export default AgendaForm;
