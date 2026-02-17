import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCarrinho } from "../../../contexts/public/loja/CarrinhoContext";
import { usePagamentoLoja } from "../../../hooks/public/pagamentos/usePagamentoLoja";
import ModalPagamentoPixPublic from "../../../components/public/pagamentos/ModalPagamentoPixPublic";
import { QrCode, CreditCard, Landmark, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

function formatarPreco(valor) {
  return Number(valor).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

/* ============================= */
/* CARD MÉTODO PAGAMENTO         */
/* ============================= */

const MetodoPagamentoCard = ({
  ativo,
  onClick,
  cor,
  icon: Icon,
  label,
  valor,
  descricao,
}) => (
  <motion.button
    type="button"
    whileHover={{ scale: 1.03 }}
    whileTap={{ scale: 0.97 }}
    onClick={onClick}
    className={`relative flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-colors shadow-sm text-center
      ${
        ativo
          ? `${cor.border} ${cor.bg}`
          : "border-gray-200 bg-white hover:bg-gray-50"
      }
    `}
  >
    <Icon className={`w-6 h-6 mb-2 ${cor.icon}`} />
    <span className="text-sm font-medium text-gray-800">{label}</span>
    <span className="text-base font-semibold text-gray-900">
      {valor}
    </span>

    {descricao && (
      <span className="block text-xs text-gray-500 mt-1">
        {descricao}
      </span>
    )}

    {ativo && (
      <CheckCircle2
        className={`w-5 h-5 absolute top-2 right-2 ${cor.icon}`}
      />
    )}
  </motion.button>
);

/* ============================= */
/* COMPONENTE PRINCIPAL          */
/* ============================= */

export default function CheckoutPublic() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { itens } = useCarrinho();
  const { pagarComPix, loading } = usePagamentoLoja();

  const [metodoPagamento, setMetodoPagamento] = useState("");
  const [pagamentoPix, setPagamentoPix] = useState(null);
  const [modalAberto, setModalAberto] = useState(false);

  const [cliente, setCliente] = useState({
    nome: "",
    cpf: "",
    telefone: "",
    email: "",
  });

  const subtotal = itens.reduce(
    (acc, item) => acc + item.preco * item.quantidade,
    0
  );

  if (itens.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-md text-center">
          <h2 className="text-xl font-bold mb-4">
            Seu carrinho está vazio
          </h2>
          <button
            onClick={() => navigate(`/loja/${slug}`)}
            className="bg-black text-white px-6 py-2 rounded-lg"
          >
            Voltar para loja
          </button>
        </div>
      </div>
    );
  }

  async function handlePagamento() {
    try {
      if (metodoPagamento === "pix") {
        const pagamento = await pagarComPix({
          slug,
          cliente,
          itens,
        });

        setPagamentoPix(pagamento);
        setModalAberto(true);
      }
    } catch (err) {
      console.error(err);
      alert("Erro ao iniciar pagamento.");
    }
  }

  return (
    <div className="min-h-screen py-10 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl p-8 text-gray-700">

        {/* VOLTAR */}
        <button
          onClick={() => navigate(`/loja/${slug}`)}
          className="text-sm text-gray-500 mb-4 hover:text-black"
        >
          ← Voltar para loja
        </button>

        <h1 className="text-2xl font-bold mb-8 text-gray-800">
          Finalizar Compra
        </h1>

        {/* ITENS */}
        <div className="space-y-4 mb-8">
          {itens.map((item) => (
            <div
              key={item.skuId}
              className="flex justify-between border-b pb-3 text-gray-700"
            >
              <div>
                {item.quantidade}x {item.nome}
              </div>
              <div>
                {formatarPreco(item.preco * item.quantidade)}
              </div>
            </div>
          ))}
        </div>

        {/* TOTAL */}
        <div className="flex justify-between font-bold text-lg mb-8 text-gray-900">
          <span>Total</span>
          <span>{formatarPreco(subtotal)}</span>
        </div>

        {/* DADOS DO CLIENTE */}
        <div className="space-y-4 mb-10">
          <h2 className="font-semibold text-lg text-gray-800">
            Dados do Comprador
          </h2>

          {["nome", "cpf", "telefone", "email"].map((campo) => (
            <input
              key={campo}
              type="text"
              placeholder={campo.toUpperCase()}
              value={cliente[campo]}
              onChange={(e) =>
                setCliente({ ...cliente, [campo]: e.target.value })
              }
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          ))}
        </div>

        {/* MÉTODO DE PAGAMENTO BONITO */}
        <div className="border-t pt-6 space-y-4 mb-10">
          <p className="text-sm font-semibold text-gray-700">
            Escolha a forma de pagamento
          </p>

          <div className="grid grid-cols-3 gap-4">

            <MetodoPagamentoCard
              ativo={metodoPagamento === "pix"}
              onClick={() => setMetodoPagamento("pix")}
              cor={{
                border: "border-green-500",
                bg: "bg-green-50",
                icon: "text-green-600",
              }}
              icon={QrCode}
              label="Pix"
              valor={formatarPreco(subtotal)}
            />

            <MetodoPagamentoCard
              ativo={false}
              onClick={() => {}}
              cor={{
                border: "border-blue-500",
                bg: "bg-blue-50",
                icon: "text-blue-600",
              }}
              icon={CreditCard}
              label="Cartão"
              valor={formatarPreco(subtotal)}
              descricao="em breve"
            />

            <MetodoPagamentoCard
              ativo={false}
              onClick={() => {}}
              cor={{
                border: "border-yellow-500",
                bg: "bg-yellow-50",
                icon: "text-yellow-600",
              }}
              icon={Landmark}
              label="Boleto"
              valor={formatarPreco(subtotal)}
              descricao="em breve"
            />

          </div>
        </div>

        {/* BOTÃO PAGAMENTO */}
        <button
          onClick={handlePagamento}
          disabled={
            loading ||
            !metodoPagamento ||
            !cliente.nome ||
            !cliente.cpf ||
            !cliente.telefone ||
            !cliente.email
          }
          className="w-full bg-green-600 hover:bg-green-700 transition text-white py-3 rounded-lg font-semibold disabled:opacity-50"
        >
          {loading ? "Processando..." : "Finalizar Pagamento"}
        </button>
      </div>

      {/* MODAL PIX */}
      {modalAberto && (
        <ModalPagamentoPixPublic
        isOpen={modalAberto}
        onClose={() => setModalAberto(false)}
        pagamento={pagamentoPix}
        slug={slug}
        onSucesso={() => {
        }}
      />
      
      )}
    </div>
  );
}
