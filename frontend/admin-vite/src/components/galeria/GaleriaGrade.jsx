import React, { useState } from "react";
import { toast } from "react-toastify";

import GaleriaItem from "./GaleriaItem";
import { atualizarLegenda, atualizarOrdem } from "../../services/galeriaService";
import ModalLegenda from "./ModalLegenda";
import { logger } from "../../utils/logger";

function GaleriaGrade({
  imagens: initialImagens,
  setImagens,
  onRemover,
  setCurrentIndex,
  setAutoplay,
}) {
  const [ordemEditada, setOrdemEditada] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [legendaTemp, setLegendaTemp] = useState("");
  const [imagemSelecionada, setImagemSelecionada] = useState(null);
  const [loading, setLoading] = useState(false);

  const abrirModalLegenda = (img) => {
    setImagemSelecionada(img);
    setLegendaTemp(img.legenda || "");
    setIsModalOpen(true);
  };

  const handleSalvarLegenda = async () => {
    setLoading(true);
    try {
      await atualizarLegenda(imagemSelecionada.id, legendaTemp);
      const atualizadas = initialImagens.map((item) =>
        item.id === imagemSelecionada.id
          ? { ...item, legenda: legendaTemp }
          : item
      );
      setImagens(atualizadas);
      toast.success("Legenda atualizada com sucesso.");
      setIsModalOpen(false);
    } catch (error) {
      logger.error("Erro ao atualizar legenda:", error);
      toast.error("Erro ao atualizar legenda.");
    } finally {
      setLoading(false);
    }
  };

  const handleMoverParaPosicao = (fromIndex, toIndex) => {
    if (toIndex < 0 || toIndex >= initialImagens.length) {
      toast.warn("Posição inválida.");
      return;
    }
    const novaOrdem = [...initialImagens];
    const [movido] = novaOrdem.splice(fromIndex, 1);
    novaOrdem.splice(toIndex, 0, movido);
    setImagens(novaOrdem);
    setOrdemEditada(true);
  };

  const moverParaFrente = (index) => {
    if (index === 0) return;
    const novaOrdem = [...initialImagens];
    [novaOrdem[index - 1], novaOrdem[index]] = [
      novaOrdem[index],
      novaOrdem[index - 1],
    ];
    setImagens(novaOrdem);
    setOrdemEditada(true);
  };

  const moverParaTras = (index) => {
    if (index === initialImagens.length - 1) return;
    const novaOrdem = [...initialImagens];
    [novaOrdem[index], novaOrdem[index + 1]] = [
      novaOrdem[index + 1],
      novaOrdem[index],
    ];
    setImagens(novaOrdem);
    setOrdemEditada(true);
  };

  const handleSalvarOrdem = async () => {
    setLoading(true);
    try {
      const ordemFinal = initialImagens.map((img, index) => ({
        id: img.id,
        ordem: index,
      }));
      await atualizarOrdem(ordemFinal);
      setOrdemEditada(false);
      toast.success("Ordem salva com sucesso.");
    } catch (error) {
      logger.error("Erro ao salvar ordem:", error);
      toast.error("Erro ao salvar ordem. Verifique sua conexão ou login.");
      setImagens([...initialImagens]); // opcional: restaura ordem anterior
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 w-full">
        {initialImagens.map((img, index) => (
          <div key={img.id}>
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
              setAutoplay={setAutoplay}
            />
          </div>
        ))}
      </div>

      {ordemEditada && (
        <div className="mt-4">
          <button
            onClick={handleSalvarOrdem}
            disabled={loading}
            className={`${
              loading ? "opacity-60 cursor-not-allowed" : ""
            } bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow`}
          >
            {loading ? "Salvando..." : "Salvar ordem"}
          </button>
        </div>
      )}

      <ModalLegenda
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        legenda={legendaTemp}
        setLegenda={setLegendaTemp}
        onSalvar={handleSalvarLegenda}
        loading={loading}
      />
    </>
  );
}

export default GaleriaGrade;
