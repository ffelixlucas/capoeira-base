import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useGaleria } from "../hooks/useGaleria";

function formatarData(value) {
  if (!value) return "Sem data";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Sem data";

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function extrairResumo(texto = "") {
  const clean = String(texto || "").trim();
  if (!clean) return "Sem conteúdo.";
  return clean.length > 220 ? `${clean.slice(0, 220)}...` : clean;
}

function Galeria() {
  const [searchParams] = useSearchParams();
  const {
    arquivo,
    setArquivo,
    titulo,
    setTitulo,
    legenda,
    setLegenda,
    imagens,
    handleUpload,
    handleRemoverImagem,
    handleEditarNoticia,
    loading,
  } = useGaleria();

  const [filtro, setFiltro] = useState("");
  const [editandoId, setEditandoId] = useState(null);
  const [tituloEdicao, setTituloEdicao] = useState("");
  const [conteudoEdicao, setConteudoEdicao] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [noticiaDestacadaId, setNoticiaDestacadaId] = useState(null);

  const refNoticiaIdRaw = Number(searchParams.get("refNoticia"));
  const refNoticiaId =
    Number.isFinite(refNoticiaIdRaw) && refNoticiaIdRaw > 0 ? refNoticiaIdRaw : null;

  useEffect(() => {
    if (!arquivo) {
      setPreviewUrl("");
      return;
    }

    const objectUrl = URL.createObjectURL(arquivo);
    setPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [arquivo]);

  useEffect(() => {
    if (!refNoticiaId) return;
    const el = document.getElementById(`noticia-${refNoticiaId}`);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    setNoticiaDestacadaId(refNoticiaId);
    const timeout = setTimeout(() => setNoticiaDestacadaId(null), 3000);
    return () => clearTimeout(timeout);
  }, [refNoticiaId, imagens.length]);

  const noticiasFiltradas = useMemo(() => {
    const term = filtro.trim().toLowerCase();
    if (!term) return imagens;

    return imagens.filter((item) => {
      const t = String(item.titulo || "").toLowerCase();
      const l = String(item.legenda || "").toLowerCase();
      return t.includes(term) || l.includes(term);
    });
  }, [imagens, filtro]);

  const iniciarEdicao = (item) => {
    setEditandoId(item.id);
    setTituloEdicao(item.titulo || "");
    setConteudoEdicao(item.legenda || "");
  };

  const cancelarEdicao = () => {
    setEditandoId(null);
    setTituloEdicao("");
    setConteudoEdicao("");
  };

  const salvarEdicao = async (id) => {
    const ok = await handleEditarNoticia(id, {
      titulo: tituloEdicao,
      legenda: conteudoEdicao,
    });

    if (ok) {
      cancelarEdicao();
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <section className="rounded-2xl border border-cor-secundaria bg-cor-secundaria/30 backdrop-blur p-4 sm:p-6">
        <div className="flex flex-col gap-2 mb-5">
          <h1 className="text-xl sm:text-2xl font-bold text-cor-titulo">Editor de Notícias</h1>
          <p className="text-sm text-cor-texto/80">
            Publique notícias do espaço com capa, título e conteúdo. Esta área foi organizada para fluxo de redação.
          </p>
        </div>

        <form onSubmit={handleUpload} className="grid grid-cols-1 xl:grid-cols-[1.2fr_1fr] gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Título da notícia</label>
              <input
                type="text"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ex.: Capoeira Nota 10 participa do edital cultural municipal"
                disabled={loading}
                className="w-full rounded-xl border border-cor-secundaria bg-white/95 text-black px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cor-primaria"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Conteúdo / resumo</label>
              <textarea
                value={legenda}
                onChange={(e) => setLegenda(e.target.value)}
                placeholder="Escreva o texto principal que será exibido no blog..."
                rows={7}
                disabled={loading}
                className="w-full rounded-xl border border-cor-secundaria bg-white/95 text-black px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cor-primaria"
              />
              <p className="mt-1 text-xs text-cor-texto/70">{legenda.length} caracteres</p>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Imagem de capa</label>
              <input
                type="file"
                accept="image/png,image/jpeg,image/jpg"
                onChange={(e) => setArquivo(e.target.files?.[0] || null)}
                disabled={loading}
                className="w-full rounded-xl border border-cor-secundaria bg-white/95 text-black px-3 py-2 file:mr-3 file:rounded-lg file:border-0 file:bg-cor-primaria file:px-3 file:py-2 file:font-semibold file:text-cor-escura"
              />
              <p className="mt-1 text-xs text-cor-texto/70">JPG ou PNG até 5MB</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`rounded-xl px-5 py-3 font-semibold text-cor-escura transition ${
                loading ? "bg-cor-primaria/60 cursor-not-allowed" : "bg-cor-primaria hover:bg-cor-titulo"
              }`}
            >
              {loading ? "Publicando..." : "Publicar notícia"}
            </button>
          </div>

          <aside className="rounded-2xl border border-cor-secundaria/70 bg-cor-fundo/40 p-4">
            <p className="text-xs uppercase tracking-wider text-cor-texto/70 mb-3">Pré-visualização</p>

            <div className="rounded-xl overflow-hidden border border-cor-secundaria bg-cor-secundaria/20">
              <div className="aspect-video bg-black/20 flex items-center justify-center">
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <p className="text-xs text-cor-texto/70">Imagem de capa</p>
                )}
              </div>

              <div className="p-4 space-y-2">
                <p className="text-xs text-cor-texto/60">{formatarData(new Date())}</p>
                <h2 className="text-base font-bold text-cor-titulo">{titulo.trim() || "Título da notícia"}</h2>
                <p className="text-sm text-cor-texto/85 whitespace-pre-line">{extrairResumo(legenda)}</p>
              </div>
            </div>
          </aside>
        </form>
      </section>

      <section className="rounded-2xl border border-cor-secundaria bg-cor-secundaria/20 p-4 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h2 className="text-lg sm:text-xl font-bold text-cor-titulo">Notícias publicadas</h2>
          <input
            type="text"
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            placeholder="Buscar por título ou conteúdo"
            className="w-full sm:w-80 rounded-xl border border-cor-secundaria bg-white/95 text-black px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-cor-primaria"
          />
        </div>

        {noticiasFiltradas.length === 0 ? (
          <p className="text-sm text-cor-texto/75">Nenhuma notícia encontrada.</p>
        ) : (
          <div className="space-y-4">
            {noticiasFiltradas.map((item) => {
              const emEdicao = editandoId === item.id;

              return (
                <article
                  key={item.id}
                  id={`noticia-${item.id}`}
                  className={`grid grid-cols-1 md:grid-cols-[260px_1fr] gap-4 rounded-2xl border bg-cor-fundo/35 p-3 sm:p-4 ${
                    Number(noticiaDestacadaId) === Number(item.id)
                      ? "border-[#f4cf4e] ring-2 ring-[#f4cf4e]/40"
                      : "border-cor-secundaria/70"
                  }`}
                >
                  <div className="rounded-xl overflow-hidden bg-black/20 border border-cor-secundaria/60 h-48 md:h-full">
                    <img src={item.imagem_url} alt={item.titulo || "Notícia"} className="w-full h-full object-cover" />
                  </div>

                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="rounded-full bg-cor-primaria px-3 py-1 font-semibold text-cor-escura">Publicado</span>
                      <span className="text-cor-texto/65">{formatarData(item.criado_em)}</span>
                    </div>

                    {emEdicao ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={tituloEdicao}
                          onChange={(e) => setTituloEdicao(e.target.value)}
                          className="w-full rounded-xl border border-cor-secundaria bg-white/95 text-black px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-cor-primaria"
                        />
                        <textarea
                          value={conteudoEdicao}
                          onChange={(e) => setConteudoEdicao(e.target.value)}
                          rows={5}
                          className="w-full rounded-xl border border-cor-secundaria bg-white/95 text-black px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cor-primaria"
                        />
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => salvarEdicao(item.id)}
                            disabled={loading}
                            className="rounded-lg bg-green-600 hover:bg-green-700 text-white px-4 py-2 text-sm font-semibold disabled:opacity-60"
                          >
                            Salvar notícia
                          </button>
                          <button
                            type="button"
                            onClick={cancelarEdicao}
                            className="rounded-lg bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 text-sm font-semibold"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <h3 className="text-lg font-bold text-cor-titulo">{item.titulo || "Sem título"}</h3>
                        <p className="text-sm text-cor-texto/85 whitespace-pre-line">{item.legenda || "Sem conteúdo."}</p>
                      </>
                    )}

                    {!emEdicao && (
                      <div className="flex flex-wrap gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => iniciarEdicao(item)}
                          className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm font-semibold"
                        >
                          Editar notícia
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoverImagem(item.id)}
                          className="rounded-lg bg-red-600 hover:bg-red-700 text-white px-4 py-2 text-sm font-semibold"
                        >
                          Excluir
                        </button>
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

export default Galeria;
