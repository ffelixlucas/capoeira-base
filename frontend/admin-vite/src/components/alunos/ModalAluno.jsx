// src/components/alunos/ModalAluno.jsx
"use client";

import React, { useState, useEffect } from "react";
import ModalFicha from "../ui/ModalFicha";
import NotasAluno from "./NotasAluno";
import { excluirAluno } from "../../services/alunoService";
import api from "../../services/api";
import { toast } from "react-toastify";
import { logger } from "../../utils/logger";

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

  const isPreMatricula = aluno.status === "pendente";
  const isAtivo = aluno.status === "ativo";

  /* ========================================================== */
  /* 🔥 MÉTRICAS APENAS PARA ATIVOS                             */
  /* ========================================================== */
  useEffect(() => {
    if (!isAtivo || !aberto) return;

    const ano = new Date().getFullYear();
    const hoje = new Date().toISOString().split("T")[0];

    async function carregar() {
      try {
        const { data } = await api.get(`/alunos/${aluno.id}/metricas`, {
          params: { inicio: `${ano}-01-01`, fim: hoje },
        });
        setMetricas(data);
      } catch {
        toast.error("Erro ao carregar métricas");
      }
    }

    carregar();
  }, [aluno.id, aberto, isAtivo]);

  /* ========================================================== */
  /* 🔥 EXCLUIR                                                 */
  /* ========================================================== */
  async function handleExcluir() {
    if (!window.confirm("Excluir o aluno permanentemente?")) return;

    try {
      await excluirAluno(aluno.id);
      toast.success("Aluno excluído!");
      onExcluido?.();
      onClose();
    } catch (err) {
      logger.error(err);
      toast.error("Erro ao excluir");
    }
  }

  /* ========================================================== */
  /* 🔥 FORMATOS                                                */
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
    telefones.push({ label: "Telefone do aluno", valor: aluno.telefone_aluno });
  if (aluno.telefone_responsavel)
    telefones.push({
      label: aluno.nome_responsavel || "Responsável",
      valor: aluno.telefone_responsavel,
    });

  /* ========================================================== */
  /* 🔥 FICHA PRE-MATRÍCULA                                     */
  /* ========================================================== */
  const fichaPre = [
    { label: "Nome completo", valor: nomeFormatado },
    { label: "Apelido", valor: aluno.apelido || "-" },
    {
      label: "Nascimento",
      valor: aluno.nascimento
        ? new Date(aluno.nascimento).toLocaleDateString("pt-BR")
        : "-",
    },
    { label: "Idade", valor: idade },
    { label: "CPF", valor: aluno.cpf || "-" },
    { label: "E-mail", valor: aluno.email || "-" },
    ...telefones,
    { label: "Endereço", valor: aluno.endereco || "-" },
    { label: "Categoria escolhida", valor: aluno.categoria_nome || "-" },
    { label: "Graduação sugerida", valor: aluno.graduacao_nome || "-" },
    {
      label: "Obs Médicas",
      valor: aluno.observacoes_medicas || "Nenhuma",
    },
    {
      label: "Criado em",
      valor: new Date(aluno.criado_em).toLocaleString("pt-BR"),
    },
    {
      label: "Autorização de imagem",
      valor: aluno.autorizacao_imagem ? "Sim" : "Não",
    },
    { label: "LGPD", valor: aluno.aceite_lgpd ? "Sim" : "Não" },
  ];

  /* ========================================================== */
  /* 🔥 FICHA ATIVO                                             */
  /* ========================================================== */
  const fichaAtivo = [
    { label: "Nome completo", valor: nomeFormatado },
    { label: "Apelido", valor: aluno.apelido || "-" },
    {
      label: "Nascimento",
      valor: aluno.nascimento
        ? new Date(aluno.nascimento).toLocaleDateString("pt-BR")
        : "-",
    },
    { label: "Idade", valor: idade },
    { label: "CPF", valor: aluno.cpf || "-" },
    ...telefones,
    { label: "Categoria", valor: aluno.categoria_nome || "-" },
    { label: "Graduação", valor: aluno.graduacao_nome || "Branca" },
    { label: "Turma", valor: aluno.turma_nome || "-" },
    {
      label: "Obs Médicas",
      valor: aluno.observacoes_medicas || "Nenhuma",
    },
    {
      label: "Matriculado em",
      valor: new Date(aluno.criado_em).toLocaleString("pt-BR"),
    },
    { label: "Status", valor: aluno.status },
  ];

  if (metricas) {
    fichaAtivo.push(
      {
        label: "Frequência",
        valor: `${metricas.presentes}/${metricas.total}`,
      },
      {
        label: "Taxa de presença",
        valor: `${Math.round(metricas.taxa_presenca * 100)}%`,
      }
    );
  }

  const dadosFicha = isPreMatricula ? fichaPre : fichaAtivo;

  /* ========================================================== */
  /* 🔥 FOTO (sem camerinha porque backend ainda não tem rota)  */
  /* ========================================================== */
  const Foto = () => (
    <div
      className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center border-2 overflow-hidden cursor-pointer"
      onClick={() => foto && setZoomFoto(true)}
    >
      {foto ? (
        <img src={foto} className="h-full w-full object-cover" />
      ) : (
        <span className="text-gray-500 text-xl">
          {nomeFormatado?.charAt(0)}
        </span>
      )}
    </div>
  );

  /* ========================================================== */
  /* 🔥 ZOOM                                                    */
  /* ========================================================== */
  const ConteudoZoom = () => (
    <img
      src={foto}
      className="max-w-[90vw] max-h-[90vh] rounded shadow-2xl object-contain"
    />
  );

  /* ========================================================== */
  /* 🔥 RENDER                                                  */
  /* ========================================================== */
  return (
    <>
      <ModalFicha
        aberto={aberto}
        onClose={onClose}
        titulo={isPreMatricula ? "Pré-matrícula" : "Aluno"}
        subtitulo={
          <div className="flex items-center gap-4">
            <Foto />
            <div>
              <h3 className="font-bold text-lg">{nomeFormatado}</h3>
              {aluno.apelido && (
                <div className="text-gray-600 italic">"{aluno.apelido}"</div>
              )}
            </div>
          </div>
        }
        dados={dadosFicha}
        onEditar={
          isAtivo
            ? async () => {
                try {
                  const { data } = await api.get(`/alunos/${aluno.id}`);
                  onEditar?.(data);
                } catch {
                  toast.error("Erro ao carregar aluno.");
                }
              }
            : undefined
        }
        zoomAtivo={zoomFoto}
        onCloseZoom={() => setZoomFoto(false)}
        conteudoZoom={<ConteudoZoom />}
      >
        {isAtivo && <NotasAluno alunoId={aluno.id} />}

        {isAtivo && (
          <div className="flex justify-end mt-4">
            <button
              onClick={handleExcluir}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
            >
              Excluir aluno
            </button>
          </div>
        )}
      </ModalFicha>
    </>
  );
}
