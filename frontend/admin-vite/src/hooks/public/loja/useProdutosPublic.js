import { useEffect, useState } from "react";
import { listarProdutos } from "../../../services/public/loja/lojaPublicService"
export function useProdutosPublic(slug) {
  const [produtos, setProdutos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    if (!slug) return;

    async function buscar() {
      try {
        setCarregando(true);

        const response = await listarProdutos(slug);

        if (response?.success) {
          setProdutos(response.data);
        } else {
          setProdutos([]);
        }
      } catch (err) {
        setErro("Erro ao carregar produtos.");
        setProdutos([]);
      } finally {
        setCarregando(false);
      }
    }

    buscar();
  }, [slug]);

  return { produtos, carregando, erro };
}
