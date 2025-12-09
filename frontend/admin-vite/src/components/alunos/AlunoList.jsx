import { useEffect, useState, useCallback } from "react";
import ListagemItem from "../ui/ListagemItem";
import ModalAluno from "./ModalAluno";
import ContadorLista from "../ui/ContadorLista";
import api from "../../services/api";
import { logger } from "../../utils/logger";
import {
  UserCircleIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  ChartBarIcon,
  AcademicCapIcon,
} from "@heroicons/react/24/outline";

import { MdMedicalServices } from "react-icons/md";

// 🔹 Status Pill compacto e alinhado
const StatusPill = ({ status }) => {
  const config = {
    ativo: {
      icon: CheckCircleIcon,
      bg: "bg-green-100",
      text: "text-green-700",
      label: "Ativo",
    },
    inativo: {
      icon: XCircleIcon,
      bg: "bg-red-100",
      text: "text-red-700",
      label: "Inativo",
    },
    pendente: {
      icon: ClockIcon,
      bg: "bg-yellow-100",
      text: "text-yellow-700",
      label: "Pendente",
    },
  };

  const { icon: Icon, bg, text, label } = config[status] || config.ativo;

  return (
    <div
      className={`flex items-center gap-1 px-2 py-1 rounded-full ${bg} ${text}`}
    >
      <Icon className="h-3 w-3" />
      <span className="text-xs font-medium whitespace-nowrap">{label}</span>
    </div>
  );
};

// 🔹 Frequência alinhada à esquerda
const FrequenciaCompacta = ({ percentual }) => {
  const percent = Math.min(Math.max(percentual || 0, 0), 100);
  const getColor = (p) =>
    p >= 80 ? "text-green-600" : p >= 60 ? "text-yellow-600" : "text-red-600";

  return (
    <div className="flex items-center gap-1.5">
      <ChartBarIcon className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />

      {/* Percentual */}
      <span
        className={`text-sm font-medium ${getColor(percent)} whitespace-nowrap`}
      >
        {percent}%
      </span>

      {/* (presenças) */}
      <span className="text-[11px] text-gray-500 whitespace-nowrap">
        (presenças)
      </span>
    </div>
  );
};

export default function AlunoList({
  alunos,
  carregando,
  onVerMais,
  onEditar,
  alunoSelecionado,
  fecharModal,
  onExcluido,
}) {
  const [metricas, setMetricas] = useState({});

  useEffect(() => {
    async function carregarMetricas() {
      if (!alunos || alunos.length === 0) return;

      const anoAtual = new Date().getFullYear();
      const inicio = `${anoAtual}-01-01`;
      const fim = new Date().toISOString().split("T")[0];

      const novasMetricas = {};
      for (const aluno of alunos) {
        try {
          const { data } = await api.get(`/alunos/${aluno.id}/metricas`, {
            params: { inicio, fim },
          });
          novasMetricas[aluno.id] = data;
        } catch (err) {
          logger.error("Erro ao buscar métricas", aluno.id, err);
          novasMetricas[aluno.id] = { taxa_presenca: 0 };
        }
      }
      setMetricas(novasMetricas);
    }

    carregarMetricas();
  }, [alunos]);

  const formatarNome = useCallback((texto) => {
    if (!texto) return "";
    return texto
      .toLowerCase()
      .split(" ")
      .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
      .join(" ");
  }, []);

  // 🔹 ITEM DE ALUNO OTIMIZADO E ALINHADO
  const renderAlunoItem = useCallback(
    (aluno) => {
      const dados = metricas[aluno.id];
      const frequencia = dados ? Math.round(dados.taxa_presenca * 100) : 0;

      const nomePrincipal = aluno.apelido
        ? formatarNome(aluno.apelido)
        : formatarNome(aluno.nome);

      const nomeCompleto = aluno.apelido ? formatarNome(aluno.nome) : null;

      const turma = aluno.turma || "Sem turma";

      return (
        <div
          key={aluno.id}
          className="hover:bg-gray-50 transition-colors cursor-pointer"
          onClick={() => onVerMais(aluno)}
        >
          <ListagemItem
            titulo={
              <div className="w-full">
                {/* Linha 1: Nome principal */}
                <div className="flex items-start gap-2">
                  <UserCircleIcon className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 font-semibold text-gray-900 truncate">
                      <span className="truncate">{nomePrincipal}</span>

                      {aluno.observacoes_medicas && (
                        <MdMedicalServices
                          className="h-4 w-4 text-red-500 flex-shrink-0"
                          title="Possui restrições médicas"
                        />
                      )}
                    </div>

                    {/* Linha 2: Nome completo se tiver apelido */}
                    {nomeCompleto && (
                      <div className="text-xs text-gray-500 truncate leading-tight">
                        {nomeCompleto}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            }
            subtitulo={
              <div className="w-full mt-2">
                {/* Linha 3: Turma + Status */}
                <div className="flex items-center justify-between gap-1 mb-0.5">
                  {/* Turma + Responsável */}
                  <div className="flex items-center gap-1.5 flex-1 min-w-0">
                    <AcademicCapIcon className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                    <span
                      className="text-sm text-gray-600 truncate"
                      title={turma}
                    >
                      {turma}
                      {aluno.responsavel_turma && (
                        <span className="text-xs text-gray-400 ml-1">
                          ({aluno.responsavel_turma})
                        </span>
                      )}
                    </span>
                  </div>

                  {/* Status */}
                  <div className="flex-shrink-0">
                    <StatusPill status={aluno.status} />
                  </div>
                </div>

                {/* Linha 4: Frequência + Aulas */}
                <div className="flex items-center justify-between gap-1">
                  <div className="flex-1">
                    <FrequenciaCompacta percentual={frequencia} />
                  </div>

                  <div className="flex-shrink-0">
                    <span className="text-xs text-gray-500 whitespace-nowrap">
                      {`${dados?.total ?? 0} aulas`}
                    </span>
                  </div>
                </div>
              </div>
            }
          />
        </div>
      );
    },
    [metricas, formatarNome, onVerMais]
  );

  return (
    <div className="px-1 sm:px-3">
      {/* Cabeçalho mais compacto */}
      <div className="flex justify-between items-center mb-3">
        <div>
          <h2 className="text-base font-semibold text-gray-900">Alunos</h2>
        </div>
        <ContadorLista
          total={alunos.length}
          className="bg-white border text-sm"
        />
      </div>

      {/* Lista */}
      {carregando ? (
        <div className="flex items-center justify-center py-6">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600"></div>
          <span className="text-gray-500 text-sm ml-2">Carregando...</span>
        </div>
      ) : alunos.length === 0 ? (
        <div className="text-center py-6 border border-dashed border-gray-300 rounded-lg">
          <UserCircleIcon className="h-8 w-8 text-gray-300 mx-auto" />
          <p className="text-gray-500 text-sm mt-1">Nenhum aluno encontrado</p>
        </div>
      ) : (
        <div className="bg-white border rounded-lg divide-y">
          {alunos.map(renderAlunoItem)}
        </div>
      )}

      {/* Modal */}
      {alunoSelecionado && (
        <ModalAluno
          aberto={true}
          aluno={alunoSelecionado}
          onClose={fecharModal}
          onEditar={onEditar}
          onExcluido={onExcluido}
        />
      )}
    </div>
  );
}
