import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { listarEventosPublicos } from "../../services/agendaService";
import { logger } from "../../utils/logger";

function InscricoesPublic() {
  const navigate = useNavigate();
  const { slug } = useParams(); // 🟦 pega o slug da URL
  const [eventos, setEventos] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregarEventos() {
      if (!slug) return; // evita chamadas sem org

      setCarregando(true);
      try {
        logger.info("📡 Carregando eventos públicos para org:", slug);
        const dados = await listarEventosPublicos(slug); // 🟦 passa slug
        setEventos(Array.isArray(dados) ? dados : []);
      } catch (err) {
        logger.error("❌ Erro ao carregar eventos públicos:", err);
      } finally {
        setCarregando(false);
      }
    }

    carregarEventos();
  }, [slug]);

  return (
    <div className="w-full">
      <h1 className="text-xl sm:text-2xl font-bold text-cor-titulo mb-5 sm:mb-6 text-center px-2">
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

      <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
        {eventos.map((evento) => (
          <div
            key={evento.id}
            className="bg-white rounded-xl shadow-md p-3 sm:p-4 flex flex-col items-start w-full overflow-hidden"
          >
            {evento.imagem_url && (
              <img
                src={evento.imagem_url}
                alt={evento.titulo}
                className="w-full h-40 sm:h-44 object-cover rounded-lg mb-3"
              />
            )}

            <h2 className="text-base sm:text-lg font-semibold text-black mb-1 leading-snug break-words">
              {evento.titulo}
            </h2>

            <p className="text-xs sm:text-sm text-gray-700 mb-1">
              {new Date(evento.data_inicio).toLocaleDateString("pt-BR")}
            </p>

            {evento.valor && (
              <p className="text-xs sm:text-sm text-gray-600 mb-2">
                Valor:{" "}
                <span className="font-semibold text-cor-primaria">
                  R$ {parseFloat(evento.valor).toFixed(2)}
                </span>
              </p>
            )}

            <p className="text-sm text-gray-700 mb-3 break-words">
              {evento.descricao_curta || "Sem descrição"}
            </p>

            <button
              className="bg-cor-primaria text-white py-2.5 px-4 rounded-lg text-sm font-medium self-stretch hover:bg-cor-primaria/90 transition min-h-11"
              onClick={() => navigate(`/inscrever/${slug}/${evento.id}`)} // 🟦 mantém slug na navegação
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
