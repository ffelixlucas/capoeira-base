import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import BotaoVoltarDashboard from "../components/ui/BotaoVoltarDashboard";
import InscritoList from "../components/inscricoes/InscritoList";

// Aqui depois vamos criar o serviço buscarInscritosPorEvento
import { buscarInscritosPorEvento } from "../services/inscricaoService";

function InscritosEvento() {
  const { eventoId } = useParams();
  const [inscritos, setInscritos] = useState([]);
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    carregarInscritos();
  }, [eventoId]);

  async function carregarInscritos() {
    setCarregando(true);
    try {
      // vamos simular por enquanto
      const dados = await buscarInscritosPorEvento(eventoId);
      setInscritos(dados);
    } catch (err) {
      console.error("Erro ao carregar inscritos:", err);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <BotaoVoltarDashboard className="mb-4" />
      <h1 className="text-2xl font-bold mb-4">
        Gerenciar Inscritos - Evento {eventoId}
      </h1>

      <InscritoList
        inscritos={inscritos}
        carregando={carregando}
        onVerMais={(i) => alert(`Abrir modal do inscrito: ${i.nome}`)}
      />
    </div>
  );
}

export default InscritosEvento;
