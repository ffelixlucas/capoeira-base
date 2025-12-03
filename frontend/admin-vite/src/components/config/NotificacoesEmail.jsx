import React, { useState } from "react";
import { useNotificacoes } from "../../hooks/useNotificacoes";
import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useAuth } from "../../contexts/AuthContext";
import logger from "../../utils/logger";

export default function NotificacoesEmail() {
  const { usuario } = useAuth();

  // ❌ Antes: useNotificacoes(usuario?.grupo_id)
  // ✔️ Agora: hook não recebe mais grupoId
  const { lista, tipo, setTipo, loading, adicionar, remover } = useNotificacoes();

  const [novoEmail, setNovoEmail] = useState("");

  async function handleAdicionar() {
    if (!novoEmail) return;

    logger.info("[NotificacoesEmail] Tentando adicionar notificação", {
      tipo,
      email: novoEmail,
      organizacaoId: usuario?.organizacao_id,
    });

    try {
      // ❌ Antes mandava grupoId
      // ✔️ Agora só precisa tipo + email
      await adicionar({
        organizacaoId: usuario?.organizacao_id,
        tipo,
        email: novoEmail,
      });

      setNovoEmail("");
    } catch (err) {
      logger.error("[NotificacoesEmail] Erro ao adicionar:", err);
    }
  }

  return (
    <div className="bg-cor-card rounded-2xl p-6 border border-cor-secundaria/30 space-y-4">
      <h2 className="text-lg font-semibold text-cor-titulo">
        Notificações de E-mail
      </h2>

      {/* Seleção de tipo */}
      <div>
        <label className="text-sm text-cor-texto/70">Tipo:</label>
        <select
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
          className="ml-2 rounded-lg border px-3 py-2 text-sm bg-cor-input text-black"
        >
          <option value="matricula">Matrícula</option>
          <option value="evento">Evento</option>
          <option value="pagamento">Pagamento</option>
        </select>
      </div>

      {/* Lista */}
      {loading ? (
        <p className="text-sm text-cor-texto/60">Carregando...</p>
      ) : lista.length > 0 ? (
        <ul className="space-y-2">
          {lista.map((n) => (
            <li
              key={n.id}
              className="flex justify-between items-center bg-cor-bg p-3 rounded-lg border border-cor-secundaria/20"
            >
              <span className="text-sm">{n.email}</span>
              <button
                onClick={() => remover(n.id)}
                className="text-red-500 hover:text-red-700"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-cor-texto/60">Nenhum e-mail cadastrado.</p>
      )}

      {/* Form adicionar */}
      <div className="flex gap-2 mt-3">
        <input
          type="email"
          value={novoEmail}
          onChange={(e) => setNovoEmail(e.target.value)}
          placeholder="Digite o e-mail"
          className="flex-1 rounded-lg border px-3 py-2 text-sm bg-cor-input text-black"
        />
        <button
          onClick={handleAdicionar}
          className="bg-cor-primaria text-white px-3 py-2 rounded-lg flex items-center gap-1 hover:bg-cor-primaria/90"
        >
          <PlusIcon className="h-4 w-4" /> Adicionar
        </button>
      </div>
    </div>
  );
}
