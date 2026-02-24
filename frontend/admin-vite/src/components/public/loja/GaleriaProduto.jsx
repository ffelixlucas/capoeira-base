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
      <div className="w-full h-80 bg-gray-100 flex items-center justify-center rounded-xl">
        <span className="text-gray-400">Sem imagem</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row gap-4">
      <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-visible">
        {imagens.map((img) => (
          <button
            key={img.id}
            onClick={() => setImagemAtiva(img.url)}
            className={`border rounded-lg p-1 transition ${
              imagemAtiva === img.url
                ? "border-black"
                : "border-gray-200"
            }`}
          >
            <img
              src={img.url}
              alt=""
              className="w-16 h-16 object-cover rounded-md"
            />
          </button>
        ))}
      </div>

      <div className="flex-1 bg-white border rounded-xl flex items-center justify-center p-4">
        <img
          src={imagemAtiva}
          alt=""
          className="max-h-[420px] object-contain"
        />
      </div>
    </div>
  );
}