import React, { useState } from "react";
import GaleriaItem from "./GaleriaItem";
import {
  atualizarLegenda,
  atualizarOrdem,
} from "../../services/galeriaService";

function GaleriaGrade({ imagens, setImagens, onRemover }) {
  const [ordemEditada, setOrdemEditada] = useState(false);

  const handleEditarLegenda = async (img) => {
    const novaLegenda = prompt("Editar legenda:", img.legenda || "");
    if (novaLegenda === null) return;

    try {
      // 🔥 Atualizar no backend
      await atualizarLegenda(img.id, novaLegenda);

      // 🔥 Verificar estado atual de imagens
      console.log("imagens:", imagens);

      // 🔥 Atualizar no estado local
      const atualizadas = imagens.map((item) =>
        item.id === img.id ? { ...item, legenda: novaLegenda } : item
      );
      setImagens(atualizadas);

      alert("Legenda atualizada com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar legenda:", error);
      alert("Erro ao atualizar legenda.");
    }
  };

  const handleMoverParaPosicao = (fromIndex, toIndex) => {
    if (toIndex < 0 || toIndex >= imagens.length) {
      alert("Posição inválida.");
      return;
    }
    const novaOrdem = [...imagens];
    const [movido] = novaOrdem.splice(fromIndex, 1);
    novaOrdem.splice(toIndex, 0, movido);
    setImagens(novaOrdem);
    setOrdemEditada(true);
  };

  const moverParaFrente = (index) => {
    if (index === 0) return;
    const novaOrdem = [...imagens];
    [novaOrdem[index - 1], novaOrdem[index]] = [
      novaOrdem[index],
      novaOrdem[index - 1],
    ];
    setImagens(novaOrdem);
    setOrdemEditada(true);
  };

  const moverParaTras = (index) => {
    if (index === imagens.length - 1) return;
    const novaOrdem = [...imagens];
    [novaOrdem[index], novaOrdem[index + 1]] = [
      novaOrdem[index + 1],
      novaOrdem[index],
    ];
    setImagens(novaOrdem);
    setOrdemEditada(true);
  };

  const handleSalvarOrdem = async () => {
    try {
      const ordemFinal = imagens.map((img, index) => ({
        id: img.id,
        ordem: index,
      }));
      await atualizarOrdem(ordemFinal);
      setOrdemEditada(false);
      alert("Ordem salva com sucesso!");
    } catch (err) {
      console.error("Erro ao salvar ordem:", err);
      alert("Erro ao salvar ordem.");
    }
  };

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 w-full bg-transparent">
        {imagens.map((img, index) => (
          <div key={img.id} className="min-w-[180px]">
            <GaleriaItem
              imagem={img}
              index={index}
              onRemover={onRemover}
              onEditarLegenda={() => handleEditarLegenda(img)}
              onMoverParaFrente={() => moverParaFrente(index)}
              onMoverParaTras={() => moverParaTras(index)}
              onMoverParaPosicao={(toIndex) =>
                handleMoverParaPosicao(index, toIndex)
              }
            />
          </div>
        ))}
      </div>

      {ordemEditada && (
        <div className="mt-4">
          <button
            onClick={handleSalvarOrdem}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow"
          >
            Salvar ordem
          </button>
        </div>
      )}
    </>
  );
}

export default GaleriaGrade;
