import { useEffect, useState } from "react";
import { listarSkus } from "../../services/public/lojaPublicService";

export function useLojaSkus(slug) {
  const [skus, setSkus] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    if (!slug) return;

    async function buscar() {
      try {
        setCarregando(true);

        const response = await listarSkus(slug);

        if (response?.success) {
          setSkus(response.data || []);
        } else {
          setSkus([]);
        }
      } catch (err) {
        setErro("Erro ao carregar produtos.");
        setSkus([]);
      } finally {
        setCarregando(false);
      }
    }

    buscar();
  }, [slug]);

  return { skus, carregando, erro };
}
