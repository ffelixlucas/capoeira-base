import React, { useState } from "react";
import GaleriaItem from "./GaleriaItem";
import {
  atualizarLegenda,
  atualizarOrdem,
} from "../../services/galeriaService";
import ModalLegenda from "./ModalLegenda";

function GaleriaGrade({ imagens, setImagens, onRemover, setCurrentIndex }) {
  const [ordemEditada, setOrdemEditada] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [legendaTemp, setLegendaTemp] = useState("");
  const [imagemSelecionada, setImagemSelecionada] = useState(null);

  const abrirModalLegenda = (img) => {
    setImagemSelecionada(img);
    setLegendaTemp(img.legenda || "");
    setIsModalOpen(true);
  };

  const handleSalvarLegenda = async () => {
    try {
      await atualizarLegenda(imagemSelecionada.id, legendaTemp);

      const atualizadas = imagens.map((item) =>
        item.id === imagemSelecionada.id
          ? { ...item, legenda: legendaTemp }
          : item
      );
      setImagens(atualizadas);

      setIsModalOpen(false);
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
              onEditarLegenda={() => abrirModalLegenda(img)}
              onMoverParaFrente={() => moverParaFrente(index)}
              onMoverParaTras={() => moverParaTras(index)}
              onMoverParaPosicao={(toIndex) =>
                handleMoverParaPosicao(index, toIndex)
              }
              setCurrentIndex={setCurrentIndex}
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

      <ModalLegenda
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        legenda={legendaTemp}
        setLegenda={setLegendaTemp}
        onSalvar={handleSalvarLegenda}
      />
    </>
  );
}

export default GaleriaGrade;
