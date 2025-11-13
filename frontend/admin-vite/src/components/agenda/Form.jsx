import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  criarEventoComImagem,
  atualizarEvento,
} from "../../services/agendaService";
import AgendaPreview from "./Preview";
import { logger } from "../../utils/logger";
import InputBase from "../ui/InputBase";

function AgendaForm({ onCriado, eventoEditando, onLimparEdicao }) {
  const TAMANHOS_CAMISETA = [
    "04",
    "06",
    "08",
    "10",
    "12",
    "14",
    "P",
    "M",
    "G",
    "GG",
    "XG",
  ];

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
    com_inscricao: false,
    valor: "",
    possui_camiseta: false,
    camiseta_tamanhos: [],
  });

  const [mostrarDataFim, setMostrarDataFim] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [imagemPreview, setImagemPreview] = useState(null);

  // 🔹 Carrega dados ao editar
  useEffect(() => {
    if (eventoEditando) {
      try {
        const dataInicio = new Date(eventoEditando.data_inicio);
        const dataFim = eventoEditando.data_fim
          ? new Date(eventoEditando.data_fim)
          : null;

        const configuracoes = eventoEditando.configuracoes || {};

        setForm({
          ...eventoEditando,
          data_inicio: dataInicio.toISOString().slice(0, 10),
          hora_inicio: dataInicio.toISOString().slice(11, 16),
          data_fim: dataFim ? dataFim.toISOString().slice(0, 10) : "",
          hora_fim: dataFim ? dataFim.toISOString().slice(11, 16) : "",
          imagem: null,
          possui_camiseta: eventoEditando.possui_camiseta ?? false,
          camiseta_tamanhos: configuracoes.camiseta_tamanhos || [],
          com_inscricao: eventoEditando.com_inscricao ?? false,
          valor: eventoEditando.valor || "",
        });

        setImagemPreview(eventoEditando.imagem_url || null);
        setMostrarDataFim(!!eventoEditando.data_fim);
      } catch (err) {
        logger.error("Erro ao carregar evento:", err);
      }
    } else {
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
        com_inscricao: false,
        valor: "",
        possui_camiseta: false,
        camiseta_tamanhos: [],
      });
      setImagemPreview(null);
      setMostrarDataFim(false);
    }
  }, [eventoEditando]);

  // 🔹 Handle change genérico
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // 🔹 Preview da imagem
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Selecione apenas arquivos de imagem.");
      return;
    }

    setForm((prev) => ({ ...prev, imagem: file }));

    const reader = new FileReader();
    reader.onload = (event) => setImagemPreview(event.target.result);
    reader.readAsDataURL(file);
  };

  // 🔹 Submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.titulo.trim()) {
      toast.warn("Informe o título do evento.");
      return;
    }
    if (!form.data_inicio || !form.hora_inicio) {
      toast.warn("Informe a data e hora de início.");
      return;
    }

    const token = localStorage.getItem("token");
    const data_inicio = `${form.data_inicio} ${form.hora_inicio}:00`;
    const data_fim =
      form.data_fim && form.hora_fim
        ? `${form.data_fim} ${form.hora_fim}:00`
        : null;

    setEnviando(true);
    try {
      if (eventoEditando) {
        const dados = {
          ...form,
          data_inicio,
          data_fim,
          configuracoes: { camiseta_tamanhos: form.camiseta_tamanhos },
        };
        await atualizarEvento(eventoEditando.id, dados, token);
        toast.success("Evento atualizado com sucesso!");
      } else {
        const formData = new FormData();
        Object.entries({
          titulo: form.titulo,
          descricao_curta: form.descricao_curta,
          descricao_completa: form.descricao_completa,
          local: form.local,
          endereco: form.endereco,
          telefone_contato: form.telefone_contato,
          data_inicio,
          com_inscricao: form.com_inscricao ? 1 : 0,
          possui_camiseta: form.possui_camiseta ? 1 : 0,
        }).forEach(([k, v]) => formData.append(k, v));

        if (data_fim) formData.append("data_fim", data_fim);
        if (form.com_inscricao) formData.append("valor", form.valor || 0);
        if (form.imagem) formData.append("imagem", form.imagem);

        formData.append(
          "configuracoes",
          JSON.stringify({ camiseta_tamanhos: form.camiseta_tamanhos || [] })
        );

        await criarEventoComImagem(formData, token);
        toast.success("Evento criado com sucesso!");
      }

      // Reset
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
        com_inscricao: false,
        valor: "",
        possui_camiseta: false,
        camiseta_tamanhos: [],
      });
      setImagemPreview(null);
      setMostrarDataFim(false);
      onCriado?.();
      onLimparEdicao?.();
    } catch (err) {
      logger.error("Erro ao salvar evento:", err);
      toast.error(
        "Erro ao salvar evento. Verifique os campos e tente novamente."
      );
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="w-full bg-white max-h-[90vh] overflow-y-auto px-4 py-6 sm:px-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {eventoEditando ? "✏️ Editar Evento" : "🎉 Criar Novo Evento"}
        </h1>
        <p className="text-gray-600 mt-1 text-sm">
          {eventoEditando
            ? "Atualize as informações e salve as alterações."
            : "Preencha os detalhes para criar um novo evento."}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* 🔹 Informações */}
        <section className="bg-gray-50 rounded-xl p-5 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            📋 Informações Básicas
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Título <span className="text-red-500">*</span>
              </label>
              <InputBase
                name="titulo"
                value={form.titulo}
                onChange={handleChange}
                placeholder="Ex: Batizado Capoeira CN10"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descrição curta
              </label>
              <InputBase
                name="descricao_curta"
                value={form.descricao_curta}
                onChange={handleChange}
                maxLength={120}
                placeholder="Resumo do evento..."
              />
              <p className="text-xs text-gray-500 text-right">
                {form.descricao_curta.length}/120
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descrição completa
              </label>
              <InputBase
                as="textarea"
                rows={4}
                name="descricao_completa"
                value={form.descricao_completa}
                onChange={handleChange}
                placeholder="Detalhes, programação, convidados..."
                className="resize-none"
              />
            </div>
          </div>
        </section>

        {/* 🔹 Local e contato */}
        <section className="bg-gray-50 rounded-xl p-5 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            📍 Local e Contato
          </h2>
          <div className="space-y-3">
            <InputBase
              name="local"
              value={form.local}
              onChange={handleChange}
              placeholder="Nome do local"
            />
            <InputBase
              name="endereco"
              value={form.endereco}
              onChange={handleChange}
              placeholder="Endereço completo"
            />
            <InputBase
              name="telefone_contato"
              value={form.telefone_contato}
              onChange={handleChange}
              placeholder="Telefone / WhatsApp"
            />
          </div>
        </section>

        {/* 🔹 Datas */}
        <section className="bg-gray-50 rounded-xl p-5 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            🗓️ Data e horário
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputBase
              type="date"
              name="data_inicio"
              value={form.data_inicio}
              onChange={handleChange}
              required
            />
            <InputBase
              type="time"
              name="hora_inicio"
              value={form.hora_inicio}
              onChange={handleChange}
              required
            />
          </div>

          {mostrarDataFim ? (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputBase
                  type="date"
                  name="data_fim"
                  value={form.data_fim}
                  onChange={handleChange}
                  min={form.data_inicio}
                />
                <InputBase
                  type="time"
                  name="hora_fim"
                  value={form.hora_fim}
                  onChange={handleChange}
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  setForm((prev) => ({ ...prev, data_fim: "", hora_fim: "" }));
                  setMostrarDataFim(false);
                }}
                className="text-red-600 text-sm underline"
              >
                Remover data final
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setMostrarDataFim(true)}
              className="mt-3 text-blue-600 text-sm underline"
            >
              + Adicionar data final
            </button>
          )}
        </section>

        {/* 🔹 Inscrição */}
        <section className="bg-gray-50 rounded-xl p-5 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            💵 Inscrição
          </h2>

          <div className="flex items-center gap-2 mb-3">
            <input
              type="checkbox"
              id="com_inscricao"
              checked={form.com_inscricao}
              onChange={handleChange}
              name="com_inscricao"
              className="w-5 h-5"
            />
            <label htmlFor="com_inscricao" className="text-sm text-gray-800">
              Evento com inscrição obrigatória
            </label>
          </div>

          {form.com_inscricao && (
            <div className="space-y-3 border-l-2 pl-4 border-blue-200">
              <InputBase
                type="number"
                name="valor"
                placeholder="Valor da inscrição"
                value={form.valor}
                onChange={handleChange}
                min="0"
                step="0.01"
              />

              <div className="flex flex-col gap-2">
                {/* Checkbox principal */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="possui_camiseta"
                    checked={form.possui_camiseta}
                    onChange={handleChange}
                    name="possui_camiseta"
                    className="w-5 h-5"
                  />
                  <label
                    htmlFor="possui_camiseta"
                    className="text-sm text-gray-800"
                  >
                    Evento terá distribuição de camisetas
                  </label>
                </div>

                {/* Seleção de tamanhos */}
                {form.possui_camiseta && (
                  <div className="mt-3">
                    <p className="text-sm font-semibold text-gray-800 mb-1">
                      Selecione os tamanhos disponíveis:
                    </p>
                    <p className="text-xs text-gray-500 mb-3">
                      Os participantes poderão escolher um desses tamanhos ao se
                      inscrever.
                    </p>

                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {TAMANHOS_CAMISETA.map((t) => (
                        <label
                          key={t}
                          className={`text-sm font-medium border rounded-lg px-2 py-1 text-center cursor-pointer transition-colors ${
                            form.camiseta_tamanhos.includes(t)
                              ? "bg-blue-100 border-blue-300 text-blue-700"
                              : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                          }`}
                        >
                          <input
                            type="checkbox"
                            value={t}
                            checked={form.camiseta_tamanhos.includes(t)}
                            onChange={(e) => {
                              const v = e.target.value;
                              setForm((prev) => {
                                const novos = prev.camiseta_tamanhos.includes(v)
                                  ? prev.camiseta_tamanhos.filter(
                                      (x) => x !== v
                                    )
                                  : [...prev.camiseta_tamanhos, v];
                                return { ...prev, camiseta_tamanhos: novos };
                              });
                            }}
                            className="hidden"
                          />
                          {t}
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </section>

        {/* 🔹 Imagem */}
        <section className="bg-gray-50 rounded-xl p-5 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            🖼️ Imagem do evento
          </h2>

          {imagemPreview && (
            <div className="flex justify-center mb-3">
              <div className="relative">
                <img
                  src={imagemPreview}
                  alt="Preview"
                  className="w-48 h-32 object-cover rounded-lg border shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => {
                    setForm((p) => ({ ...p, imagem: null }));
                    setImagemPreview(null);
                  }}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center"
                >
                  ×
                </button>
              </div>
            </div>
          )}

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-5 text-center">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              id="imagem-upload"
              className="hidden"
            />
            <label
              htmlFor="imagem-upload"
              className="cursor-pointer text-sm text-gray-600"
            >
              📷 Clique para {imagemPreview ? "trocar" : "adicionar"} imagem
            </label>
          </div>
        </section>

        {/* 🔹 Ações */}
        <div className="flex gap-3 pt-2">
          {eventoEditando && (
            <button
              type="button"
              onClick={onLimparEdicao}
              className="flex-1 border border-gray-300 rounded-lg py-2 hover:bg-gray-50"
            >
              Cancelar
            </button>
          )}
          <button
            type="submit"
            disabled={enviando}
            className={`flex-1 py-2 rounded-lg font-semibold text-white ${
              enviando
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            }`}
          >
            {enviando
              ? "Salvando..."
              : eventoEditando
              ? "Atualizar Evento"
              : "Criar Evento"}
          </button>
        </div>
      </form>

      {/* Preview */}
      <div className="mt-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          👁️ Pré-visualização
        </h2>
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
    </div>
  );
}

export default AgendaForm;
