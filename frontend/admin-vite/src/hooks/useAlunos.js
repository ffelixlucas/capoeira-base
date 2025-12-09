// src/hooks/useAlunos.js
import { useState } from "react";
import {
  listarAlunos,
  buscarAluno,
  criarAluno,
  editarAluno,
  excluirAluno,
  trocarTurma,
} from "../services/alunoService";
import { toast } from "react-toastify";

export function useAlunos() {
  const [alunos, setAlunos] = useState([]);
  const [carregando, setCarregando] = useState(false);
async function carregarAlunos() {
  setCarregando(true);
  try {
    const data = await listarAlunos();
    setAlunos(data);

    // 👉 ADICIONE ISSO
    if (data && data.length > 0) {
      console.log("🔍 DEBUG ALUNO:", data[0]);
    }

  } catch (error) {
    toast.error("Erro ao carregar alunos");
  } finally {
    setCarregando(false);
  }
}


  async function cadastrar(dados) {
    try {
      await criarAluno(dados);
      toast.success("Aluno cadastrado");
      carregarAlunos();
    } catch (error) {
      toast.error(error?.response?.data?.erro || "Erro ao cadastrar aluno");
    }
  }

  async function atualizar(id, dados) {
    try {
      await editarAluno(id, dados);
      toast.success("Aluno atualizado");
      carregarAlunos();
    } catch (error) {
      toast.error("Erro ao atualizar");
    }
  }

  async function remover(id) {
    try {
      await excluirAluno(id);
      toast.success("Aluno excluído");
      carregarAlunos();
    } catch (error) {
      toast.error("Erro ao excluir");
    }
  }

  async function moverParaOutraTurma(id, novaTurmaId) {
    try {
      await trocarTurma(id, novaTurmaId);
      toast.success("Turma alterada");
      carregarAlunos();
    } catch (error) {
      toast.error("Erro ao trocar turma");
    }
  }

  return {
    alunos,
    carregando,
    carregarAlunos,
    cadastrar,
    atualizar,
    remover,
    moverParaOutraTurma,
  };
}
