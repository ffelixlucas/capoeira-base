import React, { useState } from "react";
import GaleriaItem from "./GaleriaItem";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { atualizarLegenda, atualizarOrdem } from "../../services/galeriaService";

function GaleriaGrade({ imagens, setImagens, onRemover }) {
  const [ordemEditada, setOrdemEditada] = useState(false);

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

  const handleEditarLegenda = async (img) => {
    const novaLegenda = prompt("Editar legenda:", img.legenda || "");
    if (novaLegenda === null) return;

    try {
      await atualizarLegenda(img.id, novaLegenda);
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

  const handleSalvarOrdem = async () => {
    const novaOrdem = imagens.map((img, index) => ({
      id: img.id,
      ordem: index,
    }));

    try {
      await atualizarOrdem(novaOrdem);
      setOrdemEditada(false);
      alert("Ordem salva com sucesso!");
    } catch (err) {
      console.error("Erro ao salvar ordem:", err);
      alert("Erro ao salvar ordem.");
    }
  };

  const handleOnDragEnd = (result) => {
    if (!result.destination) return;

    const novaOrdem = Array.from(imagens);
    const [reordenado] = novaOrdem.splice(result.source.index, 1);
    novaOrdem.splice(result.destination.index, 0, reordenado);

    setImagens(novaOrdem);
    setOrdemEditada(true);
  };

  return (
    <div>
      <DragDropContext onDragEnd={handleOnDragEnd}>
        <Droppable droppableId="galeria" direction="horizontal">
          {(provided) => (
            <div
              className="flex gap-4 overflow-x-auto"
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {imagens.map((img, index) => (
                <Draggable key={img.id} draggableId={String(img.id)} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className="min-w-[150px]"
                    >
                      <GaleriaItem
                        imagem={img}
                        index={index}
                        onRemover={onRemover}
                        onEditarLegenda={() => handleEditarLegenda(img)}
                        onMoverParaFrente={() => moverParaFrente(index)}
                        onMoverParaTras={() => moverParaTras(index)}
                      />
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

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
    </div>
  );
}

export default GaleriaGrade;
