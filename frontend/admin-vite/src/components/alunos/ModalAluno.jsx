// src/components/alunos/ModalAluno.jsx
"use client";

import React, { useState, useEffect } from "react";
import ModalFicha from "../ui/ModalFicha";
import NotasAluno from "./NotasAluno";
import { excluirAluno } from "../../services/alunoService";
import api from "../../services/api";
import { toast } from "react-toastify";
import { logger } from "../../utils/logger";
import ModalFotoPerfil from "./ModalFotoPerfil";

export default function ModalAluno({
  aberto,
  onClose,
  aluno,
  onEditar,
  onExcluido,
}) {
  if (!aluno) return null;

  const [foto, setFoto] = useState(aluno?.foto_url || null);
  const [metricas, setMetricas] = useState(null);
  const [zoomFoto, setZoomFoto] = useState(false);
  const [mostrarModalFoto, setMostrarModalFoto] = useState(false);

  /* ========================================================== */
  /* 🔥 IDENTIFICAR ORIGEM DOS DADOS                            */
  /* ========================================================== */
  // Os dados podem vir de duas tabelas diferentes:
  // 1. Tabela 'pre_matricula' → status === "pendente" ou "pre-matricula"
  // 2. Tabela 'alunos' → status === "ativo"
  const isPreMatricula =
    aluno.status === "pendente" || aluno.status === "pre-matricula";
  const isAtivo = aluno.status === "ativo";

  /* ========================================================== */
  /* 🔥 CARREGAR MÉTRICAS (apenas alunos ativos)                */
  /* ========================================================== */
  useEffect(() => {
    if (!isAtivo || !aberto) return;

    const anoAtual = new Date().getFullYear();
    const inicioAno = `${anoAtual}-01-01`;
    const hoje = new Date().toISOString().split("T")[0];

    async function carregarMetricas() {
      try {
        const { data } = await api.get(`/alunos/${aluno.id}/metricas`, {
          params: { inicio: inicioAno, fim: hoje },
        });
        setMetricas(data);
      } catch {
        toast.error("Erro ao carregar métricas");
      }
    }

    carregarMetricas();
  }, [aluno.id, isAtivo, aberto]);

  /* ========================================================== */
  /* 🔥 EXCLUIR ALUNO (apenas alunos ativos)                    */
  /* ========================================================== */
  async function handleExcluir() {
    if (!window.confirm("Tem certeza que deseja excluir o aluno?")) return;

    try {
      await excluirAluno(aluno.id);
      toast.success("Aluno excluído!");
      onExcluido?.();
      onClose();
    } catch (err) {
      logger.error("Erro ao excluir:", err);
      toast.error("Erro ao excluir aluno");
    }
  }

  /* ========================================================== */
  /* 🔥 DADOS FORMATADOS (usados em ambas as fichas)            */
  /* ========================================================== */
  const idade = aluno.nascimento
    ? Math.floor(
        (Date.now() - new Date(aluno.nascimento)) /
          (1000 * 60 * 60 * 24 * 365.25)
      )
    : "-";

  const nomeFormatado =
    aluno.nome?.replace(/\b\w/g, (l) => l.toUpperCase()) || aluno.nome;

  const telefones = [];
  if (aluno.telefone_aluno)
    telefones.push({ label: "Telefone do Aluno", valor: aluno.telefone_aluno });
  if (aluno.telefone_responsavel)
    telefones.push({
      label: aluno.nome_responsavel || "Responsável",
      valor: aluno.telefone_responsavel,
    });

  /* ========================================================== */
  /* 🔥 FICHA 1: PRÉ-MATRÍCULA (tabela pre_matriculas)          */
  /* ========================================================== */
  const getDadosFichaPreMatricula = () => {
    const dados = [
      { label: "Nome completo", valor: nomeFormatado },
      { label: "Apelido", valor: aluno.apelido || "-" },
      {
        label: "Data de nascimento",
        valor: aluno.nascimento
          ? new Date(aluno.nascimento).toLocaleDateString("pt-BR")
          : "-",
      },
      { label: "Idade", valor: `${idade} anos` },
      { label: "CPF", valor: aluno.cpf || "-" },
      { label: "E-mail", valor: aluno.email || "-" },
      ...telefones,
    ];

    // Dados do responsável (apenas pré-matrícula)
    if (aluno.nome_responsavel) {
      dados.push({
        label: "Nome do Responsável",
        valor: aluno.nome_responsavel,
      });
    }
    if (aluno.responsavel_parentesco) {
      dados.push({ label: "Parentesco", valor: aluno.responsavel_parentesco });
    }
    if (aluno.responsavel_documento) {
      dados.push({
        label: "Documento do Responsável",
        valor: aluno.responsavel_documento,
      });
    }
    if (aluno.endereco) {
      dados.push({ label: "Endereço", valor: aluno.endereco });
    }

    // Categoria e graduação selecionadas na pré-matrícula
    if (aluno.categoria_nome) {
      dados.push({
        label: "Categoria Selecionada",
        valor: aluno.categoria_nome,
      });
    }
    if (aluno.graduacao_nome) {
      dados.push({
        label: "Graduação Selecionada",
        valor: aluno.graduacao_nome,
      });
    }

    // Outras informações
    if (aluno.ja_treinou) {
      dados.push({
        label: "Já treinou antes?",
        valor: aluno.ja_treinou === "sim" ? "Sim" : "Não",
      });
    }
    if (aluno.grupo_origem) {
      dados.push({ label: "Grupo de Origem", valor: aluno.grupo_origem });
    }

    dados.push(
      { label: "Obs Médicas", valor: aluno.observacoes_medicas || "Não há" },
      {
        label: "Data da Solicitação",
        valor: new Date(aluno.criado_em).toLocaleString("pt-BR"),
      },
      {
        label: "Autorização de Imagem",
        valor: aluno.autorizacao_imagem ? "Sim" : "Não",
      },
      { label: "LGPD", valor: aluno.aceite_lgpd ? "Sim" : "Não" }
    );

    return dados;
  };

  /* ========================================================== */
  /* 🔥 FICHA 2: ALUNO ATIVO (tabela alunos)                    */
  /* ========================================================== */
  const getDadosFichaAtivo = () => {
    const dados = [
      { label: "Nome completo", valor: nomeFormatado },
      { label: "Apelido", valor: aluno.apelido || "-" },
      {
        label: "Data de nascimento",
        valor: aluno.nascimento
          ? new Date(aluno.nascimento).toLocaleDateString("pt-BR")
          : "-",
      },
      { label: "Idade", valor: `${idade} anos` },
      { label: "CPF", valor: aluno.cpf || "-" },
      { label: "E-mail", valor: aluno.email || "-" },
      ...telefones,
      { label: "Categoria", valor: aluno.categoria_nome || "-" },
    ];

    // Turma (apenas alunos ativos têm turma definitiva)
    if (aluno.turma_nome) {
      dados.push({ label: "Turma", valor: aluno.turma_nome });
    }

    dados.push(
      { label: "Graduação", valor: aluno.graduacao_nome || "Branca" },
      { label: "Obs Médicas", valor: aluno.observacoes_medicas || "Não há" },
      {
        label: "Data da Matrícula",
        valor: new Date(aluno.criado_em || aluno.data_criacao).toLocaleString(
          "pt-BR"
        ),
      },
      { label: "Status", valor: aluno.status },
      {
        label: "Autorização de Imagem",
        valor: aluno.autorizacao_imagem ? "Sim" : "Não",
      },
      { label: "LGPD", valor: aluno.aceite_lgpd ? "Sim" : "Não" }
    );

    // Métricas de frequência (apenas alunos ativos)
    if (metricas) {
      dados.push(
        {
          label: "Presenças",
          valor: `${metricas.presentes}/${metricas.total} (${metricas.faltas} faltas)`,
        },
        {
          label: "Frequência",
          valor: `${Math.round(metricas.taxa_presenca * 100)}%`,
        }
      );
    }

    return dados;
  };

  /* ========================================================== */
  /* 🔥 SELECIONAR FICHA CORRETA BASEADO NA ORIGEM              */
  /* ========================================================== */
  const dadosFicha = isPreMatricula
    ? getDadosFichaPreMatricula()
    : getDadosFichaAtivo();

  /* ========================================================== */
  /* 🔹 COMPONENTE DA FOTO (diferente por tipo)                 */
  /* ========================================================== */
  const FotoAluno = () => {
    // 🔥 PRÉ-MATRÍCULA: Foto simples, SEM camerinha, SEM interação
    if (isPreMatricula) {
      return (
        <div
          className="h-24 w-24 rounded-full flex items-center justify-center bg-gray-200 border-2 border-gray-300 overflow-hidden cursor-pointer hover:border-blue-400 transition-colors"
          onClick={() => {
            if (foto) setZoomFoto(true);
          }}
        >
          {foto ? (
            <img
              src={foto}
              alt={nomeFormatado}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-gray-500 text-2xl font-bold">
              {nomeFormatado.charAt(0)}
            </span>
          )}
        </div>
      );
    }

    // 🔥 ALUNO ATIVO: Foto COM camerinha e interação
    return (
      <div className="relative group">
        <div
          onClick={() => {
            if (foto) {
              setZoomFoto(true);
            } else {
              setMostrarModalFoto(true);
            }
          }}
          className="cursor-pointer"
        >
          <div className="h-24 w-24 rounded-full flex items-center justify-center bg-gray-200 border-2 border-gray-300 hover:border-blue-500 overflow-hidden transition-colors">
            {foto ? (
              <img
                src={foto}
                alt={nomeFormatado}
                className="h-full w-full object-cover group-hover:opacity-90 transition-opacity"
              />
            ) : (
              <span className="text-gray-500 text-2xl font-bold">
                {nomeFormatado.charAt(0)}
              </span>
            )}
          </div>

          {/* CAMERINHA */}
          <div
            className="absolute bottom-0 right-0 bg-blue-500 rounded-full p-1.5 border-2 border-white shadow-md hover:bg-blue-600 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              setMostrarModalFoto(true);
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>

          {/* Overlay hover */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-full flex items-center justify-center transition-colors pointer-events-none">
            <span className="opacity-0 group-hover:opacity-100 text-white text-xs bg-black/70 px-2 py-1 rounded transition-opacity">
              {foto ? "Ampliar" : "Adicionar"}
            </span>
          </div>
        </div>
      </div>
    );
  };

  /* ========================================================== */
  /* 🔹 CONTEÚDO DO ZOOM                                        */
  /* ========================================================== */
  const ConteudoZoom = () => {
    if (!foto) return null;

    return (
      <div className="relative" onClick={(e) => e.stopPropagation()}>
        <img
          src={foto}
          alt={`Foto ampliada de ${nomeFormatado}`}
          className="max-w-[95vw] max-h-[90vh] rounded-lg shadow-2xl object-contain"
        />
        <button
          onClick={(e) => {
            e.stopPropagation();
            setZoomFoto(false);
          }}
          className="absolute -top-12 right-0 text-white bg-black/50 px-4 py-2 rounded hover:bg-black/70 transition-colors"
        >
          ✕ Fechar
        </button>
      </div>
    );
  };

  /* ========================================================== */
  /* 🔹 RENDER                                                  */
  /* ========================================================== */
  return (
    <>
      <ModalFicha
        aberto={aberto}
        onClose={onClose}
        titulo={isPreMatricula ? "Pré-matrícula Pendente" : "Ficha do Aluno"}
        subtitulo={
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="flex-shrink-0">
              <FotoAluno />
            </div>

            <div className="text-center md:text-left">
              <h3 className="text-xl font-bold text-gray-800">
                {nomeFormatado}
              </h3>
              {aluno.apelido && (
                <div className="text-gray-600 italic">"{aluno.apelido}"</div>
              )}

              {/* BADGES */}
              <div className="flex flex-wrap gap-2 mt-2 justify-center md:justify-start">
                {aluno.categoria_nome && (
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                    {aluno.categoria_nome}
                  </span>
                )}
                {aluno.graduacao_nome && (
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                    {aluno.graduacao_nome}
                  </span>
                )}
                <span
                  className={`text-xs px-2 py-1 rounded ${
                    isAtivo
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {isPreMatricula ? "Pré-matrícula" : "Ativo"}
                </span>
              </div>
            </div>
          </div>
        }
        dados={dadosFicha}
        onEditar={isAtivo ? onEditar : undefined}
        zoomAtivo={zoomFoto}
        onCloseZoom={() => setZoomFoto(false)}
        conteudoZoom={<ConteudoZoom />}
      >
        {/* NOTAS - APENAS PARA ALUNOS ATIVOS */}
        {isAtivo && <NotasAluno alunoId={aluno.id} />}

        {/* BOTÃO EXCLUIR - APENAS PARA ALUNOS ATIVOS */}
        {isAtivo && (
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleExcluir}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm transition-colors"
            >
              Excluir aluno
            </button>
          </div>
        )}
      </ModalFicha>

      {/* MODAL DE ALTERAR FOTO - APENAS PARA ALUNOS ATIVOS */}
      {isAtivo && (
        <ModalFotoPerfil
          aberto={mostrarModalFoto}
          onClose={() => setMostrarModalFoto(false)}
          onConfirm={async (base64) => {
            try {
              const { data } = await api.put(`/alunos/${aluno.id}/foto`, {
                imagemBase64: base64,
              });

              setFoto(data.foto_url);
              setMostrarModalFoto(false);
              toast.success("Foto atualizada!");
            } catch (err) {
              toast.error("Erro ao salvar foto");
            }
          }}
        />
      )}
    </>
  );
}
