import React, { useEffect, useMemo, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Hook personalizado para cálculo de idade
const useIdade = (nascimento) => {
  const [idade, setIdade] = useState("-");

  useEffect(() => {
    if (!nascimento) return;

    const calcularIdade = () => {
      const [anoStr, mesStr, diaStr] = nascimento.split("-");
      const ano = parseInt(anoStr, 10);
      const mes = parseInt(mesStr, 10) - 1;
      const dia = parseInt(diaStr, 10);

      const dataNascimento = new Date(ano, mes, dia);
      const hoje = new Date();
      
      let idadeCalc = hoje.getFullYear() - dataNascimento.getFullYear();
      const mesAtual = hoje.getMonth();
      const diaAtual = hoje.getDate();

      if (mesAtual < mes || (mesAtual === mes && diaAtual < dia)) {
        idadeCalc--;
      }

      return idadeCalc;
    };

    setIdade(calcularIdade());
  }, [nascimento]);

  return idade;
};

// Hook personalizado para sugestão de turma
const useTurmaSugestao = (turmas, categoriaId) => {
  const [sugestao, setSugestao] = useState({ turmaId: "", turmaNome: "", alerta: "" });

  useEffect(() => {
    if (!turmas?.length || !categoriaId) {
      setSugestao({ turmaId: "", turmaNome: "", alerta: "" });
      return;
    }

    const turmasDaCategoria = turmas.filter(
      (t) => Number(t.categoria_id) === Number(categoriaId)
    );

    let novaSugestao = { turmaId: "", turmaNome: "", alerta: "" };

    if (turmasDaCategoria.length === 0) {
      novaSugestao.alerta = "Nenhuma turma para esta categoria";
    } else if (turmasDaCategoria.length === 1) {
      const turmaUnica = turmasDaCategoria[0];
      novaSugestao.turmaId = String(turmaUnica.id);
      novaSugestao.turmaNome = turmaUnica.nome;
    } else {
      novaSugestao.alerta = "Escolha uma turma";
    }

    setSugestao(novaSugestao);
  }, [turmas, categoriaId]);

  return sugestao;
};

// Ícone de edição discreto
const EditIcon = ({ className = "" }) => (
  <svg 
    className={`w-4 h-4 ${className}`} 
    fill="none" 
    stroke="currentColor" 
    viewBox="0 0 24 24"
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth={2} 
      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" 
    />
  </svg>
);

export default function CardPreMatricula({
  aluno,
  index,
  turmas,
  onAbrirFicha,
  aprovarAluno,
  rejeitarAluno,
  onAtualizarContador,
  onAtualizarAlunos,
}) {
  const [turmaId, setTurmaId] = useState("");
  const [loading, setLoading] = useState({ approve: false, reject: false });
  const [isHovered, setIsHovered] = useState(false);
  const [showTurmaSelector, setShowTurmaSelector] = useState(false);
  const idade = useIdade(aluno.nascimento);
  const { turmaId: turmaSugeridaId, turmaNome: turmaSugeridaNome, alerta } = 
    useTurmaSugestao(turmas, aluno.categoria_id);

  // Define a turma inicial baseada na sugestão
  useEffect(() => {
    if (turmaSugeridaId && !turmaId) {
      setTurmaId(turmaSugeridaId);
    }
  }, [turmaSugeridaId, turmaId]);

  // Memoized values
  const veioOutroGrupo = useMemo(() => 
    aluno.ja_treinou === "sim" &&
    aluno.grupo_origem &&
    aluno.grupo_origem.toLowerCase() !== "Capoeira Brasil".toLowerCase(),
    [aluno.ja_treinou, aluno.grupo_origem]
  );

  const nomeExibicao = useMemo(() => 
    aluno.apelido || aluno.nome,
    [aluno.apelido, aluno.nome]
  );

  // Encontrar o nome da turma selecionada
  const turmaSelecionadaNome = useMemo(() => {
    if (!turmaId) return null;
    const turma = turmas?.find(t => String(t.id) === turmaId);
    return turma?.nome || null;
  }, [turmaId, turmas]);

  // Turma atual para mostrar (sugerida ou selecionada)
  const turmaAtual = useMemo(() => {
    if (turmaSelecionadaNome) return turmaSelecionadaNome;
    if (turmaSugeridaNome) return turmaSugeridaNome;
    return null;
  }, [turmaSelecionadaNome, turmaSugeridaNome]);

  // Handlers
  const handleCardClick = useCallback(() => {
    onAbrirFicha?.(aluno);
  }, [onAbrirFicha, aluno]);

  const handleAction = useCallback(async (action) => {
    setLoading(prev => ({ ...prev, [action]: true }));
    
    try {
      if (action === 'approve') {
        await aprovarAluno(aluno.id, turmaId);
      } else {
        await rejeitarAluno(aluno.id);
      }
      onAtualizarContador?.();
      onAtualizarAlunos?.();
    } finally {
      setLoading(prev => ({ ...prev, [action]: false }));
    }
  }, [aluno.id, turmaId, aprovarAluno, rejeitarAluno, onAtualizarContador, onAtualizarAlunos]);

  const handleAprovar = useCallback((e) => {
    e.stopPropagation();
    handleAction('approve');
  }, [handleAction]);

  const handleRejeitar = useCallback((e) => {
    e.stopPropagation();
    handleAction('reject');
  }, [handleAction]);

  const handleSelectChange = useCallback((e) => {
    e.stopPropagation();
    setTurmaId(e.target.value);
    setShowTurmaSelector(false);
  }, []);

  const handleAlterarTurmaClick = useCallback((e) => {
    e.stopPropagation();
    setShowTurmaSelector(true);
  }, []);

  const handleCancelarAlteracao = useCallback((e) => {
    e.stopPropagation();
    setShowTurmaSelector(false);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -4 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={handleCardClick}
      className="group relative bg-white rounded-2xl border border-gray-100 p-6 cursor-pointer shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden"
    >
      {/* Efeito de brilho sutil no hover */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        animate={isHovered ? { opacity: 1 } : { opacity: 0 }}
      />
      
      {/* Linha de destaque lateral */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Header */}
      <div className="flex items-start gap-4 mb-4 relative z-10">
        {/* Avatar REDONDO sem borda preta - só gradiente limpo */}
        <motion.div 
          className="relative"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 400 }}
        >
          <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-lg shadow-lg">
            {aluno.foto_url ? (
              <img
                src={aluno.foto_url}
                alt={aluno.nome}
                className="object-cover w-full h-full rounded-full"
                loading="lazy"
              />
            ) : (
              (aluno.nome || "?").substring(0, 1).toUpperCase()
            )}
          </div>
          {/* Indicador de status */}
          <motion.div 
            className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"
            animate={isHovered ? { scale: 1.2 } : { scale: 1 }}
          />
        </motion.div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {nomeExibicao}
              </h3>
              <p className="text-sm text-gray-600">{idade} anos</p>
            </div>
            
            {/* Indicadores visuais */}
            <div className="flex gap-1">
              {veioOutroGrupo && (
                <div className="w-2 h-2 bg-blue-500 rounded-full" title="Veio de outro grupo" />
              )}
              {aluno.graduacao_nome && (
                <div className="w-2 h-2 bg-purple-500 rounded-full" title="Possui graduação" />
              )}
              {aluno.observacoes_medicas && (
                <div className="w-2 h-2 bg-red-500 rounded-full" title="Observações médicas" />
              )}
            </div>
          </div>

          {/* Badges minimalistas */}
          <div className="flex flex-wrap gap-2">
            {veioOutroGrupo && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs bg-blue-50 text-blue-700 border border-blue-200">
                {aluno.grupo_origem}
              </span>
            )}

            {aluno.graduacao_nome && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs bg-purple-50 text-purple-700 border border-purple-200">
                {aluno.graduacao_nome}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Observações médicas - aparece apenas se existir */}
      {aluno.observacoes_medicas && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mb-4 p-3 bg-red-50 rounded-lg border border-red-200"
        >
          <p className="text-xs text-red-700 font-medium">
            ⚕️ {aluno.observacoes_medicas}
          </p>
        </motion.div>
      )}

      {/* Conteúdo principal */}
      <div className="space-y-4 relative z-10">
        {/* Alerta */}
        {alerta && (
          <motion.div 
            className="p-3 bg-amber-50 rounded-xl border border-amber-200"
            initial={{ x: -20 }}
            animate={{ x: 0 }}
          >
            <p className="text-sm text-amber-800 text-center font-medium">
              {alerta}
            </p>
          </motion.div>
        )}

        {/* Seletor de turma - Agora unificado e discreto */}
        <div className="space-y-3">
          <AnimatePresence mode="wait">
            {showTurmaSelector ? (
              <motion.div
                key="selector"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3"
              >
                <label className="text-sm font-semibold text-gray-700 block">
                  Selecionar turma
                </label>
                <motion.select
                  value={turmaId}
                  onChange={handleSelectChange}
                  onClick={(e) => e.stopPropagation()}
                  whileFocus={{ scale: 1.02 }}
                  className="w-full border border-gray-300 text-gray-600 rounded-xl px-4 py-3 text-sm bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 appearance-none cursor-pointer"
                >
                  <option value="">Escolha uma turma...</option>
                  {turmas?.map((turma) => (
                    <option key={turma.id} value={turma.id}>
                      {turma.nome}
                    </option>
                  ))}
                </motion.select>
                
                {/* Botão cancelar */}
                <motion.button
                  onClick={handleCancelarAlteracao}
                  className="text-sm text-gray-500 hover:text-gray-700 font-medium transition-colors"
                >
                  ← Cancelar
                </motion.button>
              </motion.div>
            ) : (
              <motion.div
                key="display"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="group/turma relative"
              >
                <div 
                  onClick={handleAlterarTurmaClick}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-100 transition-all duration-200 cursor-pointer"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600">Turma:</p>
                    <p className="text-sm font-semibold text-gray-900 mt-1">
                      {turmaAtual || "Selecionar turma..."}
                    </p>
                    {turmaSugeridaNome && !turmaSelecionadaNome && (
                      <p className="text-xs text-green-600 mt-1">Sugestão automática</p>
                    )}
                  </div>
                  
                  {/* Ícone de edição discreto */}
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="p-2 text-gray-400 group-hover/turma:text-gray-600 transition-colors"
                  >
                    <EditIcon />
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Botões de ação */}
        <motion.div 
          className="flex gap-3 pt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <motion.button
            disabled={!turmaId || loading.approve}
            onClick={handleAprovar}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 shadow-md hover:shadow-lg disabled:shadow-none disabled:cursor-not-allowed"
          >
            {loading.approve ? (
              <div className="flex items-center justify-center gap-2">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                />
                Processando...
              </div>
            ) : (
              "Aprovar"
            )}
          </motion.button>

          <motion.button
            disabled={loading.reject}
            onClick={handleRejeitar}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 shadow-md hover:shadow-lg"
          >
            {loading.reject ? (
              <div className="flex items-center justify-center gap-2">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                />
                Processando...
              </div>
            ) : (
              "Rejeitar"
            )}
          </motion.button>
        </motion.div>
      </div>

      {/* Efeito de brilho sutil no fundo */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-2xl -z-10"
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}