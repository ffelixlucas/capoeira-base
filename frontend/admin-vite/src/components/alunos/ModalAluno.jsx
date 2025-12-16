"use client";

import React, { useState, useEffect, useMemo } from "react";
import ModalFicha from "../ui/ModalFicha";
import NotasAluno from "./NotasAluno";
import { excluirAluno } from "../../services/alunoService";
import api from "../../services/api";
import { toast } from "react-toastify";
import { logger } from "../../utils/logger";
import ModalFotoPerfil from "./ModalFotoPerfil";

import {
  Phone,
  Mail,
  MapPin,
  Calendar,
  User,
  Trophy,
  Clock,
  AlertCircle,
  Edit,
  Trash2,
  CheckCircle,
  IdCard,
  Shield,
  Camera,
} from "lucide-react";

export default function ModalAluno({
  aberto,
  onClose,
  aluno,
  onEditar,
  onExcluido,
}) {
  if (!aluno) return null;

  const [foto, setFoto] = useState(aluno.foto_url || null);
  const [mostrarEditarFoto, setMostrarEditarFoto] = useState(false);

  const [metricas, setMetricas] = useState(null);
  const [zoomFoto, setZoomFoto] = useState(false);

  // 🔹 Sempre que trocar de aluno, atualiza a foto mostrada
  useEffect(() => {
    setFoto(aluno.foto_url || null);
  }, [aluno.id, aluno.foto_url]);

  const isPreMatricula = aluno.status === "pendente";
  const isAtivo = aluno.status === "ativo";

  const nomeFormatado = useMemo(
    () => aluno.nome?.replace(/\b\w/g, (l) => l.toUpperCase()) || "",
    [aluno.nome]
  );

  const idade = useMemo(() => {
    if (!aluno.nascimento) return "-";
    const diff = Date.now() - new Date(aluno.nascimento).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
  }, [aluno.nascimento]);

  const taxaPresenca = metricas ? Math.round(metricas.taxa_presenca * 100) : 0;

  useEffect(() => {
    if (!isAtivo || !aberto) {
      setMetricas(null);
      return;
    }

    const ano = new Date().getFullYear();
    const hoje = new Date().toISOString().split("T")[0];

    async function load() {
      try {
        const { data } = await api.get(`/alunos/${aluno.id}/metricas`, {
          params: { inicio: `${ano}-01-01`, fim: hoje },
        });
        setMetricas(data);
      } catch {
        toast.error("Erro ao carregar frequência");
      }
    }
    load();
  }, [aluno.id, aberto, isAtivo]);

  const handleExcluir = async () => {
    if (!window.confirm("Excluir permanentemente este aluno?")) return;
    try {
      await excluirAluno(aluno.id);
      toast.success("Aluno excluído");
      onExcluido?.();
      onClose();
    } catch (err) {
      logger.error(err);
      toast.error("Erro ao excluir");
    }
  };

  const handleEditar = async () => {
    try {
      const { data } = await api.get(`/alunos/${aluno.id}`);
      onEditar?.(data);
    } catch {
      toast.error("Erro ao carregar dados para edição");
    }
  };

  const corFrequencia = (p) => {
    if (p >= 80) return "#10b981"; // verde
    if (p >= 60) return "#f59e0b"; // amarelo
    return "#ef4444"; // vermelho
  };

  async function salvarFotoAluno(base64) {
    try {
      const blob = await (await fetch(base64)).blob();

      const formData = new FormData();
      formData.append("foto", blob, "foto.jpg");
      formData.append("alunoId", aluno.id);

      const { data } = await api.post("/upload/foto/aluno", formData, {
        timeout: 60000, // 60s
      });

      setFoto(data.url); // atualiza visual
      toast.success("Foto atualizada com sucesso");
    } catch (err) {
      logger.error(err);
      toast.error("Erro ao salvar foto");
    }
  }

  return (
    <>
      <ModalFicha
        aberto={aberto}
        onClose={onClose}
        titulo={isPreMatricula ? "Pré-matrícula" : "Perfil do Aluno"}
        className="max-w-lg bg-white"
        zoomAtivo={zoomFoto}
        onCloseZoom={() => setZoomFoto(false)}
        conteudoZoom={
          foto && (
            <img
              src={foto}
              alt={nomeFormatado}
              className="max-w-[90vw] max-h-[90vh] rounded-3xl object-contain"
            />
          )
        }
      >
        {/* Header estilo WhatsApp/Instagram */}
        <div className="bg-gray-100 -m-6 pb-8 rounded-t-3xl">
          <div className="pt-8 px-6 flex flex-col items-center">
            <div
              className="relative cursor-pointer"
              onClick={() => foto && setZoomFoto(true)}
            >
              <div className="w-40 h-40 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gray-200">
                {foto ? (
                  <img
                    src={foto}
                    alt={nomeFormatado}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-6xl font-bold text-gray-500">
                    {nomeFormatado.charAt(0)}
                  </div>
                )}

                {/* Ícone da câmera sobre a foto */}
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // impede abrir zoom
                    setMostrarEditarFoto(true);
                  }}
                  className="
                    absolute bottom-2 right-2
                    bg-blue-600 hover:bg-blue-700
                    text-white p-3 rounded-full shadow-lg
                    flex items-center justify-center
                    active:scale-95 transition
                  "
                >
                  <Camera size={18} />
                </button>
              </div>
            </div>

            <h2 className="mt-6 text-2xl font-bold text-black">
              {nomeFormatado}
            </h2>
            {aluno.apelido && (
              <p className="text-lg text-gray-600 italic">"{aluno.apelido}"</p>
            )}
            {/* Obs médicas */}
            {aluno.observacoes_medicas && (
              <>
                <hr className="border-gray-200" />
                <div className="bg-red-50 rounded-2xl p-4 flex gap-3">
                  <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-red-900">
                      Observações Médicas
                    </p>
                    <p className="text-black">{aluno.observacoes_medicas}</p>
                  </div>
                </div>
              </>
            )}

            {/* Botões principais */}
            <div className="mt-6 flex gap-4 w-full">
              {(aluno.telefone_aluno || aluno.telefone_responsavel) && (
                <a
                  href={`https://wa.me/55${(
                    aluno.telefone_aluno || aluno.telefone_responsavel
                  ).replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-2xl flex items-center justify-center gap-3 shadow-md transition"
                >
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
                    alt=""
                    className="w-6 h-6"
                  />
                  WhatsApp
                </a>
              )}
              {isAtivo && (
                <button
                  onClick={handleEditar}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-2xl flex items-center justify-center gap-2 shadow-md transition"
                >
                  <Edit className="w-5 h-5" />
                  Editar
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Conteúdo principal */}
        <div className="mt-8 space-y-6 px-6 pb-6">
          {/* Frequência como círculo (se ativo) */}
          {isAtivo && metricas && (
            <div className="flex justify-center">
              <div className="relative w-40 h-40">
                <svg className="w-40 h-40 transform -rotate-90">
                  {/* Fundo */}
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="#e5e7eb"
                    strokeWidth="12"
                    fill="none"
                  />

                  {/* Dinâmico */}
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke={corFrequencia(taxaPresenca)}
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 70}`}
                    strokeDashoffset={`${
                      2 * Math.PI * 70 * (1 - taxaPresenca / 100)
                    }`}
                    className="transition-all duration-1000"
                  />
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-bold text-black">
                    {taxaPresenca}%
                  </span>
                  <span className="text-sm text-gray-600">Frequência</span>
                  <span className="text-xs text-gray-500 mt-1">
                    {metricas.presentes}/{metricas.total} aulas
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Seção Informações Pessoais */}
          <div className="space-y-4">
            <h3 className="font-semibold text-black text-lg">
              Informações Pessoais
            </h3>
            <div className="space-y-3 text-black">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-500" />
                <span>
                  Nascimento:{" "}
                  {aluno.nascimento
                    ? new Date(aluno.nascimento).toLocaleDateString("pt-BR")
                    : "-"}{" "}
                  ({idade} anos)
                </span>
              </div>
              {aluno.cpf && (
                <div className="flex items-center gap-3">
                  <IdCard className="w-5 h-5 text-gray-500" />
                  <span>CPF: {aluno.cpf}</span>
                </div>
              )}
              {aluno.email && (
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gray-500" />
                  <span>E-mail: {aluno.email}</span>
                </div>
              )}
              {aluno.telefone_aluno && (
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-gray-500" />
                  <span>Telefone: {aluno.telefone_aluno}</span>
                </div>
              )}
              {aluno.telefone_responsavel && (
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-gray-500" />
                  <span>
                    Responsável: {aluno.telefone_responsavel}{" "}
                    {aluno.nome_responsavel && `(${aluno.nome_responsavel})`}
                  </span>
                </div>
              )}
              {aluno.endereco && (
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-gray-500" />
                  <span>Endereço: {aluno.endereco}</span>
                </div>
              )}
            </div>
          </div>

          <hr className="border-gray-200" />

          {/* Seção Academia */}
          <div className="space-y-4">
            <h3 className="font-semibold text-black text-lg">Na Academia</h3>
            <div className="grid grid-cols-2 gap-4 text-black">
              <div className="flex items-center gap-3">
                <Trophy className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Graduação</p>
                  <p className="font-medium">
                    {aluno.graduacao_nome || "Branca"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Categoria</p>
                  <p className="font-medium">{aluno.categoria_nome || "-"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Turma</p>
                  <p className="font-medium">{aluno.turma_nome || "-"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 col-span-2">
                <Calendar className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">
                    {isPreMatricula ? "Criado em" : "Matriculado em"}
                  </p>
                  <p className="font-medium">
                    {new Date(aluno.criado_em).toLocaleString("pt-BR")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Autorizações pré-matrícula */}
          {isPreMatricula && (
            <>
              <hr className="border-gray-200" />
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-2xl">
                  <Camera className="w-10 h-10 mx-auto text-gray-600 mb-2" />
                  <p className="font-medium text-black">Imagem</p>
                  <p
                    className={`text-xl font-bold ${
                      aluno.autorizacao_imagem
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {aluno.autorizacao_imagem ? "Sim" : "Não"}
                  </p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-2xl">
                  <Shield className="w-10 h-10 mx-auto text-gray-600 mb-2" />
                  <p className="font-medium text-black">LGPD</p>
                  <p
                    className={`text-xl font-bold ${
                      aluno.aceite_lgpd ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {aluno.aceite_lgpd ? "Aceito" : "Não"}
                  </p>
                </div>
              </div>
            </>
          )}

          {/* Notas e Excluir */}
          {isAtivo && (
            <>
              <hr className="border-gray-200 my-6" />
              <NotasAluno alunoId={aluno.id} />

              <div className="mt-6 flex justify-center">
                <button
                  onClick={handleExcluir}
                  className="text-red-600 hover:text-red-700 font-medium flex items-center gap-2 px-6 py-3 rounded-2xl border border-red-200 hover:bg-red-50 transition"
                >
                  <Trash2 className="w-5 h-5" />
                  Excluir aluno
                </button>
              </div>
            </>
          )}
        </div>
      </ModalFicha>

      {mostrarEditarFoto && (
        <ModalFotoPerfil
          aberto={mostrarEditarFoto}
          onClose={() => setMostrarEditarFoto(false)}
          onConfirm={async (base64) => {
            await salvarFotoAluno(base64); // 🔥 backend
            setMostrarEditarFoto(false);
          }}
        />
      )}
    </>
  );
}
