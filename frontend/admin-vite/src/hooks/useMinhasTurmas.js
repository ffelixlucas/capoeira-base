// src/hooks/useMinhasTurmas.js
import { useEffect, useState } from "react";
import { listarTurmas, getMinhasTurmas } from "../services/turmaService";
import { toast } from "react-toastify";

export function useMinhasTurmas(usuario) {
  const [turmas, setTurmas] = useState([]);
  const [turmaSelecionada, setTurmaSelecionada] = useState(null);
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    async function carregar() {
      if (!usuario) return;
      setCarregando(true);

      try {
        let lista = [];

        if (usuario?.roles?.includes("admin")) {
          const todas = await listarTurmas(); 
          lista = [
            { id: "todos", nome: "Todas" },
            ...todas,
            { id: "sem_turma", nome: "Sem turma" },
          ];
        } else {
          lista = await getMinhasTurmas(); 
        }

        setTurmas(lista);

        if (lista.length === 1) {
          setTurmaSelecionada(lista[0].id);
        }
      } catch (err) {
        console.error("Erro ao carregar turmas:", err);
        toast.error("Erro ao carregar suas turmas");
      } finally {
        setCarregando(false);
      }
    }

    carregar();
  }, [usuario]);

  return {
    turmas,
    turmaSelecionada,
    setTurmaSelecionada,
    carregando,
  };
}
