import React from "react";
import GaleriaItem from "./GaleriaItem";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

function GaleriaGrade({ imagens, setImagens, onRemover }) {
  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const novaOrdem = Array.from(imagens);
    const [removido] = novaOrdem.splice(result.source.index, 1);
    novaOrdem.splice(result.destination.index, 0, removido);

    setImagens(novaOrdem);
  };

  const moverParaFrente = (index) => {
    if (index === 0) return;
    const novaOrdem = [...imagens];
    [novaOrdem[index - 1], novaOrdem[index]] = [novaOrdem[index], novaOrdem[index - 1]];
    setImagens(novaOrdem);
  };

  const moverParaTras = (index) => {
    if (index === imagens.length - 1) return;
    const novaOrdem = [...imagens];
    [novaOrdem[index], novaOrdem[index + 1]] = [novaOrdem[index + 1], novaOrdem[index]];
    setImagens(novaOrdem);
  };

  const girarImagem = (index) => {
    console.log("Girar imagem no índice:", index);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="galeria" direction="horizontal">
        {(provided) => (
          <div
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4"
            ref={provided.innerRef}
            {...provided.droppableProps}
          >
            {imagens.map((img, index) => (
              <Draggable key={img.id} draggableId={img.id.toString()} index={index}>
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                    <GaleriaItem
                      imagem={img}
                      index={index}
                      onRemover={onRemover}
                      onMoverParaFrente={() => moverParaFrente(index)}
                      onMoverParaTras={() => moverParaTras(index)}
                      onGirar={() => girarImagem(index)}
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
  );
}

export default GaleriaGrade;