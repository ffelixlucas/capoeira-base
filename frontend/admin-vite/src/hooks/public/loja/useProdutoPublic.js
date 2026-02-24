//src/hooks/public/loja/useProdutoPublic.js
import { useEffect, useState } from "react";
import { buscarSkuPorId } from "../../../services/public/lojaPublicService";

export function useProdutoPublic(slug, id) {
  const [produto, setProduto] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    if (!slug || !id) return;

    async function buscar() {
      try {
        setCarregando(true);

        const response = await buscarSkuPorId(slug, id);

        if (response?.success) {
          setProduto(response.data);
        } else {
          setProduto(null);
        }
      } catch (err) {
        setErro("Erro ao carregar produto.");
        setProduto(null);
      } finally {
        setCarregando(false);
      }
    }

    buscar();
  }, [slug, id]);

  return { produto, carregando, erro };
}
