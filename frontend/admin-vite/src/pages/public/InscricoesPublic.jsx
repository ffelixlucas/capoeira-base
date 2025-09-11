// pages/public/InscricoesPublic.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { listarEventosPublicos } from "../../services/agendaService"; // 🔹 função pública
import { logger } from "../../utils/logger";

function InscricoesPublic() {
  const navigate = useNavigate();
  const [eventos, setEventos] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregarEventos() {
      try {
        const dados = await listarEventosPublicos(); // 🔹 usa rota pública
        setEventos(dados);
      } catch (err) {
        logger.error("Erro ao carregar eventos públicos:", err);
      } finally {
        setCarregando(false);
      }
    }
    carregarEventos();
  }, []);

  return (
    <div className="w-full">
      <h1 className="text-2xl font-bold text-cor-titulo mb-6 text-center">
        Inscreva-se nos próximos eventos
      </h1>

      {carregando && (
        <p className="text-center text-cor-texto/80">Carregando eventos...</p>
      )}

      {!carregando && eventos.length === 0 && (
        <p className="text-center text-cor-texto/70">
          Nenhum evento disponível para inscrição no momento.
        </p>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        {eventos.map((evento) => (
          <div
            key={evento.id}
            className="bg-white rounded-xl shadow-md p-4 flex flex-col items-start"
          >
            {evento.imagem_url && (
              <img
                src={evento.imagem_url}
                alt={evento.titulo}
                className="w-full h-40 object-cover rounded-lg mb-3"
              />
            )}

            <h2 className="text-lg font-semibold text-black mb-1">
              {evento.titulo}
            </h2>

            <p className="text-sm text-gray-700 mb-1">
              {new Date(evento.data_inicio).toLocaleDateString("pt-BR")}
            </p>

            {evento.valor && (
              <p className="text-sm text-gray-600 mb-2">
                Valor:{" "}
                <span className="font-semibold text-cor-primaria">
                  R$ {parseFloat(evento.valor).toFixed(2)}
                </span>
              </p>
            )}

            <p className="text-sm text-gray-700 mb-3">
              {evento.descricao_curta || "Sem descrição"}
            </p>

            <button
              className="bg-cor-primaria text-white py-2 px-4 rounded-lg text-sm font-medium self-stretch hover:bg-cor-primaria/90 transition"
              onClick={() => navigate(`/inscrever/${evento.id}`)} // usa rota pública
            >
              Inscrever-se
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default InscricoesPublic;
