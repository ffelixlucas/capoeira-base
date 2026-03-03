import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, Package, Truck, Shield, ArrowRight } from "lucide-react";
import axios from "axios";
import { usePublicSiteUrl } from "../../../hooks/public/loja/usePublicSiteUrl";

export default function PedidoConfirmado() {
  const { id, slug } = useParams();
  const navigate = useNavigate();
  const siteUrl = usePublicSiteUrl(slug);

  const [pedido, setPedido] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregarPedido() {
      try {
        const response = await axios.get(`/api/public/pedidos/${slug}/${id}`);
        setPedido(response.data.data);
      } catch (err) {
        console.error("Erro ao buscar pedido", err);
      } finally {
        setLoading(false);
      }
    }

    if (id && slug) carregarPedido();
  }, [id, slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-cor-fundo flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 border-4 border-cor-primaria/30 border-t-cor-primaria rounded-full animate-spin mx-auto mb-4" />
          <p className="text-on-surface text-lg font-medium">Preparando sua confirmação...</p>
        </motion.div>
      </div>
    );
  }

  if (!pedido) {
    return (
      <div className="min-h-screen bg-cor-fundo flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface text-on-surface rounded-3xl p-8 max-w-md w-full text-center border border-cor-secundaria/20 shadow-xl"
        >
          <Package className="w-16 h-16 mx-auto mb-4 text-on-surface/30" />
          <h2 className="text-2xl font-bold mb-3">Pedido não encontrado</h2>
          <p className="text-on-surface/70 mb-6">Pode ter sido removido ou o link está incorreto.</p>
          <button
            onClick={() => navigate("/")}
            className="w-full min-h-[52px] bg-cor-primaria text-white font-semibold rounded-2xl hover:bg-cor-primaria/90 transition-all shadow-md hover:shadow-lg"
          >
            Voltar ao Início
          </button>
        </motion.div>
      </div>
    );
  }

  const total = pedido.itens.reduce((acc, item) => acc + Number(item.subtotal), 0);

  return (
    <div className="min-h-screen bg-cor-fundo pb-12">
      {/* Header */}
      <div className="relative border-b border-cor-secundaria/10 bg-surface/5 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-4 py-10 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 180, damping: 15 }}
            className="mx-auto mb-5 w-20 h-20 rounded-full bg-emerald-500/10 backdrop-blur-md border border-emerald-500/20 flex items-center justify-center shadow-lg"
          >
            <CheckCircle className="w-10 h-10 text-emerald-500" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-3xl sm:text-4xl font-bold text-on-surface tracking-tight"
          >
            Pedido Confirmado!
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-3 text-on-surface/70 text-lg max-w-xl mx-auto"
          >
            Obrigado pela compra! Seu pedido <span className="font-semibold text-cor-primaria">#{pedido.id}</span> foi processado com sucesso.
          </motion.p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Status cards com cores distintas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8"
        >
          {/* Pagamento - Verde */}
          <div className="bg-emerald-500/5 backdrop-blur-sm rounded-2xl p-5 border border-emerald-500/20 hover:border-emerald-500/40 transition-all">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-emerald-500" />
              </div>
              <div>
                <p className="text-xs text-on-surface/60 uppercase tracking-wide">Pagamento</p>
                <p className="font-semibold text-emerald-500">Aprovado</p>
              </div>
            </div>
          </div>

          {/* Pedido - Cor Primária (Roxo/Azul) */}
          <div className="bg-cor-primaria/5 backdrop-blur-sm rounded-2xl p-5 border border-cor-primaria/20 hover:border-cor-primaria/40 transition-all">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-cor-primaria/10 flex items-center justify-center">
                <Package className="w-6 h-6 text-cor-primaria" />
              </div>
              <div>
                <p className="text-xs text-on-surface/60 uppercase tracking-wide">Pedido</p>
                <p className="font-semibold text-cor-primaria">#{pedido.id}</p>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna principal */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Itens do pedido */}
            <div className="bg-surface rounded-3xl border border-cor-secundaria/15 overflow-hidden shadow-xl">
              <div className="px-6 py-5 border-b border-cor-secundaria/10">
                <h2 className="text-lg font-semibold flex items-center gap-2 text-on-surface">
                  <Package className="w-5 h-5 text-cor-primaria" />
                  Itens do Pedido
                </h2>
              </div>

              <div className="p-6 space-y-5">
                {pedido.itens.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.08 }}
                    className="flex items-center justify-between py-1 group"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-10 h-10 rounded-lg bg-cor-secundaria/10 border border-cor-secundaria/10 flex items-center justify-center group-hover:border-cor-primaria/30 transition-colors">
                        <span className="text-base font-bold text-cor-primaria">{item.quantidade}x</span>
                      </div>
                      <div>
                        <p className="font-medium text-on-surface">{item.produto_nome}</p>
                        <p className="text-sm text-on-surface/50">Quantidade: {item.quantidade}</p>
                      </div>
                    </div>
                    <p className="font-semibold text-on-surface whitespace-nowrap">
                      R$ {Number(item.subtotal).toFixed(2)}
                    </p>
                  </motion.div>
                ))}
              </div>

              <div className="bg-cor-secundaria/5 px-6 py-5 border-t border-cor-secundaria/10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-on-surface/70">Total do Pedido</p>
                    <p className="text-xs text-on-surface/50">Inclui todos os itens</p>
                  </div>
                  <p className="text-2xl font-bold text-cor-primaria">
                    R$ {total.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            {/* Dados do cliente */}
            <div className="bg-surface rounded-3xl border border-cor-secundaria/15 p-6 shadow-xl">
              <h2 className="text-lg font-semibold mb-5 flex items-center gap-2 text-on-surface">
                <Shield className="w-5 h-5 text-cor-primaria" />
                Dados do Cliente
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="p-4 bg-cor-secundaria/5 rounded-2xl border border-cor-secundaria/10">
                  <p className="text-xs text-on-surface/50 mb-1 uppercase tracking-wide">Nome completo</p>
                  <p className="font-medium text-on-surface">{pedido.nome_cliente}</p>
                </div>
                <div className="p-4 bg-cor-secundaria/5 rounded-2xl border border-cor-secundaria/10">
                  <p className="text-xs text-on-surface/50 mb-1 uppercase tracking-wide">E-mail</p>
                  <p className="font-medium text-on-surface break-all">{pedido.email}</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-6 lg:sticky lg:top-8 lg:self-start"
          >
            <div className="bg-surface rounded-3xl border border-cor-secundaria/15 p-6 shadow-xl">
              <h3 className="font-semibold mb-4 text-on-surface">Acompanhamento</h3>
              <p className="text-sm text-on-surface/70 mb-4">
                Atualizações do status serão enviadas por e-mail.
              </p>
              <div className="flex items-center gap-3 text-sm">
                <Truck className="w-5 h-5 text-cor-primaria" />
                <span className="text-on-surface/80">Processando pagamento</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 text-xs text-on-surface/40 py-3">
              <Shield className="w-4 h-4" />
              <span>Compra 100% segura</span>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-3"
        >
          <button
            onClick={() => navigate(`/loja/${slug}`)}
            className="w-full min-h-[56px] bg-cor-primaria hover:bg-cor-primaria/90 text-white font-semibold rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl flex items-center justify-center gap-3 text-lg group"
          >
            Voltar para a Loja
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>

          <a
            href={siteUrl}
            className="w-full min-h-[56px] border border-cor-secundaria/30 text-on-surface font-semibold rounded-2xl transition-all duration-300 hover:bg-cor-secundaria/10 flex items-center justify-center"
          >
            Voltar para o site
          </a>
        </motion.div>

        <p className="text-center text-sm text-on-surface/50 mt-6">
          Confirmação enviada para <span className="font-medium text-on-surface">{pedido.email}</span>
        </p>
      </div>
    </div>
  );
}