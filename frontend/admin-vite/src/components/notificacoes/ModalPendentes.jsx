// src/components/notificacoes/ModalPendentes.jsx
import { useEffect, useState } from "react";
import { listarPendentes, atualizarStatus } from "../../services/notificacoesService";

export default function ModalPendentes({ onClose }) {
  const [alunos, setAlunos] = useState([]);
  const [loading, setLoading] = useState(true);

  const carregarPendentes = async () => {
    try {
      setLoading(true);
      const data = await listarPendentes();
      setAlunos(data);
    } catch (error) {
      console.error("Erro ao carregar pendentes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAprovar = async (id) => {
    try {
      await atualizarStatus(id, "ativo");
      await carregarPendentes();
    } catch (error) {
      console.error("Erro ao aprovar matrícula:", error);
    }
  };

  const handleRejeitar = async (id) => {
    try {
      await atualizarStatus(id, "inativo");
      await carregarPendentes();
    } catch (error) {
      console.error("Erro ao rejeitar matrícula:", error);
    }
  };

  const abrirWhatsApp = (telefone, nome) => {
    if (!telefone) return;
    const numero = telefone.replace(/\D/g, ""); // só dígitos
    const mensagem = encodeURIComponent(`Olá ${nome}, sua matrícula está em análise. Poderia confirmar as informações?`);
    window.open(`https://wa.me/55${numero}?text=${mensagem}`, "_blank");
  };

  useEffect(() => {
    carregarPendentes();
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-4">
        <h2 className="text-lg font-semibold mb-4">Matrículas Pendentes</h2>

        {loading ? (
          <p className="text-gray-500">Carregando...</p>
        ) : alunos.length === 0 ? (
          <p className="text-gray-600">Nenhuma matrícula pendente.</p>
        ) : (
          <ul className="space-y-3 max-h-80 overflow-y-auto">
            {alunos.map((aluno) => (
              <li
                key={aluno.id}
                className="flex items-center justify-between border p-2 rounded-md"
              >
                <div>
                  <p className="font-medium">{aluno.nome}</p>
                  <p className="text-sm text-gray-500">{aluno.email}</p>
                  <p className="text-sm text-gray-500">{aluno.telefone}</p>
                </div>
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => handleAprovar(aluno.id)}
                    className="px-2 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 text-xs"
                  >
                    Aprovar
                  </button>
                  <button
                    onClick={() => handleRejeitar(aluno.id)}
                    className="px-2 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 text-xs"
                  >
                    Rejeitar
                  </button>
                  <button
                    onClick={() => abrirWhatsApp(aluno.telefone, aluno.nome)}
                    className="px-2 py-1 bg-green-700 text-white rounded-md hover:bg-green-800 text-xs"
                  >
                    WhatsApp
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
