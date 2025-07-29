import { useState } from "react";
import ModalFicha from "../listagem/ModalFicha";
import NotasAluno from "./NotasAluno";
import { excluirAluno } from "../../services/alunoService";
import { toast } from "react-toastify";

export default function ModalAluno({
  aberto,
  onClose,
  aluno,
  onEditar,
  onExcluido,
}) {
  const [foto, setFoto] = useState(aluno?.foto_url || null);

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
      console.error("Erro ao excluir aluno:", err);
      toast.error("Erro ao excluir aluno.");
    }
  };

  return (
    <ModalFicha
      aberto={aberto}
      onClose={onClose}
      titulo={
        <div className="flex justify-center mb-4 relative">
  {/* Foto ou iniciais */}
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

  {/* Ícone câmera estilo Google */}
  <button
    className="absolute bottom-0 right-1/2 translate-x-10 w-8 h-8 flex items-center justify-center 
               bg-white border border-gray-300 rounded-full shadow-md hover:bg-gray-100"
    title="Adicionar/Alterar foto"
    onClick={() => alert('Futuramente: upload foto Firebase')}
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
      {/* Conteúdo adicional exclusivo dos alunos */}
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
