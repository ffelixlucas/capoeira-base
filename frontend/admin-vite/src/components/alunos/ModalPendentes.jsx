import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, User, Users, Loader2 } from "lucide-react";

import { usePendentes } from "../../../src/hooks/usePendentes";
import { useTurmas } from "../../../src/hooks/useTurmas";

import CardPreMatricula from "./CardPreMatricula";

/* -------------------------------------------------------------------------- */
/* 🔹 Modal de Pré-Matrículas Pendentes                                       */
/* -------------------------------------------------------------------------- */
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

  const { turmas, carregando: carregandoTurmas } = useTurmas();



  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <AnimatePresence>
      {aberto && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleBackdropClick}
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-3 md:p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="bg-white rounded-xl shadow-xl flex flex-col overflow-hidden max-h-[85vh]"
            style={{ width: "calc(100% - 2rem)", maxWidth: "400px" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-blue-100 rounded-lg">
                  <Users className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Pré-Matrículas
                  </h2>
                  <p className="text-xs text-gray-500">
                    {carregando
                      ? "Carregando..."
                      : `${pendentes.length} pendentes`}
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Conteúdo */}
            <div className="flex-1 overflow-y-auto">
              {carregando || carregandoTurmas ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 text-blue-600 animate-spin mr-2" />
                  <p className="text-gray-600 text-sm">Carregando...</p>
                </div>
              ) : pendentes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center px-4">
                  <User className="w-8 h-8 text-gray-400 mb-2" />
                  <h3 className="text-sm font-medium text-gray-700 mb-1">
                    Nenhuma pré-matrícula
                  </h3>
                  <p className="text-xs text-gray-500">
                    Todas as solicitações foram revisadas
                  </p>
                </div>
              ) : (
                <div className="p-4 space-y-4">
                  {pendentes.map((aluno, index) => (
                    <CardPreMatricula
                      key={aluno.id}
                      aluno={aluno}
                      index={index}
                      turmas={turmas}
                      onAbrirFicha={onAbrirFicha}
                      aprovarAluno={aprovarAluno}
                      rejeitarAluno={rejeitarAluno}
                      onAtualizarContador={onAtualizarContador}
                      onAtualizarAlunos={onAtualizarAlunos}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {!carregando && pendentes.length > 0 && (
              <div className="p-3 bg-gray-50 border-t border-gray-200">
                <p className="text-center text-xs text-gray-500">
                  Clique em qualquer card para visualizar os detalhes completos
                </p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
