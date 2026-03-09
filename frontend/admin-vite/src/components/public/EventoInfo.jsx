import { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import {
  CalendarDays,
  Expand,
  MapPin,
  MessageCircle,
  X,
} from "lucide-react";

function formatarDataHora(dataISO) {
  if (!dataISO) return "Data a definir";
  const data = new Date(dataISO);
  if (Number.isNaN(data.getTime())) return "Data a definir";

  const dataTexto = data.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  const horaTexto = data.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return horaTexto === "00:00" ? dataTexto : `${dataTexto} às ${horaTexto}`;
}

function formatarValor(valor) {
  return Number(valor) > 0 ? `R$ ${Number(valor).toFixed(2)}` : "Gratuita";
}

export default function EventoInfo({ evento }) {
  const [mostrarDetalhes, setMostrarDetalhes] = useState(false);
  const [mostrarImagem, setMostrarImagem] = useState(false);

  if (!evento) return null;

  const whatsappHref = evento.whatsapp_url
    ? evento.whatsapp_url
    : evento.telefone_contato
      ? `https://wa.me/55${evento.telefone_contato.replace(/\D/g, "")}`
      : null;

  const mapsHref = evento.endereco
    ? `https://www.google.com/maps/search/?q=${encodeURIComponent(
        evento.endereco
      )}`
    : null;
  const idadeMinima = Number(evento?.configuracoes?.idade_minima || 0);
  const inscricoesAteLabel = evento.inscricoes_ate
    ? formatarDataHora(evento.inscricoes_ate)
    : null;

  const resumo = evento.descricao_curta || evento.descricao_completa || "";
  const descricaoDetalhada = evento.descricao_completa || resumo;

  return (
    <>
      <section className="overflow-hidden rounded-2xl border border-[rgba(253,245,221,0.12)] bg-[#1d3128] text-[#f8f2dc] shadow-[0_20px_45px_rgba(2,26,19,0.35)]">
        <div className="relative h-52 bg-[#10231b] sm:h-60">
          {evento.imagem_url ? (
            <img
              src={evento.imagem_url}
              alt={evento.titulo}
              className="h-full w-full cursor-zoom-in object-contain"
              onClick={() => setMostrarImagem(true)}
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-[#225843] to-[#17392d]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b241c]/95 via-[#0b241c]/35 to-transparent" />

          <div className="absolute right-3 top-3 flex items-center gap-2">
            {evento.imagem_url && (
              <button
                type="button"
                onClick={() => setMostrarImagem(true)}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/25 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.08em] text-white transition hover:bg-black/40"
              >
                <Expand className="h-3.5 w-3.5" />
                Ampliar
              </button>
            )}
            <span className="px-3 py-1 rounded-full text-[11px] uppercase tracking-[0.12em] font-extrabold bg-[#24f08f]/18 text-[#8fffc8] border border-[#31f39a]/55 shadow-[0_0_12px_rgba(36,240,143,0.45)]">
              Aberto
            </span>
          </div>

          <div className="absolute bottom-3 left-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#0b241c]/85 border border-[#f4cf4e]/45 text-[#f4cf4e] text-[11px] font-bold tracking-[0.08em] uppercase">
              <CalendarDays className="h-3.5 w-3.5" />
              {formatarDataHora(evento.data_inicio)}
            </span>
          </div>
        </div>

        <div className="p-5 md:p-6">
          <h2 className="text-lg md:text-xl font-bold leading-tight">
            {evento.titulo}
          </h2>
          {resumo && (
            <p className="mt-3 text-[#d6e4dc] text-sm md:text-base leading-relaxed line-clamp-3">
              {resumo}
            </p>
          )}

          {(inscricoesAteLabel ||
            evento.local ||
            Number(evento.valor) > 0 ||
            idadeMinima > 0) && (
            <div className="mt-4 rounded-xl border border-[#8fffc8]/20 bg-[#0b241c]/25 px-3 py-3 space-y-1.5 text-sm text-[#d6e4dc]">
              {evento.local && (
                <p>
                  Local <strong className="text-[#8fffc8]">{evento.local}</strong>
                </p>
              )}
              {idadeMinima > 0 && (
                <p>
                  Idade minima{" "}
                  <strong className="text-[#f8f2dc]">{idadeMinima} anos</strong>
                </p>
              )}
              {inscricoesAteLabel && (
                <p>
                  Inscrições até{" "}
                  <strong className="text-[#f8f2dc]">{inscricoesAteLabel}</strong>
                </p>
              )}
              <p>
                Valor <strong className="text-[#8fffc8]">{formatarValor(evento.valor)}</strong>
              </p>
            </div>
          )}

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setMostrarDetalhes(true)}
              className="inline-flex items-center gap-2 text-[#f4cf4e] font-semibold text-sm md:text-base hover:translate-x-1 transition-transform"
            >
              Ver detalhes
              <span>→</span>
            </button>

            {mapsHref && (
              <a
                href={mapsHref}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto inline-flex h-10 items-center gap-2 rounded-full border border-white/20 px-4 text-xs md:text-sm font-semibold text-white/85 hover:text-white hover:border-[#f4cf4e]/40 transition-colors"
              >
                <MapPin className="h-4 w-4" />
                Local
              </a>
            )}
          </div>
        </div>
      </section>

      <Transition appear show={mostrarDetalhes} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-50"
          onClose={() => setMostrarDetalhes(false)}
        >
          <div className="fixed inset-0 bg-black/65 backdrop-blur-sm" />
          <div className="fixed inset-0 overflow-y-auto p-4">
            <div className="flex min-h-full items-center justify-center">
              <Dialog.Panel className="w-full max-w-3xl max-h-[86vh] overflow-y-auto rounded-3xl border border-white/10 bg-[#153f31] p-4 md:p-6 text-[#f8f2dc] shadow-2xl">
                <div className="sticky top-0 z-10 -mx-4 -mt-4 mb-4 flex items-center justify-between border-b border-white/10 bg-[#153f31]/95 px-4 py-3 backdrop-blur md:hidden">
                  <Dialog.Title className="pr-3 text-sm font-black uppercase tracking-[0.14em] text-[#f4cf4e]">
                    Detalhes do evento
                  </Dialog.Title>
                  <button
                    type="button"
                    onClick={() => setMostrarDetalhes(false)}
                    className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-white/20 bg-black/20 text-white transition hover:border-[#f4cf4e]/40 hover:text-[#f4cf4e]"
                    aria-label="Fechar detalhes"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setMostrarDetalhes(false)}
                  className="absolute right-7 top-7 hidden h-9 w-9 items-center justify-center rounded-full border border-white/20 text-white/70 transition hover:text-[#f4cf4e] hover:border-[#f4cf4e]/40 md:inline-flex"
                  aria-label="Fechar detalhes"
                >
                  <X className="h-4 w-4" />
                </button>

                <div className="overflow-hidden rounded-2xl bg-[#10231b]">
                  {evento.imagem_url && (
                    <img
                      src={evento.imagem_url}
                      alt={evento.titulo}
                      className="w-full max-h-[320px] object-contain cursor-zoom-in"
                      onClick={() => setMostrarImagem(true)}
                    />
                  )}
                </div>

                <div className="mt-4">
                  <Dialog.Title className="text-xl md:text-3xl font-black leading-tight">
                    {evento.titulo}
                  </Dialog.Title>
                  <p className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-[#f4cf4e]/40 bg-[#0b241c]/80 px-3 py-1.5 text-xs md:text-sm font-bold uppercase tracking-[0.12em] text-[#f4cf4e]">
                    <CalendarDays className="h-4 w-4" />
                    {formatarDataHora(evento.data_inicio)}
                  </p>

                  <div className="mt-4 space-y-2 text-sm md:text-base text-[#d6e4dc]">
                    {evento.local && (
                      <p>
                        <strong className="text-[#f4cf4e]">Local:</strong>{" "}
                        {evento.local}
                      </p>
                    )}
                    {evento.endereco && (
                      <p>
                        <strong className="text-[#f4cf4e]">Endereco:</strong>{" "}
                        {mapsHref ? (
                          <a
                            href={mapsHref}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline decoration-[#f4cf4e]/60 hover:text-[#f4cf4e]"
                          >
                            {evento.endereco}
                          </a>
                        ) : (
                          evento.endereco
                        )}
                      </p>
                    )}
                    {whatsappHref && (
                      <p>
                        <strong className="text-[#f4cf4e]">Contato:</strong>{" "}
                        <a
                          href={whatsappHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-[#f4cf4e]"
                        >
                          {evento.whatsapp_url
                            ? "Grupo de WhatsApp"
                            : evento.telefone_contato || "WhatsApp"}
                        </a>
                      </p>
                    )}
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl border border-white/10 bg-[#0b241c]/35 p-4">
                      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#f4cf4e]/70">
                        Data
                      </p>
                      <p className="mt-2 text-sm font-semibold text-white">
                        {formatarDataHora(evento.data_inicio)}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-[#0b241c]/35 p-4">
                      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#f4cf4e]/70">
                        Local
                      </p>
                      <p className="mt-2 text-sm font-semibold text-white">
                        {evento.local || "A definir"}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-[#0b241c]/35 p-4">
                      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#f4cf4e]/70">
                        {idadeMinima > 0 ? "Idade minima" : "Valor"}
                      </p>
                      <p className="mt-2 text-sm font-semibold text-white">
                        {idadeMinima > 0
                          ? `${idadeMinima} anos`
                          : formatarValor(evento.valor)}
                      </p>
                    </div>
                  </div>

                  {idadeMinima > 0 && (
                    <p className="mt-4 text-sm text-[#d6e4dc]">
                      Este evento aceita inscrições somente a partir de{" "}
                      <strong className="text-[#f8f2dc]">{idadeMinima} anos</strong>.
                    </p>
                  )}

                  {descricaoDetalhada && (
                    <div className="mt-5 rounded-2xl border border-white/10 bg-[#0b241c]/35 p-4 sm:p-5">
                      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#f4cf4e]/85">
                        Detalhes
                      </p>
                      <p className="mt-3 whitespace-pre-line text-sm leading-7 text-[#d6e4dc]">
                        {descricaoDetalhada}
                      </p>
                    </div>
                  )}

                  <div className="mt-5 flex flex-wrap items-center gap-3">
                    {mapsHref && (
                      <a
                        href={mapsHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white/85 transition hover:text-white hover:border-[#f4cf4e]/40"
                      >
                        <MapPin className="h-4 w-4" />
                        Ver local
                      </a>
                    )}
                    {whatsappHref && (
                      <a
                        href={whatsappHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-full border border-emerald-300/25 bg-emerald-400/10 px-4 py-2 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-400/15"
                      >
                        <MessageCircle className="h-4 w-4" />
                        WhatsApp
                      </a>
                    )}
                  </div>

                  <div className="sticky bottom-0 mt-6 -mx-4 -mb-4 border-t border-white/10 bg-[#153f31]/95 px-4 py-3 backdrop-blur md:hidden">
                    <button
                      type="button"
                      onClick={() => setMostrarDetalhes(false)}
                      className="inline-flex w-full min-h-11 items-center justify-center rounded-full bg-[#f4cf4e] px-4 text-sm font-black uppercase tracking-[0.08em] text-[#132118] transition hover:bg-[#f7d96f]"
                    >
                      Fechar
                    </button>
                  </div>
                </div>
              </Dialog.Panel>
            </div>
          </div>
        </Dialog>
      </Transition>

      <Transition appear show={mostrarImagem} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-50"
          onClose={() => setMostrarImagem(false)}
        >
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" />
          <div className="fixed inset-0 p-4">
            <div className="flex min-h-full items-center justify-center">
              <Dialog.Panel className="relative w-full max-w-5xl overflow-hidden rounded-[28px] bg-black shadow-2xl">
                <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent px-4 py-3 md:hidden">
                  <span className="text-xs font-bold uppercase tracking-[0.14em] text-white/80">
                    Imagem ampliada
                  </span>
                  <button
                    type="button"
                    onClick={() => setMostrarImagem(false)}
                    className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-white/20 bg-black/35 text-white transition hover:bg-black/55"
                    aria-label="Fechar imagem"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setMostrarImagem(false)}
                  className="absolute right-4 top-4 z-10 hidden h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/35 text-white transition hover:bg-black/55 md:inline-flex"
                  aria-label="Fechar imagem"
                >
                  <X className="h-4 w-4" />
                </button>
                {evento.imagem_url && (
                  <img
                    src={evento.imagem_url}
                    alt={evento.titulo}
                    className="max-h-[85vh] w-full object-contain"
                  />
                )}
                <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/85 to-transparent px-4 py-3 md:hidden">
                  <button
                    type="button"
                    onClick={() => setMostrarImagem(false)}
                    className="inline-flex w-full min-h-11 items-center justify-center rounded-full border border-white/20 bg-white/10 px-4 text-sm font-semibold text-white transition hover:bg-white/15"
                  >
                    Fechar imagem
                  </button>
                </div>
              </Dialog.Panel>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}
