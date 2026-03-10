import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { buscarPedidoLoja, marcarPedidoPronto, marcarPedidoEntregue, estornarPedido } from "../services/lojaService";

export default function PedidoDetalhe() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [pedido, setPedido] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadingAcao, setLoadingAcao] = useState(false);

    useEffect(() => {
        async function carregar() {
            try {
                const data = await buscarPedidoLoja(id);
                setPedido(data);
            } catch (err) {
                console.error("Erro ao buscar pedido:", err);
            } finally {
                setLoading(false);
            }
        }

        carregar();
    }, [id]);

    async function handleLiberar() {
        try {
            setLoadingAcao(true);
            await marcarPedidoPronto(id);

            setPedido((prev) => ({
                ...prev,
                status_operacional: "pronto_retirada",
            }));
        } catch (err) {
            console.error("Erro ao liberar pedido:", err);
        } finally {
            setLoadingAcao(false);
        }
    }

    async function handleEntregue() {
        const confirmou = confirm(
            "Confirmar entrega do pedido?\n\nUse este botão somente quando o cliente já retirou o produto."
        );
        if (!confirmou) return;

        try {
            setLoadingAcao(true);
            await marcarPedidoEntregue(id);

            setPedido((prev) => ({
                ...prev,
                status_operacional: "finalizado",
            }));
        } catch (err) {
            console.error("Erro ao marcar como entregue:", err);
        } finally {
            setLoadingAcao(false);
        }
    }

    async function handleEstornar() {
        const confirmou = confirm(
            "Confirmar estorno deste pedido?\n\n" +
            "Apos confirmar:\n" +
            "- o pagamento sera estornado no gateway;\n" +
            "- o estoque dos itens sera devolvido;\n" +
            "- o pedido ficara com status financeiro 'estornado'."
        );
        if (!confirmou) return;

        try {
            setLoadingAcao(true);
            await estornarPedido(id);

            setPedido((prev) => ({
                ...prev,
                status_financeiro: "estornado",
            }));
        } catch (err) {
            console.error("Erro ao estornar:", err);
            alert("Erro ao estornar pedido");
        } finally {
            setLoadingAcao(false);
        }
    }


    if (loading) {
        return (
            <div className="min-h-screen bg-cor-fundo p-4 text-cor-texto">
                Carregando pedido...
            </div>
        );
    }

    if (!pedido) {
        return (
            <div className="min-h-screen bg-cor-fundo p-4 text-cor-texto">
                Pedido não encontrado.
            </div>
        );
    }

    const totalCalculado = Array.isArray(pedido.itens)
        ? pedido.itens.reduce(
            (acc, item) =>
                acc + Number(item.preco_unitario) * Number(item.quantidade),
            0
        )
        : 0;


    return (
        <div className="min-h-screen bg-cor-fundo p-4 space-y-4">
            <button
                onClick={() => navigate(-1)}
                className="text-sm text-cor-primaria font-medium"
            >
                ← Voltar
            </button>

            <h1 className="text-xl font-semibold text-cor-titulo">
                Pedido #{pedido.id}
            </h1>

            <div className="bg-surface text-on-surface rounded-2xl p-4 border border-cor-secundaria/30 space-y-4">
                <div>
                    <p className="text-sm font-medium">{pedido.nome_cliente}</p>
                    <p className="text-xs opacity-70">{pedido.email}</p>
                    <p className="text-xs opacity-70">{pedido.telefone}</p>
                </div>

                <div>
                    <p className="text-sm font-semibold mb-2">Itens</p>
                    <div className="space-y-2">
                        {pedido.itens?.map((item) => (
                            <div key={item.id} className="flex justify-between text-sm">
                                <span>{item.nome_produto}</span>
                                <span>
                                    {item.quantidade}x R$ {Number(item.preco_unitario).toFixed(2)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="pt-3 border-t">
                    <p className="text-sm">
                        Total: <strong>R$ {Number(totalCalculado).toFixed(2)}</strong>
                    </p>
                </div>

                {pedido.status_financeiro === "pago" && (
                    <button
                        onClick={handleEstornar}
                        disabled={loadingAcao}
                        className="w-full mt-4 py-3 rounded-xl bg-red-600 text-white font-semibold"
                    >
                        {loadingAcao ? "Estornando..." : "Estornar pedido"}
                    </button>
                )}

{pedido.status_operacional === "em_separacao" 
    && pedido.status_financeiro === "pago" && (                    <button
                        onClick={handleLiberar}
                        disabled={loadingAcao}
                        className="w-full mt-4 py-3 rounded-xl bg-cor-primaria text-black font-semibold"
                    >
                        {loadingAcao ? "Liberando..." : "Marcar como pronto"}
                    </button>
                )}
                {pedido.status_operacional === "pronto_retirada" && (
                    <button
                        onClick={handleEntregue}
                        disabled={loadingAcao}
                        className="w-full mt-3 py-3 rounded-xl bg-green-600 text-white font-semibold"
                    >
                        {loadingAcao ? "Atualizando..." : "Marcar como entregue"}
                    </button>
                )}

            </div>
        </div>
    );
}
