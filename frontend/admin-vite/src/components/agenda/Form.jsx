import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  criarEventoComImagem,
  atualizarEvento,
} from "../../services/agendaService";
import AgendaPreview from "./Preview";
import { logger } from "../../utils/logger";
import InputBase from "../ui/InputBase";

function clampFocus(value, fallback = 50) {
  const parsed = Number(value);
  if (Number.isNaN(parsed)) return fallback;
  return Math.min(100, Math.max(0, parsed));
}

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
    whatsapp_url: "",
    data_inicio: "",
    hora_inicio: "",
    data_fim: "",
    hora_fim: "",
    imagem: null,
    com_inscricao: false,
    inscricao_externa_url: "",
    valor: "",
    possui_camiseta: false,
    camiseta_tamanhos: [],
    imagem_foco_x: 50,
    imagem_foco_y: 50,
  });

  const [mostrarDataFim, setMostrarDataFim] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [imagemPreview, setImagemPreview] = useState(null);
  const [semHorarioInicio, setSemHorarioInicio] = useState(false);
  const [semHorarioFim, setSemHorarioFim] = useState(false);

  const composeDateTime = (date, time) => {
    if (!date) return null;
    const normalizedTime = time && time.trim() ? time.trim() : "00:00";
    return `${date} ${normalizedTime}:00`;
  };

  // 🔹 Carrega dados ao editar
  useEffect(() => {
    if (eventoEditando) {
      try {
        const dataInicio = new Date(eventoEditando.data_inicio);
        const dataFim = eventoEditando.data_fim
          ? new Date(eventoEditando.data_fim)
          : null;
        const horaInicioIso = dataInicio.toISOString().slice(11, 16);
        const semHoraInicio = horaInicioIso === "00:00";
        const horaFimIso = dataFim ? dataFim.toISOString().slice(11, 16) : "";
        const semHoraFim = !horaFimIso || horaFimIso === "00:00";

        const configuracoes = eventoEditando.configuracoes || {};

        setForm({
          ...eventoEditando,
          data_inicio: dataInicio.toISOString().slice(0, 10),
          hora_inicio: semHoraInicio ? "" : horaInicioIso,
          data_fim: dataFim ? dataFim.toISOString().slice(0, 10) : "",
          hora_fim: dataFim && !semHoraFim ? horaFimIso : "",
          imagem: null,
          possui_camiseta: eventoEditando.possui_camiseta ?? false,
          camiseta_tamanhos: configuracoes.camiseta_tamanhos || [],
          inscricao_externa_url: configuracoes.inscricao_externa_url || "",
          com_inscricao: eventoEditando.com_inscricao ?? false,
          valor: eventoEditando.valor || "",
          imagem_foco_x: clampFocus(configuracoes.imagem_foco_x, 50),
          imagem_foco_y: clampFocus(configuracoes.imagem_foco_y, 50),
        });

        setSemHorarioInicio(semHoraInicio);
        setSemHorarioFim(semHoraFim);
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
        whatsapp_url: "",
        data_inicio: "",
        hora_inicio: "",
        data_fim: "",
        hora_fim: "",
        imagem: null,
        com_inscricao: false,
        inscricao_externa_url: "",
        valor: "",
        possui_camiseta: false,
        camiseta_tamanhos: [],
        imagem_foco_x: 50,
        imagem_foco_y: 50,
      });
      setImagemPreview(null);
      setMostrarDataFim(false);
      setSemHorarioInicio(false);
      setSemHorarioFim(false);
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
    if (!form.data_inicio) {
      toast.warn("Informe a data de início.");
      return;
    }

    const token = localStorage.getItem("token");
    const data_inicio = composeDateTime(
      form.data_inicio,
      semHorarioInicio ? "" : form.hora_inicio
    );
    const data_fim = form.data_fim
      ? composeDateTime(form.data_fim, semHorarioFim ? "" : form.hora_fim)
      : null;

    setEnviando(true);
    try {
      if (eventoEditando) {
        const dados = {
          ...form,
          data_inicio,
          data_fim,
          configuracoes: {
            camiseta_tamanhos: form.camiseta_tamanhos,
            inscricao_externa_url: form.inscricao_externa_url?.trim() || "",
            imagem_foco_x: clampFocus(form.imagem_foco_x, 50),
            imagem_foco_y: clampFocus(form.imagem_foco_y, 50),
          },
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
          whatsapp_url: form.whatsapp_url,
          data_inicio,
          com_inscricao: form.com_inscricao ? 1 : 0,
          possui_camiseta: form.possui_camiseta ? 1 : 0,
        }).forEach(([k, v]) => formData.append(k, v));

        if (data_fim) formData.append("data_fim", data_fim);
        if (form.com_inscricao) formData.append("valor", form.valor || 0);
        if (form.imagem) formData.append("imagem", form.imagem);

        formData.append(
          "configuracoes",
          JSON.stringify({
            camiseta_tamanhos: form.camiseta_tamanhos || [],
            inscricao_externa_url: form.inscricao_externa_url?.trim() || "",
            imagem_foco_x: clampFocus(form.imagem_foco_x, 50),
            imagem_foco_y: clampFocus(form.imagem_foco_y, 50),
          })
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
        whatsapp_url: "",
        data_inicio: "",
        hora_inicio: "",
        data_fim: "",
        hora_fim: "",
        imagem: null,
        com_inscricao: false,
        inscricao_externa_url: "",
        valor: "",
        possui_camiseta: false,
        camiseta_tamanhos: [],
        imagem_foco_x: 50,
        imagem_foco_y: 50,
      });
      setImagemPreview(null);
      setMostrarDataFim(false);
      setSemHorarioInicio(false);
      setSemHorarioFim(false);
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
    <div className="w-full bg-white max-h-[90vh] overflow-y-auto px-4 py-6 sm:px-8">
      <div className="mb-6 pb-4 border-b border-slate-200">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          {eventoEditando ? "Editar Evento" : "Criar Evento"}
        </h1>
        <p className="text-slate-600 mt-1 text-sm">
          {eventoEditando
            ? "Atualize as informações e salve as alterações."
            : "Preencha os detalhes para criar um novo evento."}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-2">
        <section className="bg-slate-50 rounded-2xl p-5 border border-slate-200 shadow-sm lg:col-span-2">
          <h2 className="text-base font-bold uppercase tracking-wide text-slate-900 mb-4">
            Informações Básicas
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
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
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Descrição curta
              </label>
              <InputBase
                name="descricao_curta"
                value={form.descricao_curta}
                onChange={handleChange}
                maxLength={120}
                placeholder="Resumo do evento..."
              />
              <p className="text-xs text-slate-500 text-right">
                {form.descricao_curta.length}/120
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
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

        <section className="bg-slate-50 rounded-2xl p-5 border border-slate-200 shadow-sm">
          <h2 className="text-base font-bold uppercase tracking-wide text-slate-900 mb-4">
            Local e Contato
          </h2>
          <div className="space-y-3">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Local
            </label>
            <InputBase
              name="local"
              value={form.local}
              onChange={handleChange}
              placeholder="Nome do local"
            />
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Endereço
            </label>
            <InputBase
              name="endereco"
              value={form.endereco}
              onChange={handleChange}
              placeholder="Endereço completo"
            />
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Telefone de contato
            </label>
            <InputBase
              name="telefone_contato"
              value={form.telefone_contato}
              onChange={handleChange}
              placeholder="Telefone / WhatsApp"
            />
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Link do grupo WhatsApp
            </label>
            <InputBase
              name="whatsapp_url"
              value={form.whatsapp_url}
              onChange={handleChange}
              placeholder="Link do grupo WhatsApp (https://chat.whatsapp.com/...)"
            />
          </div>
        </section>

        <section className="bg-slate-50 rounded-2xl p-5 border border-slate-200 shadow-sm">
          <h2 className="text-base font-bold uppercase tracking-wide text-slate-900 mb-4">
            Data e Horário
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
              disabled={semHorarioInicio}
            />
          </div>
          <div className="mt-3 flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2">
            <input
              type="checkbox"
              id="sem_horario_inicio"
              checked={semHorarioInicio}
              onChange={(e) => {
                const checked = e.target.checked;
                setSemHorarioInicio(checked);
                if (checked) {
                  setForm((prev) => ({ ...prev, hora_inicio: "" }));
                }
              }}
              className="w-4 h-4"
            />
            <label htmlFor="sem_horario_inicio" className="text-sm text-slate-700">
              Sem horário de início (mostra apenas a data)
            </label>
          </div>

          {mostrarDataFim ? (
            <div className="mt-4 p-4 bg-white border border-slate-200 rounded-xl space-y-3">
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
                  disabled={semHorarioFim}
                />
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                <input
                  type="checkbox"
                  id="sem_horario_fim"
                  checked={semHorarioFim}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setSemHorarioFim(checked);
                    if (checked) {
                      setForm((prev) => ({ ...prev, hora_fim: "" }));
                    }
                  }}
                  className="w-4 h-4"
                />
                <label htmlFor="sem_horario_fim" className="text-sm text-slate-700">
                  Sem horário final (mostra apenas a data final)
                </label>
              </div>
              <button
                type="button"
                onClick={() => {
                  setForm((prev) => ({ ...prev, data_fim: "", hora_fim: "" }));
                  setMostrarDataFim(false);
                  setSemHorarioFim(false);
                }}
                className="text-red-600 text-sm underline underline-offset-2"
              >
                Remover data final
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                setMostrarDataFim(true);
                setSemHorarioFim(false);
              }}
              className="mt-3 text-blue-700 text-sm underline underline-offset-2"
            >
              + Adicionar data final
            </button>
          )}
        </section>

        <section className="bg-slate-50 rounded-2xl p-5 border border-slate-200 shadow-sm">
          <h2 className="text-base font-bold uppercase tracking-wide text-slate-900 mb-4">
            Inscrição
          </h2>

          <div className="flex items-center gap-2 mb-3 rounded-lg border border-slate-200 bg-white px-3 py-2">
            <input
              type="checkbox"
              id="com_inscricao"
              checked={form.com_inscricao}
              onChange={handleChange}
              name="com_inscricao"
              className="w-5 h-5"
            />
            <label htmlFor="com_inscricao" className="text-sm text-slate-800">
              Evento com inscrição obrigatória
            </label>
          </div>

          {form.com_inscricao && (
            <div className="space-y-3 border-l-2 pl-4 border-blue-200 bg-white rounded-lg p-3">
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
                    className="text-sm text-slate-800"
                  >
                    Evento terá distribuição de camisetas
                  </label>
                </div>

                {/* Seleção de tamanhos */}
                {form.possui_camiseta && (
                  <div className="mt-3">
                    <p className="text-sm font-semibold text-slate-800 mb-1">
                      Selecione os tamanhos disponíveis:
                    </p>
                    <p className="text-xs text-slate-500 mb-3">
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

          <div className="mt-4 space-y-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Link oficial de inscrição
            </label>
            <InputBase
              type="url"
              name="inscricao_externa_url"
              placeholder="Link oficial de inscricao (ex: https://...)"
              value={form.inscricao_externa_url}
              onChange={handleChange}
            />
            <p className="text-xs text-slate-500">
              Se preenchido, o site usara este link no botao de inscricao.
            </p>
          </div>
        </section>

        <section className="bg-slate-50 rounded-2xl p-5 border border-slate-200 shadow-sm">
          <h2 className="text-base font-bold uppercase tracking-wide text-slate-900 mb-4">
            Imagem do Evento
          </h2>

          {imagemPreview && (
            <div className="mb-4 space-y-4">
              <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-sm">
                <img
                  src={imagemPreview}
                  alt="Preview de recorte do card"
                  className="h-44 w-full object-cover"
                  style={{
                    objectPosition: `${clampFocus(form.imagem_foco_x, 50)}% ${clampFocus(form.imagem_foco_y, 50)}%`,
                  }}
                />
                <div className="absolute inset-0 pointer-events-none border border-white/40 rounded-xl" />
                <button
                  type="button"
                  onClick={() => {
                    setForm((p) => ({ ...p, imagem: null }));
                    setImagemPreview(null);
                  }}
                  className="absolute top-2 right-2 w-7 h-7 bg-red-500/90 hover:bg-red-600 text-white rounded-full text-sm flex items-center justify-center"
                >
                  ×
                </button>
              </div>

              <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-3">
                <div className="flex items-center justify-between">
                  <label htmlFor="imagem_foco_x" className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                    Foco horizontal
                  </label>
                  <span className="text-xs font-medium text-slate-700">
                    {Math.round(clampFocus(form.imagem_foco_x, 50))}%
                  </span>
                </div>
                <input
                  id="imagem_foco_x"
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={clampFocus(form.imagem_foco_x, 50)}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      imagem_foco_x: Number(e.target.value),
                    }))
                  }
                  className="w-full accent-indigo-600"
                />

                <div className="flex items-center justify-between">
                  <label htmlFor="imagem_foco_y" className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                    Foco vertical
                  </label>
                  <span className="text-xs font-medium text-slate-700">
                    {Math.round(clampFocus(form.imagem_foco_y, 50))}%
                  </span>
                </div>
                <input
                  id="imagem_foco_y"
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={clampFocus(form.imagem_foco_y, 50)}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      imagem_foco_y: Number(e.target.value),
                    }))
                  }
                  className="w-full accent-indigo-600"
                />

                <button
                  type="button"
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      imagem_foco_x: 50,
                      imagem_foco_y: 50,
                    }))
                  }
                  className="text-xs font-medium text-indigo-700 hover:text-indigo-900 underline underline-offset-2"
                >
                  Centralizar foco
                </button>
              </div>
            </div>
          )}

          <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center bg-white">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              id="imagem-upload"
              className="hidden"
            />
            <label
              htmlFor="imagem-upload"
              className="cursor-pointer text-sm font-medium text-slate-700"
            >
              Clique para {imagemPreview ? "trocar" : "adicionar"} imagem
            </label>
          </div>
        </section>

        <div className="flex gap-3 pt-2 lg:col-span-2">
          {eventoEditando && (
            <button
              type="button"
              onClick={onLimparEdicao}
              className="flex-1 border border-slate-300 rounded-xl py-2.5 font-medium text-slate-700 hover:bg-slate-100 transition-colors"
            >
              Cancelar
            </button>
          )}
          <button
            type="submit"
            disabled={enviando}
            className={`flex-1 py-2.5 rounded-xl font-semibold text-white transition-colors ${
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

      <div className="mt-8 pt-6 border-t border-slate-200">
        <h2 className="text-base font-bold uppercase tracking-wide text-slate-900 mb-3">
          Pré-visualização
        </h2>
        <AgendaPreview
          evento={{
            ...form,
            data_inicio: form.data_inicio
              ? `${form.data_inicio}T${
                  semHorarioInicio ? "00:00" : form.hora_inicio || "00:00"
                }`
              : "",
            data_fim: form.data_fim
              ? `${form.data_fim}T${
                  semHorarioFim ? "00:00" : form.hora_fim || "00:00"
                }`
              : "",
            configuracoes: {
              camiseta_tamanhos: form.camiseta_tamanhos,
              inscricao_externa_url: form.inscricao_externa_url,
              imagem_foco_x: clampFocus(form.imagem_foco_x, 50),
              imagem_foco_y: clampFocus(form.imagem_foco_y, 50),
            },
          }}
        />
      </div>
    </div>
  );
}

export default AgendaForm;
