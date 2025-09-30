import { useState } from "react";
import { usePagamentoBoleto } from "../../../hooks/public/usePagamentoBoleto";
import logger from "../../../utils/logger";

export default function ModalPagamentoBoleto({ aberto, onClose, dadosInscricao }) {
  const { gerarBoleto, boleto, loading, erro } = usePagamentoBoleto();

  const [endereco, setEndereco] = useState({
    zip_code: "",
    street_name: "",
    street_number: "",
    neighborhood: "",
    city: "",
    federal_unit: ""
  });

  // Atualiza campos
  const handleChange = (e) => {
    const { name, value } = e.target;
    setEndereco((prev) => ({ ...prev, [name]: value }));
  };

  // Busca endereço na API ViaCEP
  const buscarEnderecoPorCep = async (cep) => {
    try {
      const cepLimpo = cep.replace(/\D/g, "");
      if (cepLimpo.length !== 8) return;

      logger.log("[ModalPagamentoBoleto] Buscando endereço via CEP:", cepLimpo);

      const resposta = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const data = await resposta.json();

      if (data.erro) {
        logger.warn("[ModalPagamentoBoleto] CEP não encontrado:", cepLimpo);
        return;
      }

      setEndereco((prev) => ({
        ...prev,
        street_name: data.logradouro || "",
        neighborhood: data.bairro || "",
        city: data.localidade || "",
        federal_unit: data.uf || ""
      }));

      logger.log("[ModalPagamentoBoleto] Endereço preenchido:", data);
    } catch (err) {
      logger.error("[ModalPagamentoBoleto] Erro ao buscar CEP:", err.message);
    }
  };

  const handleGerar = async () => {
    try {
      logger.log("[ModalPagamentoBoleto] Gerando boleto com:", {
        ...dadosInscricao,
        ...endereco
      });

      await gerarBoleto({ ...dadosInscricao, ...endereco });

      logger.log("[ModalPagamentoBoleto] Boleto gerado com sucesso!");
    } catch (err) {
      logger.error("[ModalPagamentoBoleto] Falha ao gerar boleto:", err.message);
    }
  };

  if (!aberto) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 text-gray-800">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 overflow-y-auto max-h-[90vh]">
        <h2 className="text-xl font-bold mb-4">Pagamento via Boleto</h2>

        {/* Inputs de endereço */}
        <div className="space-y-3">
          <input
            type="text"
            name="zip_code"
            placeholder="CEP"
            value={endereco.zip_code}
            onChange={handleChange}
            onBlur={() => buscarEnderecoPorCep(endereco.zip_code)}
            className="w-full border rounded p-2"
          />
          <input
            type="text"
            name="street_name"
            placeholder="Rua"
            value={endereco.street_name}
            onChange={handleChange}
            className="w-full border rounded p-2"
          />
          <input
            type="text"
            name="street_number"
            placeholder="Número"
            value={endereco.street_number}
            onChange={handleChange}
            className="w-full border rounded p-2"
          />
          <input
            type="text"
            name="neighborhood"
            placeholder="Bairro"
            value={endereco.neighborhood}
            onChange={handleChange}
            className="w-full border rounded p-2"
          />
          <input
            type="text"
            name="city"
            placeholder="Cidade"
            value={endereco.city}
            onChange={handleChange}
            className="w-full border rounded p-2"
          />
          <input
            type="text"
            name="federal_unit"
            placeholder="Estado (UF)"
            value={endereco.federal_unit}
            onChange={handleChange}
            className="w-full border rounded p-2"
          />
        </div>

        {/* Erro */}
        {erro && <p className="text-red-600 mt-2">{erro}</p>}

        {/* Resultado */}
        {boleto && (
          <div className="mt-4 p-3 border rounded bg-gray-50">
            <p><strong>Código de inscrição:</strong> {boleto.codigo_inscricao}</p>
            <p><strong>Status:</strong> {boleto.status}</p>
            <p>
              <strong>Vencimento:</strong>{" "}
              {boleto.date_of_expiration
                ? new Date(boleto.date_of_expiration).toLocaleDateString("pt-BR")
                : "-"}
            </p>
            <a
              href={boleto.ticket_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              Acessar Boleto (PDF)
            </a>
          </div>
        )}

        {/* Botões */}
        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Fechar
          </button>
          <button
            onClick={handleGerar}
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? "Gerando..." : "Gerar Boleto"}
          </button>
        </div>
      </div>
    </div>
  );
}
