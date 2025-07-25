import { useState, useEffect } from "react";
import { listarEventos } from "../services/agendaService";

export function useAgenda() {
  const [eventos, setEventos] = useState([]);
  const [carregando, setCarregando] = useState(false);

  async function carregarEventos() {
    setCarregando(true);
    try {
      const dados = await listarEventos();
      setEventos(dados);
    } catch (error) {
      console.error("Erro ao carregar eventos:", error);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarEventos();
  }, []);

  return { eventos, carregarEventos, carregando };
}
