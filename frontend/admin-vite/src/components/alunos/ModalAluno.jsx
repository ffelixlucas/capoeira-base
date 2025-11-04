import React, { useState, useEffect } from "react";
import ModalFicha from "../ui/ModalFicha";
import NotasAluno from "./NotasAluno";
import { excluirAluno } from "../../services/alunoService";
import api from "../../services/api";
import { toast } from "react-toastify";
import { logger } from "../../utils/logger";
import { FaWhatsapp } from "react-icons/fa";

/**
 * ModalAluno – unificado para pré-matrícula e aluno ativo.
 */
export default function ModalAluno({ aberto, onClose, aluno, onEditar, onExcluido }) {
  if (!aluno) return null;

  const [foto, setFoto] = useState(aluno?.foto_url || null);
  const [metricas, setMetricas] = useState(aluno?.metricas || null);
  const [inicio, setInicio] = useState("");
  const [fim, setFim] = useState("");

  useEffect(() => {
    if (aluno && aberto && aluno.status === "ativo") {
      setMetricas(aluno.metricas || null);
      const anoAtual = new Date().getFullYear();
      setInicio(`${anoAtual}-01-01`);
      setFim(new Date().toISOString().split("T")[0]);
      carregarMetricasPeriodo();
    }
  }, [aluno, aberto]);

  async function carregarMetricasPeriodo() {
    try {
      if (aluno?.status !== "ativo") return;
      const { data } = await api.get(`/alunos/${aluno.id}/metricas`, { params: { inicio, fim } });
      setMetricas(data);
    } catch (err) {
      logger.error("Erro ao carregar métricas:", err);
      toast.error("Erro ao carregar métricas de presença");
    }
  }

  async function handleExcluir() {
    if (!window.confirm("Tem certeza que deseja excluir este aluno?")) return;
    try {
      await excluirAluno(aluno.id);
      toast.success("Aluno excluído com sucesso!");
      onExcluido?.();
      onClose();
    } catch (err) {
      logger.error("Erro ao excluir aluno:", err);
      toast.error("Erro ao excluir aluno.");
    }
  }

  /* -------------------------------------------------------------------------- */
  /* 🔹 Dados comuns                                                            */
  /* -------------------------------------------------------------------------- */
  const idade = aluno.nascimento
    ? Math.floor((Date.now() - new Date(aluno.nascimento)) / (1000 * 60 * 60 * 24 * 365.25))
    : null;

/* -------------------------------------------------------------------------- */
/* 🔹 Telefones (aluno + responsável, com nome e parentesco)                  */
/* -------------------------------------------------------------------------- */
const telefones = [];

// Telefone do aluno
if (aluno.telefone_aluno) {
  telefones.push({
    label: "Telefone do Aluno",
    valor: (
      <span className="inline-flex items-center gap-2">
        <span>{aluno.telefone_aluno}</span>
        <FaWhatsapp
          onClick={() =>
            window.open(
              `https://wa.me/55${aluno.telefone_aluno.replace(/\D/g, "")}`,
              "_blank"
            )
          }
          className="text-green-600 hover:text-green-700 cursor-pointer transition-colors"
          title="Abrir WhatsApp do aluno"
          size={18}
        />
      </span>
    ),
  });
}

// Telefone do responsável (com nome e parentesco)
if (aluno.telefone_responsavel) {
  const nomeResp = aluno.nome_responsavel || "Responsável";
  const parentesco = aluno.responsavel_parentesco
    ? `  ${aluno.responsavel_parentesco} - `
    : "";

  telefones.push({
    label: `${parentesco}${nomeResp}`,
    valor: (
      <span className="inline-flex items-center gap-2">
        <span>{aluno.telefone_responsavel}</span>
        <FaWhatsapp
          onClick={() =>
            window.open(
              `https://wa.me/55${aluno.telefone_responsavel.replace(/\D/g, "")}`,
              "_blank"
            )
          }
          className="text-green-600 hover:text-green-700 cursor-pointer transition-colors"
          title="Abrir WhatsApp do responsável"
          size={18}
        />
      </span>
    ),
  });
}
  const dataMatricula = aluno.data_criacao || aluno.criado_em;

  const nomeFormatado =
    aluno.nome?.replace(/\b\w/g, (l) => l.toUpperCase()) || aluno.nome || "Sem nome";

  const dadosBase = [
    { label: "Nome completo", valor: nomeFormatado },
    { label: "Apelido", valor: aluno.apelido || "-" },
    {
      label: "Data de nascimento",
      valor: aluno.nascimento
        ? new Date(aluno.nascimento).toLocaleDateString("pt-BR")
        : "-",
    },
    { label: "Idade", valor: idade ? `${idade} anos` : "-" },
    { label: "CPF", valor: aluno.cpf || "-" },
    { label: "E-mail", valor: aluno.email || "-" },
   ...telefones,

    ];

  /* -------------------------------------------------------------------------- */
/* 🔹 Ficha de pré-matrícula                                                  */
/* -------------------------------------------------------------------------- */
if (aluno.isPreMatricula) {
  const dadosFicha = [
    ...dadosBase,
    {
      label: "Categoria",
      valor: aluno.categoria_nome || "-",
    },
    {
      label: "Graduação",
      valor: aluno.graduacao_nome ? (
        <span className="text-amber-700 font-semibold">{aluno.graduacao_nome}</span>
      ) : (
        <span className="text-gray-500">Branca</span>
      ),
    },
    {
      label: "Já treinou antes?",
      valor: aluno.ja_treinou === "sim" ? "Sim" : "Não",
    },
    { label: "Grupo de origem", valor: aluno.grupo_origem || "-" },
    {
      label: "Obs Médicas",
      valor:
        aluno.observacoes_medicas?.trim() ? (
          <span className="text-red-700 bg-red-50 border border-red-200 rounded-md px-2 py-0.5">
            {aluno.observacoes_medicas}
          </span>
        ) : (
          <span className="text-gray-500">Não há</span>
        ),
    },
    {
      label: "Data da Matrícula",
      valor: dataMatricula ? new Date(dataMatricula).toLocaleString("pt-BR") : "-",
    },
    {
      label: "Status",
      valor: (
        <span
          className={`font-semibold ${
            aluno.status === "pendente"
              ? "text-yellow-600"
              : aluno.status === "aprovado"
              ? "text-green-600"
              : "text-red-600"
          }`}
        >
          {aluno.status}
        </span>
      ),
    },
  ];

  return (
    <ModalFicha
      aberto={aberto}
      onClose={onClose}
      titulo={
        <div className="flex justify-center mb-4">
          {aluno.foto_url ? (
            <img
              src={aluno.foto_url}
              alt={aluno.nome}
              className="h-24 w-24 rounded-full object-cover border shadow"
            />
          ) : (
            <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center text-3xl font-bold text-gray-600 shadow">
              {(aluno.apelido || aluno.nome || "?").substring(0, 1).toUpperCase()}
            </div>
          )}
        </div>
      }
      subtitulo={aluno.nome?.replace(/\b\w/g, (l) => l.toUpperCase())}
      dados={dadosFicha}
    />
  );
}


  /* -------------------------------------------------------------------------- */
  /* 🔹 Ficha de aluno ativo/inativo                                            */
  /* -------------------------------------------------------------------------- */
  const dadosFicha = [
    ...dadosBase,
    {
      label: "Categoria",
      valor: aluno.categoria_nome || "-",
    },
    ...(aluno.turma_nome && aluno.turma_nome !== aluno.categoria_nome
      ? [{ label: "Turma", valor: aluno.turma_nome }]
      : []),
    
    {
      label: "Graduação",
      valor: aluno.graduacao_nome ? (
        <span className="text-amber-700 font-semibold">
          {aluno.graduacao_nome}
        </span>
      ) : (
        <span className="text-gray-500">Branca</span>
      ),
    },
  
    {
      label: "Obs Médicas",
      valor:
        aluno.observacoes_medicas?.trim() ? (
          <span className="text-red-700 bg-red-50 border border-red-200 rounded-md px-2 py-0.5">
            {aluno.observacoes_medicas}
          </span>
        ) : (
          <span className="text-gray-500">Não há</span>
        ),
    },
    {
      label: "Data da Matrícula",
      valor: dataMatricula ? new Date(dataMatricula).toLocaleString("pt-BR") : "-",
    },
    {
      label: "Status",
      valor: (
        <span
          className={`font-semibold ${
            aluno.status === "ativo"
              ? "text-green-600"
              : aluno.status === "inativo"
              ? "text-red-600"
              : "text-yellow-600"
          }`}
        >
          {aluno.status}
        </span>
      ),
    },
    {
      label: "Autorização de Imagem",
      valor: aluno.autorizacao_imagem ? "Sim" : "Não",
    },
    { label: "LGPD", valor: aluno.aceite_lgpd ? "Sim" : "Não" },
  ];

  if (aluno.status === "ativo" && metricas) {
    dadosFicha.push(
      { label: "Presenças", valor: `${metricas.presentes}/${metricas.total}` },
      { label: "Faltas", valor: metricas.faltas },
      { label: "Frequência", valor: `${Math.round(metricas.taxa_presenca * 100)}%` }
    );
  }

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
              {(aluno.apelido || aluno.nome || "?").substring(0, 1).toUpperCase()}
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
      subtitulo={nomeFormatado}
      dados={dadosFicha}
      onEditar={() => onEditar?.(aluno)}
    >
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
