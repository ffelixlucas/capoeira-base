import ModalFicha from "../ui/ModalFicha";
import NotasAluno from "./NotasAluno";
import { excluirAluno } from "../../services/alunoService";
import api from "../../services/api";
import { toast } from "react-toastify";
import React, { useState, useEffect } from "react";
import { logger } from "../../utils/logger";
import { FaWhatsapp } from "react-icons/fa";

export default function ModalAluno({
  aberto,
  onClose,
  aluno,
  onEditar,
  onExcluido,
}) {
  /* -------------------------------------------------------------------------- */
  /* 🔹 FICHA DE PRÉ-MATRÍCULA COMPLETA                                        */
  /* -------------------------------------------------------------------------- */
  if (aluno?.isPreMatricula) {
    // cálculo da idade
    let idade = null;
    if (aluno.nascimento) {
      const nasc = new Date(aluno.nascimento);
      const diff = Date.now() - nasc.getTime();
      idade = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
    }

    const dadosFicha = [
      { label: "Foto", valor: aluno.foto_url },

      // 🧍 Dados pessoais
      { label: "Nome completo", valor: aluno.nome || "-" },
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
      { label: "Telefone", valor: aluno.telefone || "-" },

      // 🥋 Dados de capoeira
      {
        label: "Categoria",
        valor: aluno.categoria_nome ? (
          <span className="text-gray-800 font-medium">
            {aluno.categoria_nome}
          </span>
        ) : (
          "-"
        ),
      },
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
        label: "Já treinou antes?",
        valor: aluno.ja_treinou === "sim" ? "Sim" : "Não",
      },
      {
        label: "Grupo de origem",
        valor: aluno.grupo_origem || "-",
      },

      // 🩺 Saúde
      {
        label: "Obs Médicas",
        valor:
          aluno.observacoes_medicas &&
          aluno.observacoes_medicas.trim() !== "" ? (
            <span className="text-red-700 bg-red-50 border border-red-200 rounded-md px-2 py-0.5">
              {aluno.observacoes_medicas
                .charAt(0)
                .toUpperCase() +
                aluno.observacoes_medicas.slice(1).toLowerCase()}
            </span>
          ) : (
            <span className="text-gray-500">Não há</span>
          ),
      },

      // 🏫 Organização
      {
        label: "Organização",
        valor: aluno.organizacao_nome || aluno.organizacao || "-",
      },

      // 📅 Sistema
      {
        label: "Data de criação",
        valor: aluno.data_criacao
          ? new Date(aluno.data_criacao).toLocaleString("pt-BR")
          : "-",
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

    // ✅ repassa para o ModalFicha genérico
    const dadosComFoto = [
      { label: "Foto", valor: aluno.foto_url },
      ...dadosFicha.filter((item) => item.label !== "Foto"),
    ];

    return (
      <ModalFicha
        aberto={aberto}
        onClose={onClose}
        titulo="Pré-Matrícula"
        subtitulo={aluno.nome}
        dados={dadosComFoto}
      />
    );
  }

  /* -------------------------------------------------------------------------- */
  /* 🔹 FICHA DE ALUNO NORMAL (mantida sem alterações)                         */
  /* -------------------------------------------------------------------------- */
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

  let idade = null;
  if (aluno.nascimento) {
    const nascimento = new Date(aluno.nascimento);
    const diff = Date.now() - nascimento.getTime();
    idade = new Date(diff).getUTCFullYear() - 1970;
  }

  const dados = [];

  if (aluno.apelido) {
    dados.push({ label: "Apelido", valor: aluno.apelido });
  }

  dados.push({
    label: "Graduação",
    valor: aluno.graduacao ? (
      <span className="text-amber-700 font-semibold">
        {aluno.graduacao}
      </span>
    ) : (
      <span className="text-gray-500">Branca</span>
    ),
  });

  dados.push({
    label: "Nascimento",
    valor: aluno.nascimento
      ? new Date(aluno.nascimento).toLocaleDateString("pt-BR")
      : "-",
  });

  if (idade !== null && idade < 18) {
    dados.push({ label: "Responsável", valor: aluno.nome_responsavel || "-" });
  }

  const telefoneContato =
    idade !== null && idade < 18
      ? aluno.telefone_responsavel
      : aluno.telefone_aluno;

  dados.push({
    label: "Contato",
    valor: telefoneContato ? (
      <span className="inline-flex items-center gap-2">
        <span>{telefoneContato}</span>
        <FaWhatsapp
          onClick={() =>
            window.open(
              `https://wa.me/55${telefoneContato.replace(/\D/g, "")}`,
              "_blank"
            )
          }
          className="text-green-500 cursor-pointer"
          title="Abrir no WhatsApp"
        />
      </span>
    ) : (
      "-"
    ),
  });

  dados.push({ label: "Endereço", valor: aluno.endereco || "-" });
  dados.push({ label: "Turma", valor: aluno.turma || "-" });

  dados.push({
    label: "Obs Médicas",
    valor:
      aluno.observacoes_medicas && aluno.observacoes_medicas.trim() !== "" ? (
        <span className="text-red-700 bg-red-50 border border-red-200 rounded-md px-2 py-0.5">
          {aluno.observacoes_medicas
            .charAt(0)
            .toUpperCase() + aluno.observacoes_medicas.slice(1).toLowerCase()}
        </span>
      ) : (
        <span className="text-gray-500">Não há</span>
      ),
  });

  dados.push({
    label: "Autorização de Imagem",
    valor: aluno.autorizacao_imagem ? "Sim" : "Não",
  });

  dados.push({
    label: "LGPD",
    valor: aluno.aceite_lgpd ? "Sim" : "Não",
  });

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
