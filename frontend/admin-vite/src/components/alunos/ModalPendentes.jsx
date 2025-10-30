import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePendentes } from "../../hooks/usePendentes";
import { Check, X, Eye, User, Users, Loader2 } from "lucide-react";

/* -------------------------------------------------------------------------- */
/* 🔹 Subcomponente para cada aluno pendente                                  */
/* -------------------------------------------------------------------------- */
function CardAluno({
  aluno,
  index,
  onAbrirFicha,
  aprovarAluno,
  rejeitarAluno,
  onAtualizarContador,
  onAtualizarAlunos,
  cacheCategorias, // referência compartilhada de cache
}) {
  const [categoria, setCategoria] = useState("...");
  const [idade, setIdade] = useState("-");

  // Calcula idade do aluno
  useEffect(() => {
    if (!aluno.nascimento) return;
    const nasc = new Date(aluno.nascimento);
    const diff = Date.now() - nasc.getTime();
    const idadeCalc = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
    setIdade(idadeCalc);
  }, [aluno.nascimento]);

  // Busca categoria com cache
  useEffect(() => {
    async function carregarCategoria() {
      if (!idade || isNaN(idade)) {
        setCategoria("-");
        return;
      }

      // ✅ 1. Se já está no cache, usa direto
      if (cacheCategorias.current[idade]) {
        setCategoria(cacheCategorias.current[idade]);
        return;
      }

      // ✅ 2. Se não está no cache, busca do backend
      try {
        const resp = await fetch(`/api/categorias/por-idade/${idade}`);
        if (!resp.ok) throw new Error("Falha ao buscar categoria");
        const data = await resp.json();

        let categoriaEncontrada =
          data?.data?.categoria_nome ||
          "Sem turma disponível para essa faixa etária";

        // salva no cache
        cacheCategorias.current[idade] = categoriaEncontrada;

        setCategoria(categoriaEncontrada);
      } catch (err) {
        console.error("Erro ao buscar categoria:", err);
        setCategoria("Erro ao obter categoria");
      }
    }

    carregarCategoria();
  }, [idade, cacheCategorias]);

  const grupoSistema = "Capoeira Brasil";
  const veioOutroGrupo =
    aluno.ja_treinou === "sim" &&
    aluno.grupo_origem &&
    aluno.grupo_origem.toLowerCase() !== grupoSistema.toLowerCase();

  return (
    <motion.div
      key={aluno.id}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -3 }}
      onClick={() => onAbrirFicha?.(aluno)}
      className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 cursor-pointer hover:shadow-md transition-all duration-200 flex flex-col items-center"
    >
      {/* Avatar (foto ou inicial) */}
      <div className="h-14 w-14 rounded-full overflow-hidden bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-lg mb-3 border border-gray-200">
        {aluno.foto_url ? (
          <img
            src={aluno.foto_url}
            alt={aluno.nome}
            className="object-cover w-full h-full"
            onError={(e) => (e.target.style.display = "none")}
          />
        ) : (
          (aluno.nome || "?").substring(0, 1).toUpperCase()
        )}
      </div>

      {/* Nome e grupo */}
      <h3 className="text-base font-semibold text-gray-800 leading-tight text-center mb-1">
        {aluno.apelido || aluno.nome || "Sem nome"}
      </h3>

      {aluno.apelido && aluno.nome && (
        <p className="text-sm text-gray-500 font-medium text-center mb-2">
          {aluno.nome}
        </p>
      )}

      {/* Destaque se veio de outro grupo */}
      {veioOutroGrupo && (
        <p className="text-[13px] text-amber-700 font-medium text-center mb-2">
          Veio do grupo <span className="underline">{aluno.grupo_origem}</span>
        </p>
      )}

      {/* Info */}
      <p className="text-sm text-gray-600 text-center mb-3">
        Idade: <strong>{idade}</strong> &nbsp;•&nbsp; Categoria:{" "}
        <strong>{categoria}</strong>
      </p>

      {/* Graduação (se já tiver) */}
      {aluno.graduacao_nome && (
        <p className="text-sm text-amber-700 font-medium text-center mb-2">
          Graduação:{" "}
          <span className="font-semibold">{aluno.graduacao_nome}</span>
        </p>
      )}

      {/* Observação médica (se existir) */}
      {aluno.observacoes_medicas && aluno.observacoes_medicas.trim() !== "" && (
        <div className="bg-red-50 border border-red-200 rounded-md px-2 py-1 text-center mb-3">
          <p className="text-[13px] text-red-700 leading-snug">
            <span className="font-semibold">Obs Médicas:</span>{" "}
            {aluno.observacoes_medicas.charAt(0).toUpperCase() +
              aluno.observacoes_medicas.slice(1).toLowerCase()}
          </p>
        </div>
      )}

      {/* Clique */}
      <div className="flex items-center justify-center gap-1 text-gray-400 text-xs mb-3">
        <Eye className="w-4 h-4" />
        <span>Clique para ver ficha</span>
      </div>

      {/* Botões */}
      <div className="flex gap-2 w-full">
        <button
          onClick={async (e) => {
            e.stopPropagation();
            await aprovarAluno(aluno.id);
            onAtualizarContador?.();
            onAtualizarAlunos?.();
          }}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm font-semibold transition-colors"
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
          className="flex-1 bg-rose-600 hover:bg-rose-700 text-white px-3 py-2 rounded-lg text-sm font-semibold transition-colors"
        >
          Rejeitar
        </button>
      </div>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/* 🔹 Componente principal do modal                                           */
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

  // cacheCategorias é um objeto compartilhado que persiste durante o render
  const cacheCategorias = useRef({});

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
              {carregando ? (
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
                    <CardAluno
                      key={aluno.id}
                      aluno={aluno}
                      index={index}
                      onAbrirFicha={onAbrirFicha}
                      aprovarAluno={aprovarAluno}
                      rejeitarAluno={rejeitarAluno}
                      onAtualizarContador={onAtualizarContador}
                      onAtualizarAlunos={onAtualizarAlunos}
                      cacheCategorias={cacheCategorias}
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
