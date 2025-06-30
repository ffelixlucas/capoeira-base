import { useEffect, useState } from "react";
import { listarEquipe } from "../services/equipeService";

export function useEquipe() {
  const [membros, setMembros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  const carregarEquipe = async () => {
    setLoading(true);
    try {
      const dados = await listarEquipe();
      setMembros(dados);
      setErro(null);
    } catch (err) {
      console.error("Erro ao buscar equipe:", err);
      setErro("Erro ao carregar equipe");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarEquipe();
  }, []);

  return { membros, loading, erro, carregarEquipe };
}
