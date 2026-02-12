import { createContext, useContext, useState } from "react";

const CarrinhoContext = createContext();

export function CarrinhoProvider({ children }) {
  const [itens, setItens] = useState([]);

  function adicionarItem(item) {
    setItens((prev) => {
      const existente = prev.find((i) => i.skuId === item.skuId);

      if (existente) {
        return prev.map((i) =>
          i.skuId === item.skuId
            ? { ...i, quantidade: i.quantidade + 1 }
            : i
        );
      }

      return [...prev, { ...item, quantidade: 1 }];
    });
  }

  function removerItem(skuId) {
    setItens((prev) => prev.filter((i) => i.skuId !== skuId));
  }

  function limparCarrinho() {
    setItens([]);
  }

  return (
    <CarrinhoContext.Provider
      value={{
        itens,
        adicionarItem,
        removerItem,
        limparCarrinho,
      }}
    >
      {children}
    </CarrinhoContext.Provider>
  );
}

export function useCarrinho() {
  return useContext(CarrinhoContext);
}
