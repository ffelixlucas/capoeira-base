import React from "react";
import { motion } from "framer-motion";
import { usePendentes } from "../../hooks/usePendentes";
import { Check, X, Eye } from "lucide-react";

export default function ModalPendentes({
  aberto,
  onClose,
  onAbrirFicha,
  onAtualizarContador,
  onAtualizarAlunos,
  organizacaoId,
}) {
  const { pendentes, carregando, aprovarAluno, rejeitarAluno } =
    usePendentes(organizacaoId);

  if (!aberto) return null;

  function calcularIdade(dataNasc) {
    if (!dataNasc) return "-";
    const nasc = new Date(dataNasc);
    const diff = Date.now() - nasc.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-3">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.25 }}
        className="bg-white w-full max-w-3xl rounded-2xl shadow-xl flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex justify-between items-center border-b p-4 bg-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mx-auto">
            Pré-Matrículas Pendentes
          </h2>
          <button
            onClick={onClose}
            className="absolute right-5 text-gray-600 hover:text-gray-800 text-2xl"
          >
            ✖
          </button>
        </div>

        {/* Conteúdo */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50 flex justify-center">
          {carregando ? (
            <p className="text-center text-gray-500">Carregando...</p>
          ) : pendentes.length === 0 ? (
            <p className="text-center text-gray-600">
              Nenhuma pré-matrícula pendente.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 justify-items-center w-full max-w-2xl">
              {pendentes.map((aluno) => {
                const idade = calcularIdade(aluno.nascimento);
                const categoria =
                  idade < 8
                    ? "Infantil"
                    : idade < 14
                    ? "Juvenil"
                    : idade < 18
                    ? "Adolescente"
                    : "Adulto";

                // ⚙️ Novo cálculo de grupo inteligente
                const grupoSistema = "Capoeira Brasil"; // futuramente pegaremos dinamicamente pelo organizacao_id
                const veioOutroGrupo =
                  aluno.ja_treinou === "sim" &&
                  aluno.grupo_origem &&
                  aluno.grupo_origem.toLowerCase() !==
                    grupoSistema.toLowerCase();

                return (
                  <motion.div
                    key={aluno.id}
                    whileHover={{ y: -3 }}
                    transition={{ duration: 0.2 }}
                    onClick={() => onAbrirFicha?.(aluno)}
                    className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 w-full max-w-[320px] cursor-pointer hover:shadow-md flex flex-col items-center transition"
                  >
                    {/* Avatar */}
                    <div className="h-14 w-14 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-lg mb-2">
                      {(aluno.nome || "?").substring(0, 1).toUpperCase()}
                    </div>

                    {/* Nome e grupo */}
                    <h3 className="text-base font-semibold text-gray-800 leading-tight text-center">
                      {aluno.nome}
                    </h3>

                    {/* Mostra destaque se veio de outro grupo */}
                    {veioOutroGrupo && (
                      <p className="text-[13px] text-amber-700 font-medium text-center mt-1">
                        Veio do grupo{" "}
                        <span className="underline">{aluno.grupo_origem}</span>
                      </p>
                    )}

                    {/* Info */}
                    <p className="text-sm text-gray-600 mt-2 text-center">
                      Idade: <strong>{idade}</strong> &nbsp;•&nbsp; Categoria:{" "}
                      <strong>{categoria}</strong>
                    </p>

                    {/* Clique */}
                    <div className="flex items-center justify-center gap-1 text-gray-400 text-xs mt-2">
                      <Eye className="w-4 h-4" />
                      <span>Clique para ver ficha</span>
                    </div>

                    {/* Botões */}
                    <div className="flex gap-2 mt-5 w-full">
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          await aprovarAluno(aluno.id);
                          onAtualizarContador?.();
                          onAtualizarAlunos?.();
                        }}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-md text-sm font-semibold transition"
                      >
                        Aprovar
                      </button>
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          await rejeitarAluno(aluno.id);
                          onAtualizarContador?.();
                          onAtualizarAlunos?.();
                        }}
                        className="flex-1 bg-rose-600 hover:bg-rose-700 text-white px-3 py-2 rounded-md text-sm font-semibold transition"
                      >
                        Rejeitar
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
