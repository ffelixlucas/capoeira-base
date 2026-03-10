import { useState } from "react";
import { produtosService } from "../../../services/produtosService";
import { toast } from "react-toastify";
import  InfoTip  from "../../ui/InfoTip";

export default function SkuGaleria({ sku, imagensReaproveitaveis = [], onAtualizado }) {
    const imagens = sku.imagens || [];
    const [open, setOpen] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState(null);
    const [reutilizandoImagemId, setReutilizandoImagemId] = useState(null);

    const imagensDisponiveis = imagensReaproveitaveis.filter(
        (imagem) => !imagens.some((imgSku) => imgSku.url === imagem.url)
    );

    async function handleUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        try {
            setUploading(true);
            await produtosService.uploadImagemSku(sku.id, file);
            toast.success("Imagem enviada");
            onAtualizado?.();
        } catch {
            toast.error("Erro ao enviar imagem");
        } finally {
            setUploading(false);
        }
    }

    async function definirCapa(imagemId) {
        try {
            await produtosService.definirCapaSku(sku.id, imagemId);
            toast.success("Capa definida");
            onAtualizado?.();
        } catch {
            toast.error("Erro ao definir capa");
        }
    }

    async function remover(imagemId) {
        try {
            await produtosService.removerImagemSku(imagemId);
            toast.success("Imagem removida");
            onAtualizado?.();
        } catch {
            toast.error("Erro ao remover imagem");
        }
    }

    async function reutilizarImagemExistente(imagem) {
        try {
            setReutilizandoImagemId(imagem.chave);
            await produtosService.reutilizarImagemProdutoNaSku(sku.id, {
                url: imagem.url,
            });
            toast.success("Imagem adicionada na variação");
            onAtualizado?.();
        } catch (error) {
            toast.error(
                error.response?.data?.message || "Erro ao reutilizar imagem"
            );
        } finally {
            setReutilizandoImagemId(null);
        }
    }

    return (
        <>
            {/* BOTÃO */}
            <button
                onClick={() => setOpen(true)}
                className="text-xs text-cor-primaria hover:underline"
            >
                Gerenciar imagens da variação ({imagens.length})
            </button>

            {/* MODAL PRINCIPAL */}
            {open && (
                <div
                    className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center p-4 z-50"
                    onClick={() => setOpen(false)}
                >
                    <div
                        className="bg-surface border border-cor-secundaria/30 rounded-xl w-full max-w-xl p-6 shadow-xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className="font-semibold mb-2 text-on-surface">
                            Imagens da Variação
                        </h3>

                        <InfoTip type="info" className="mb-5">
                            Utilize imagens aqui apenas se esta variação for visualmente diferente
                            do produto principal.
                            <br />
                            <span className="opacity-80">
                                Exemplo: cor diferente, modelo regata ou material distinto.
                            </span>
                        </InfoTip>

                        {imagensDisponiveis.length > 0 && (
                            <div className="mb-6">
                                <div className="flex items-center justify-between gap-3 mb-3">
                                    <h4 className="text-sm font-semibold text-on-surface">
                                        Imagens usadas neste produto
                                    </h4>
                                    <span className="text-xs text-on-surface/40">
                                        {imagensDisponiveis.length} disponíveis
                                    </span>
                                </div>

                                <div className="grid grid-cols-3 gap-3">
                                    {imagensDisponiveis.map((img) => (
                                        <button
                                            key={img.chave}
                                            type="button"
                                            onClick={() => reutilizarImagemExistente(img)}
                                            disabled={reutilizandoImagemId === img.chave}
                                            className="relative h-24 rounded-lg overflow-hidden border border-cor-secundaria/30 bg-cor-fundo group"
                                        >
                                            <img
                                                src={img.url}
                                                alt="Imagem reaproveitavel"
                                                className="h-full w-full object-contain"
                                            />
                                            <div className="absolute left-1 top-1 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-medium text-white">
                                                {img.origem}
                                            </div>
                                            <div className="absolute inset-x-0 bottom-0 bg-black/70 px-2 py-1 text-[11px] font-medium text-white">
                                                {reutilizandoImagemId === img.chave ? "Adicionando..." : "Usar nesta variação"}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Upload */}
                        <label className="block mb-6">
                            <input
                                type="file"
                                onChange={handleUpload}
                                className="hidden"
                            />
                            <div className="border border-dashed border-cor-secundaria/40 rounded-lg p-4 text-center cursor-pointer hover:bg-cor-secundaria/10 transition text-sm text-on-surface/70">
                                {uploading ? "Enviando..." : "Clique para enviar imagem"}
                            </div>
                        </label>

                        {/* Galeria */}
                        {imagens.length === 0 ? (
                            <p className="text-sm text-on-surface/40 text-center py-6">
                                Nenhuma imagem cadastrada.
                            </p>
                        ) : (
                            <div className="grid grid-cols-3 gap-4">
                                {imagens.map((img) => (
                                    <div
                                        key={img.id}
                                        className="relative group h-28 bg-cor-fundo border border-cor-secundaria/30 rounded-lg flex items-center justify-center overflow-hidden"
                                    >
                                        <img
                                            src={img.url}
                                            alt="Imagem SKU"
                                            className="max-h-full max-w-full object-contain cursor-pointer"
                                            onClick={() => setPreview(img.url)}
                                        />

                                        {img.is_capa === 1 && (
                                            <span className="absolute top-2 left-2 bg-cor-primaria text-white text-xs px-2 py-0.5 rounded">
                                                Capa
                                            </span>
                                        )}

                                        {/* AÇÕES */}
                                        <div className="absolute bottom-2 left-2 right-2 flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition">
                                            {img.is_capa !== 1 && (
                                                <button
                                                    onClick={() => definirCapa(img.id)}
                                                    className="text-xs bg-cor-secundaria/20 text-on-surface px-2 py-1 rounded hover:bg-cor-secundaria/40 transition"
                                                >
                                                    Definir capa
                                                </button>
                                            )}

                                            <button
                                                onClick={() => remover(img.id)}
                                                className="text-xs bg-red-500/80 text-white px-2 py-1 rounded hover:bg-red-600 transition"
                                            >
                                                Remover
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="mt-6 text-right">
                            <button
                                onClick={() => setOpen(false)}
                                className="text-sm text-on-surface/60 hover:text-on-surface"
                            >
                                Fechar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL PREVIEW */}
            {preview && (
                <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-lg flex items-center justify-center p-4 z-[60]"
                    onClick={() => setPreview(null)}
                >
                    <img
                        src={preview}
                        alt="Preview"
                        className="max-h-[90vh] max-w-full object-contain rounded-lg shadow-2xl"
                    />
                </div>
            )}
        </>
    );
}
