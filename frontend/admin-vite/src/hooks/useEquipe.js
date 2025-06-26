// src/hooks/useEquipe.js
import { useEffect, useState } from "react";
import { listarEquipe } from "../services/equipeService";

export function useEquipe() {
  const [membros, setMembros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    async function fetchEquipe() {
      try {
        const dados = await listarEquipe();
        setMembros(dados);
      } catch (err) {
        console.error("Erro ao buscar equipe:", err);
        setErro("Erro ao carregar equipe");
      } finally {
        setLoading(false);
      }
    }

    fetchEquipe();
  }, []);

  return { membros, loading, erro };
}
