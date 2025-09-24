import ModalFicha from "../ui/ModalFicha";
import NotasAluno from "./NotasAluno";
import { excluirAluno } from "../../services/alunoService";
import api from "../../services/api";
import { toast } from "react-toastify";
import React, { useState, useEffect } from "react";
import { logger } from "../../utils/logger";

export default function ModalAluno({
  aberto,
  onClose,
  aluno,
  onEditar,
  onExcluido,
}) {
  const [foto, setFoto] = useState(aluno?.foto_url || null);
  const [metricas, setMetricas] = useState(aluno?.metricas || null);
  const [inicio, setInicio] = useState("");
  const [fim, setFim] = useState("");

  // Atualiza métricas quando abrir modal
  useEffect(() => {
    if (aluno && aberto && aluno.status === "ativo") {
      setMetricas(aluno.metricas || null);

      const anoAtual = new Date().getFullYear();
      setInicio(`${anoAtual}-01-01`);
      setFim(new Date().toISOString().split("T")[0]);
      carregarMetricasPeriodo(); // só busca se ativo
    }
  }, [aluno, aberto]);

  async function carregarMetricasPeriodo() {
    try {
      if (aluno?.status !== "ativo") return; // evita chamada para pendentes
      const { data } = await api.get(`/alunos/${aluno.id}/metricas`, {
        params: { inicio, fim },
      });
      setMetricas(data);
    } catch (err) {
      logger.error("Erro ao carregar métricas:", err);
      toast.error("Erro ao carregar métricas de presença");
    }
  }

  if (!aluno) return null;

  const dados = [
    { label: "Apelido", valor: aluno.apelido },
    { label: "Graduação", valor: aluno.graduacao },
    {
      label: "Nascimento",
      valor: aluno.nascimento
        ? new Date(aluno.nascimento).toLocaleDateString("pt-BR")
        : "",
    },
    { label: "Responsável", valor: aluno.nome_responsavel },
    { label: "Contato", valor: aluno.telefone_responsavel },
    { label: "Endereço", valor: aluno.endereco },
    { label: "Turma", valor: aluno.turma },
    { label: "Observações médicas", valor: aluno.observacoes_medicas },
  ];

  // ✅ só adiciona métricas se aluno for ativo
  if (aluno.status === "ativo" && metricas) {
    dados.push(
      { label: "Presenças", valor: `${metricas.presentes}/${metricas.total}` },
      { label: "Faltas", valor: metricas.faltas },
      {
        label: "Frequência",
        valor: `${Math.round(metricas.taxa_presenca * 100)}%`,
      }
    );
  }

  const handleExcluir = async () => {
    const confirmado = window.confirm(
      "Tem certeza que deseja excluir este aluno?"
    );
    if (!confirmado) return;

    try {
      await excluirAluno(aluno.id);
      toast.success("Aluno excluído com sucesso!");
      onExcluido?.();
      onClose();
    } catch (err) {
      logger.error("Erro ao excluir aluno:", err);
      toast.error("Erro ao excluir aluno.");
    }
  };

  return (
    <ModalFicha
      aberto={aberto}
      onClose={onClose}
      titulo={
        <div className="flex justify-center mb-4 relative">
          {foto ? (
            <img
              src={foto}
              alt="Foto do aluno"
              className="h-24 w-24 rounded-full object-cover border shadow"
            />
          ) : (
            <div className="h-24 w-24 rounded-full bg-purple-500 flex items-center justify-center text-3xl font-bold text-white shadow">
              {(aluno.apelido || aluno.nome || "?")
                .substring(0, 1)
                .toUpperCase()}
            </div>
          )}
          <button
            className="absolute bottom-0 right-1/2 translate-x-10 w-8 h-8 flex items-center justify-center 
                       bg-white border border-gray-300 rounded-full shadow-md hover:bg-gray-100"
            title="Adicionar/Alterar foto"
            onClick={() => alert("Futuramente: upload foto Firebase")}
          >
            <span className="material-symbols-outlined text-gray-600 text-[18px] leading-none">
              photo_camera
            </span>
          </button>
        </div>
      }
      subtitulo={aluno.nome}
      dados={dados}
      onEditar={() => onEditar?.(aluno)}
    >
      {/* ✅ filtro de período só aparece se ativo */}
      {aluno.status === "ativo" && (
        <div className="flex gap-2 items-center mt-4 mb-2">
          <input
            type="date"
            value={inicio}
            onChange={(e) => setInicio(e.target.value)}
            className="border rounded px-2 py-1 text-sm"
          />
          <input
            type="date"
            value={fim}
            onChange={(e) => setFim(e.target.value)}
            className="border rounded px-2 py-1 text-sm"
          />
          <button
            onClick={carregarMetricasPeriodo}
            className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
          >
            Filtrar
          </button>
        </div>
      )}

      <NotasAluno alunoId={aluno.id} />

      <div className="mt-4 flex justify-end">
        <button
          onClick={handleExcluir}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm"
        >
          Excluir aluno
        </button>
      </div>
    </ModalFicha>
  );
}
