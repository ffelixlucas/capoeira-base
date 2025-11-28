import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

/* -------------------------------------------------------------------------- */
/* 🔹 Card Pre-Matrícula — Componente Isolado                                  */
/* -------------------------------------------------------------------------- */
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
  const [idade, setIdade] = useState("-");
  const [turmaId, setTurmaId] = useState("");
  const [alerta, setAlerta] = useState("");
  const [turmaSugestao, setTurmaSugestao] = useState(null);

  const grupoSistema = "Capoeira Brasil";
  const veioOutroGrupo =
    aluno.ja_treinou === "sim" &&
    aluno.grupo_origem &&
    aluno.grupo_origem.toLowerCase() !== grupoSistema.toLowerCase();

  /* 📌 Calcular idade */
  useEffect(() => {
    if (!aluno.nascimento) return;

    const [anoStr, mesStr, diaStr] = aluno.nascimento.split("-");
    const ano = parseInt(anoStr, 10);
    const mes = parseInt(mesStr, 10);
    const dia = parseInt(diaStr, 10);

    const hoje = new Date();
    let idadeCalc = hoje.getFullYear() - ano;

    if (hoje.getMonth() + 1 < mes || (hoje.getMonth() + 1 === mes && hoje.getDate() < dia)) {
      idadeCalc--;
    }

    setIdade(idadeCalc);
  }, [aluno.nascimento]);

  /* 📌 Pré-seleção e sugestão de turma */
  useEffect(() => {
    if (!turmas?.length) return;

    const turmasDaCategoria = turmas.filter(
      (t) => Number(t.categoria_id) === Number(aluno.categoria_id)
    );

    setTurmaSugestao(
      turmasDaCategoria.length === 1 ? turmasDaCategoria[0].nome : null
    );

    if (turmasDaCategoria.length === 0) {
      setTurmaId("");
      setAlerta("Nenhuma turma cadastrada para esta categoria.");
      return;
    }

    if (turmasDaCategoria.length === 1) {
      setTurmaId(String(turmasDaCategoria[0].id));
      setAlerta("");
      return;
    }

    if (turmasDaCategoria.length > 1) {
      setTurmaId("");
      setAlerta("Existem várias turmas para esta categoria. Escolha uma.");
    }
  }, [turmas, aluno.categoria_id]);

  return (
    <motion.div
      key={aluno.id}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -3 }}
      onClick={() => onAbrirFicha?.(aluno)}
      className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 cursor-pointer hover:shadow-md flex flex-col items-center"
    >
      {/* Avatar */}
      <div className="h-14 w-14 rounded-full overflow-hidden bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-lg mb-3 border border-gray-200">
        {aluno.foto_url ? (
          <img
            src={aluno.foto_url}
            alt={aluno.nome}
            className="object-cover w-full h-full"
          />
        ) : (
          (aluno.nome || "?").substring(0, 1).toUpperCase()
        )}
      </div>

      {/* Nome */}
      <h3 className="text-base font-semibold text-gray-800 text-center mb-1">
        {aluno.apelido || aluno.nome}
      </h3>

      {/* Idade */}
      <p className="text-sm text-gray-700 text-center mb-2">
        <strong>{idade} anos</strong>
      </p>

      {/* Grupo de origem */}
      {veioOutroGrupo && (
        <p className="text-xs text-blue-600 font-medium mb-1">
          Grupo de origem: <strong>{aluno.grupo_origem}</strong>
        </p>
      )}

      {/* Graduação */}
      {aluno.graduacao_nome && (
        <p className="text-xs text-purple-600 font-medium mb-1">
          Graduação: <strong>{aluno.graduacao_nome}</strong>
        </p>
      )}

      {/* Observações médicas */}
      {aluno.observacoes_medicas && (
        <p className="text-xs text-red-600 font-medium text-center mb-2">
          Obs. médicas: {aluno.observacoes_medicas}
        </p>
      )}

      {/* Turma sugerida */}
      {turmaSugestao && (
        <p className="text-xs text-gray-600 mb-2">
          Turma sugerida: <strong>{turmaSugestao}</strong>
        </p>
      )}

      {/* ALERTA */}
      {alerta && (
        <p className="text-xs text-amber-600 text-center font-medium mt-1 mb-2">
          {alerta}
        </p>
      )}

      {/* SELECT DE TURMAS */}
      <div className="w-full mb-3">
        <label className="text-sm text-gray-900 font-semibold mb-1 block">
          Selecionar turma
        </label>

        <select
          value={turmaId}
          onChange={(e) => setTurmaId(e.target.value)}
          onClick={(e) => e.stopPropagation()}
          className="w-full border border-gray-300 text-gray-800 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Selecione...</option>

          {turmas?.map((t) => (
            <option key={t.id} value={t.id}>
              {t.nome}
            </option>
          ))}
        </select>
      </div>

      {/* Botões */}
      <div className="flex gap-2 w-full">
        <button
          disabled={!turmaId}
          onClick={async (e) => {
            e.stopPropagation();
            await aprovarAluno(aluno.id, turmaId);
            onAtualizarContador?.();
            onAtualizarAlunos?.();
          }}
          className={`flex-1 text-white px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
            turmaId
              ? "bg-green-600 hover:bg-green-700"
              : "bg-gray-400 cursor-not-allowed"
          }`}
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
          className="flex-1 bg-rose-600 hover:bg-rose-700 text-white px-3 py-2 rounded-lg text-sm font-semibold"
        >
          Rejeitar
        </button>
      </div>
    </motion.div>
  );
}
