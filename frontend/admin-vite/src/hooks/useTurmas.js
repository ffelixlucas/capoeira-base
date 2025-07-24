// src/hooks/useTurmas.js
import { useEffect, useState } from "react";
import { listarTurmas } from "../services/turmaService";
import { toast } from "react-toastify";

export function useTurmas() {
  const [turmas, setTurmas] = useState([]);
  const [carregando, setCarregando] = useState(false);

  async function carregarTurmas() {
    setCarregando(true);
    try {
      const lista = await listarTurmas();
      setTurmas(lista);
    } catch (err) {
      toast.error("Erro ao carregar turmas");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarTurmas();
  }, []);

  return { turmas, carregando, carregarTurmas };
}
