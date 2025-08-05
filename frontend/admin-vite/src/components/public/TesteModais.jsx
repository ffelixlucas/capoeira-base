import { useState } from "react";
import ModalConfirmacaoPagamento from "./ModalConfirmacaoPagamento.jsx";
import ModalErroPagamento from "./ModalErroPagamento";

export default function TesteModais() {
  const [showSucesso, setShowSucesso] = useState(false);
  const [showErro, setShowErro] = useState(false);

  const dadosMock = {
    nome: "Lucas Felix",
    codigo_inscricao: "GCB-2025-EVT16-0012",
    evento: {
      titulo: "Batizado Nacional 2025",
      data: "2025-09-15",
      local: "Ginásio Central de Capoeira",
    },
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Testar Modais</h1>

      <div className="flex gap-4">
        <button
          onClick={() => setShowSucesso(true)}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Abrir Modal de Sucesso
        </button>

        <button
          onClick={() => setShowErro(true)}
          className="bg-red-600 text-white px-4 py-2 rounded"
        >
          Abrir Modal de Erro
        </button>
      </div>

      <ModalConfirmacaoPagamento
        isOpen={showSucesso}
        onClose={() => setShowSucesso(false)}
        dados={dadosMock}
      />

      <ModalErroPagamento
        isOpen={showErro}
        onClose={() => setShowErro(false)}
        dados={dadosMock}
      />
    </div>
  );
}
