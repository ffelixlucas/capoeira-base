import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import BotaoVoltarDashboard from "../components/ui/BotaoVoltarDashboard";
import { listarEventos } from "../services/agendaService";

function Inscricoes() {
  const navigate = useNavigate();
  const [eventos, setEventos] = useState([]);
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    carregarEventos();
  }, []);

  async function carregarEventos() {
    setCarregando(true);
    try {
      const dados = await listarEventos();
      // filtrar apenas os com inscrição obrigatória
      setEventos(dados.filter((e) => e.com_inscricao));
    } catch (err) {
      console.error("Erro ao carregar eventos:", err);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <BotaoVoltarDashboard className="mb-4" />
      <h1 className="text-2xl font-bold mb-4">Gerenciar Inscrições</h1>

      <button
        onClick={() => navigate("/agenda")}
        className="mb-4 bg-green-600 text-white px-4 py-2 rounded"
      >
        ← Voltar para Agenda
      </button>

      {carregando && (
        <p className="text-center text-gray-500 my-6">Carregando eventos...</p>
      )}

      {!carregando && eventos.length === 0 && (
        <p className="text-center text-gray-500 my-6">
          Nenhum evento com inscrição obrigatória encontrado.
        </p>
      )}

      {/* Listagem dos eventos */}
      <div className="grid gap-4">
        {eventos.map((evento) => (
          <div
            key={evento.id}
            className="bg-white rounded-lg p-4 shadow-md flex flex-col"
          >
            <h2 className="text-lg font-semibold mb-1 text-black">{evento.titulo}</h2>
            <span className="text-sm text-gray-600 mb-2">
              {new Date(evento.data_inicio).toLocaleDateString("pt-BR")} - R${" "}
              {parseFloat(evento.valor).toFixed(2)}
            </span>
            <p className="text-sm text-gray-700 mb-3">
              {evento.descricao_curta || "Sem descrição"}
            </p>
            <button
              className="bg-blue-600 text-white py-1 px-3 rounded text-sm self-start"
              onClick={() => navigate(`/inscricoes/${evento.id}`)} // 🚀 Nova rota
            >
              Gerenciar Inscritos
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Inscricoes;
