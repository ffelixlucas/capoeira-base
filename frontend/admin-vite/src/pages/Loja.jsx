import React, { useEffect, useState } from "react";
import useLojaDashboard from "../hooks/loja/useLojaDashboard";
import { listarPedidosLoja } from "../services/lojaService";
import CardEstat from "../components/ui/CardEstat";
import PedidoCard from "../components/loja/PedidoCard";
import { formatarStatusOperacional, obterStatusOperacionalConfig } from "../utils/lojaStatus";
import {
  ShoppingBagIcon,
  CurrencyDollarIcon,
  TruckIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

import { Link } from "react-router-dom";
import { ArchiveBoxIcon } from "@heroicons/react/24/outline";

export default function Loja() {
  const { estatisticas, loading } = useLojaDashboard();
  console.log(estatisticas);
  const [pedidos, setPedidos] = useState([]);
  const [abaAtiva, setAbaAtiva] = useState("em_separacao");
  const [loadingPedidos, setLoadingPedidos] = useState(true);

  const statusDisponiveis = [
    {
      id: "em_separacao",
      label: "Em separação",
      labelCurto: "Separação",
      contador: estatisticas?.em_separacao || 0,
    },
    {
      id: "pronto_retirada",
      label: "Pronto retirada",
      labelCurto: "Prontos",
      contador: estatisticas?.pronto_retirada || 0,
    },
    {
      id: "finalizado",
      label: "Entregue",
      labelCurto: "Entregues",
      contador: estatisticas?.entregues || 0,
    },
    {
      id: "estornado",
      label: "Estornados",
      labelCurto: "Estornados",
      contador: estatisticas?.estornados || 0,
    },

  ];

  async function carregarPedidos() {
    try {
      setLoadingPedidos(true);
      let filtro = {};

      if (abaAtiva === "estornado") {
        filtro.status_financeiro = "estornado";
      } else {
        filtro.status_operacional = abaAtiva;
      }

      const lista = await listarPedidosLoja(filtro);
      setPedidos(lista);
    } catch (err) {
      console.error("Erro ao buscar pedidos:", err);
    } finally {
      setLoadingPedidos(false);
    }
  }

  useEffect(() => {
    carregarPedidos();
  }, [abaAtiva]);

  if (loading) {
    return (
      <div className="min-h-screen bg-cor-fundo text-cor-texto p-4 sm:p-6">
        <div className="flex items-center justify-center h-64 text-sm text-cor-texto/50">
          Carregando dados...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cor-fundo text-cor-texto p-4 sm:p-6 pb-10 sm:pb-12">
      <div className="mx-auto w-full max-w-screen-xl space-y-6 md:space-y-8">
        {/* Título + Ação */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl sm:text-3xl font-semibold">
            Loja
          </h1>

          <Link
            to="/admin/produtos"
            className="
      inline-flex items-center gap-2
      px-4 py-2
      rounded-xl
      bg-cor-secundaria/10
      hover:bg-cor-secundaria/20
      text-sm font-medium
      transition
    "
          >
            <ArchiveBoxIcon className="w-4 h-4" />
            Gerenciar estoque
          </Link>
        </div>

        {/* Cards de estatísticas */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
          <CardEstat
            valor={estatisticas?.total_pedidos || 0}
            label="Pedidos"
            Icon={ShoppingBagIcon}
            cor="blue"
          />
          <CardEstat
            valor={`R$ ${Number(estatisticas?.total_faturado || 0).toFixed(2)}`}
            label="Faturamento"
            Icon={CurrencyDollarIcon}
            cor="green"
          />
          <CardEstat
            valor={estatisticas?.em_separacao || 0}
            label="Em separação"
            Icon={TruckIcon}
            cor="amber"
          />
          <CardEstat
            valor={estatisticas?.pronto_retirada || 0}
            label="Prontos"
            Icon={CheckCircleIcon}
            cor="purple"
          />
        </div>

        {/* Seção Pedidos */}
        <div className="bg-surface text-on-surface rounded-2xl border border-cor-secundaria/10 overflow-hidden">
          {/* Cabeçalho */}
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-cor-secundaria/10">
            <h2 className="text-base sm:text-lg font-medium">Pedidos</h2>
          </div>

          {/* Filtro de status: SELECT no mobile, Segmented no sm+ */}
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-cor-secundaria/10">
            {/* Versão mobile: select nativo */}
            <div className="sm:hidden">
              <select
                value={abaAtiva}
                onChange={(e) => setAbaAtiva(e.target.value)}
                className="
      w-full px-4 py-3 min-h-[44px]
      bg-cor-fundo text-cor-texto
      border border-cor-secundaria/30
      rounded-2xl text-base font-medium
      focus:outline-none focus:ring-2 focus:ring-cor-primaria/50
      appearance-none
    "
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%23ffffff' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
                  backgroundPosition: "right 1rem center",
                  backgroundRepeat: "no-repeat",
                  backgroundSize: "1.2em 1.2em",
                }}
              >
                {statusDisponiveis.map((status) => (
                  <option
                    key={status.id}
                    value={status.id}
                    className="bg-cor-fundo text-cor-texto"
                  >
                    {status.labelCurto} ({status.contador})
                  </option>
                ))}
              </select>
            </div>


            {/* Versão tablet/desktop: segmented pills */}
            <div className="hidden sm:flex bg-cor-secundaria/20 rounded-full p-1 max-w-full">
              {statusDisponiveis.map((status) => {
                const isActive = abaAtiva === status.id;
                const config = obterStatusOperacionalConfig(status.id);

                return (
                  <button
                    key={status.id}
                    onClick={() => setAbaAtiva(status.id)}
                    className={`
                      flex-1 flex items-center justify-center gap-2 min-h-[44px]
                      py-2.5 px-4
                      rounded-full text-sm font-medium
                      transition-all duration-200
                      ${isActive ? "bg-cor-primaria text-on-surface shadow-sm" : "text-on-surface/70 hover:bg-cor-secundaria/30"}
                    `}
                  >
                    <span className={`w-3 h-3 rounded-full ${config.dot}`} />
                    <span>{status.label}</span>
                    <span
                      className={`
                        ml-2 px-2.5 py-1 rounded-full text-xs font-bold min-w-[2rem] text-center
                        ${isActive ? "bg-on-surface/20" : "bg-surface/80 text-on-surface/70"}
                      `}
                    >
                      {status.contador}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Info Bar */}
          <div className="px-4 sm:px-6 py-3 flex justify-between items-center text-xs sm:text-sm text-on-surface/50 border-b border-cor-secundaria/10">
            <span>{formatarStatusOperacional(abaAtiva)}</span>
            <span>
              {pedidos.length} {pedidos.length === 1 ? "pedido" : "pedidos"}
            </span>
          </div>

          {/* Lista de pedidos */}
          <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
            {loadingPedidos ? (
              <div className="text-center text-sm sm:text-base text-on-surface/40 py-8 sm:py-12">
                Carregando pedidos...
              </div>
            ) : pedidos.length === 0 ? (
              <div className="text-center text-sm sm:text-base text-on-surface/40 py-10 sm:py-16">
                Nenhum pedido encontrado.
              </div>
            ) : (
              pedidos.map((pedido) => (
                <PedidoCard
                  key={pedido.id}
                  pedido={pedido}
                  onAtualizado={carregarPedidos}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
