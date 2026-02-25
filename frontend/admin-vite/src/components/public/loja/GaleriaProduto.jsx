// GaleriaProduto.jsx - Versão com as cores do projeto
import { useState, useMemo, useEffect } from "react";

export default function GaleriaProduto({ produto, skuSelecionado }) {
  const imagens = useMemo(() => {
    if (skuSelecionado?.imagens?.length > 0) {
      return skuSelecionado.imagens;
    }
    return produto?.imagens || [];
  }, [produto, skuSelecionado]);

  const [imagemAtiva, setImagemAtiva] = useState(null);

  useEffect(() => {
    if (!imagens?.length) {
      setImagemAtiva(null);
      return;
    }

    const capa =
      imagens.find((img) => img.is_capa)?.url ||
      imagens[0]?.url;

    setImagemAtiva(capa);
  }, [imagens]);

  if (!imagemAtiva) {
    return (
      <div className="w-full aspect-square bg-cor-secundaria/20 flex items-center justify-center rounded-xl border border-cor-secundaria/30">
        <div className="text-center">
          <span className="text-4xl mb-2 block text-cor-texto/30">📸</span>
          <span className="text-cor-texto/40 text-sm">Sem imagem</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col-reverse md:flex-row gap-4">
      
      {/* Miniaturas */}
      <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
        {imagens.map((img) => (
          <button
            key={img.id}
            onClick={() => setImagemAtiva(img.url)}
            className={`border-2 rounded-lg overflow-hidden transition ${
              imagemAtiva === img.url
                ? "border-cor-primaria"
                : "border-transparent hover:border-cor-primaria/50"
            }`}
          >
            <img
              src={img.url}
              alt=""
              className="w-16 h-16 object-cover"
            />
          </button>
        ))}
      </div>

      {/* Imagem principal */}
      <div className="flex-1 bg-cor-secundaria/10 border border-cor-secundaria/30 rounded-xl flex items-center justify-center p-4">
        <img
          src={imagemAtiva}
          alt=""
          className="max-h-[500px] w-full object-contain"
        />
      </div>
    </div>
  );
}