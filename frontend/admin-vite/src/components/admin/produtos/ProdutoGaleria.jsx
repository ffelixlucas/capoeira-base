import { useState, useRef } from "react";
import { Plus, Loader2, Trash2, Star } from "lucide-react";
import { toast } from "react-toastify";
import { produtosService } from "../../../services/produtosService";

export default function ProdutoGaleria({ produto, onAtualizado }) {
  const imagens = produto.imagens || [];
  const podeAdicionar = imagens.length < 6;

  const inputRef = useRef(null);

  const [loadingUpload, setLoadingUpload] = useState(false);
  const [imagemPreview, setImagemPreview] = useState(null);
  const [loadingImagemId, setLoadingImagemId] = useState(null);

  async function handleUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setLoadingUpload(true);

      await produtosService.uploadImagemProduto(produto.id, file);

      toast.success("Imagem enviada com sucesso");
      onAtualizado();
    } catch {
      toast.error("Erro ao enviar imagem");
    } finally {
      setLoadingUpload(false);
      e.target.value = null;
    }
  }

  async function handleExcluir(imagemId) {
    if (!confirm("Deseja realmente excluir esta imagem?")) return;

    try {
      setLoadingImagemId(imagemId);

      await produtosService.removerImagemProduto(imagemId);

      toast.success("Imagem removida");
      onAtualizado();
    } catch {
      toast.error("Erro ao remover imagem");
    } finally {
      setLoadingImagemId(null);
    }
  }

  async function handleDefinirCapa(imagemId) {
    try {
      setLoadingImagemId(imagemId);

      await produtosService.definirCapaProduto(produto.id, imagemId);

      toast.success("Imagem definida como capa");
      onAtualizado();
    } catch {
      toast.error("Erro ao definir capa");
    } finally {
      setLoadingImagemId(null);
    }
  }

  return (
    <div className="bg-surface rounded-xl border-2 border-cor-secundaria/30 overflow-hidden shadow-sm">
      <div className="p-4 border-b-2 border-cor-secundaria/30 flex items-center justify-between">
        <h2 className="font-semibold">Imagens do Produto</h2>
        <span className="text-xs text-on-surface/40">
          {imagens.length}/6
        </span>
      </div>

      <div className="p-4">
        <input
          type="file"
          accept="image/*"
          ref={inputRef}
          onChange={handleUpload}
          className="hidden"
        />

        <div className="grid grid-cols-3 gap-3">
          {imagens.map((img) => (
            <div
              key={img.id}
              className="relative rounded-lg overflow-hidden border border-cor-secundaria/30 bg-cor-fundo flex items-center justify-center h-24 group"
            >
              {loadingImagemId === img.id ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <>
                  <img
                    src={img.url}
                    alt="Imagem produto"
                    className="max-h-full max-w-full object-contain cursor-pointer"
                    onClick={() => setImagemPreview(img.url)}
                  />

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center gap-2">
                    <button
                      onClick={() => handleDefinirCapa(img.id)}
                      className="text-white text-xs flex items-center gap-1 hover:text-yellow-400"
                    >
                      <Star size={14} />
                      Definir capa
                    </button>

                    <button
                      onClick={() => handleExcluir(img.id)}
                      className="text-white text-xs flex items-center gap-1 hover:text-red-400"
                    >
                      <Trash2 size={14} />
                      Excluir
                    </button>
                  </div>

                  {img.is_capa === 1 && (
                    <span className="absolute top-1 left-1 bg-cor-primaria text-white text-xs px-2 py-0.5 rounded">
                      Capa
                    </span>
                  )}
                </>
              )}
            </div>
          ))}

          {podeAdicionar && (
            <div
              onClick={() => inputRef.current.click()}
              className="h-24 border-2 border-dashed border-cor-secundaria/40 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-cor-primaria transition text-on-surface/50"
            >
              {loadingUpload ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <>
                  <Plus size={20} />
                  <span className="text-xs mt-1">Adicionar</span>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Preview Modal */}
      {imagemPreview && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50"
          onClick={() => setImagemPreview(null)}
        >
          <img
            src={imagemPreview}
            alt="Preview"
            className="max-h-[90vh] max-w-full object-contain rounded-lg"
          />
        </div>
      )}
    </div>
  );
}