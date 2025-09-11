import { useState, useEffect } from "react";
import {
  listarHorarios,
  obterHorario,
  criarHorario,
  atualizarHorario,
  excluirHorario,
  atualizarOrdemHorarios, // 🔥 nova função no service
} from "../services/horariosService";
import { logger } from "../utils/logger";

export default function useHorarios() {
  const [horarios, setHorarios] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState(null);

  // 🔄 Carregar os horários
  const carregarHorarios = async () => {
    setCarregando(true);
    setErro(null);
    try {
      const data = await listarHorarios();
      setHorarios(data);
    } catch (err) {
      setErro("Erro ao carregar horários");
      logger.error(err);
    } finally {
      setCarregando(false);
    }
  };

  // ➕ Criar horário
  const adicionarHorario = async (dados) => {
    setCarregando(true);
    setErro(null);
    try {
      const novo = await criarHorario(dados);
      await carregarHorarios();
      return novo;
    } catch (err) {
      setErro("Erro ao criar horário");
      logger.error(err);
      throw err;
    } finally {
      setCarregando(false);
    }
  };

  // ✏️ Atualizar horário
  const editarHorario = async (id, dados) => {
    setCarregando(true);
    setErro(null);
    try {
      await atualizarHorario(id, dados);
      await carregarHorarios();
    } catch (err) {
      setErro("Erro ao atualizar horário");
      logger.error(err);
      throw err;
    } finally {
      setCarregando(false);
    }
  };

  // 🗑️ Excluir horário
  const removerHorario = async (id) => {
    setCarregando(true);
    setErro(null);
    try {
      await excluirHorario(id);
      await carregarHorarios();
    } catch (err) {
      setErro("Erro ao excluir horário");
      logger.error(err);
      throw err;
    } finally {
      setCarregando(false);
    }
  };

  // 🔥 Atualizar ordem dos horários
  const atualizarVariosHorarios = async (lista) => {
    setCarregando(true);
    setErro(null);
    try {
      await atualizarOrdemHorarios(lista); // → chama API
      await carregarHorarios();
    } catch (err) {
      setErro("Erro ao atualizar ordem dos horários");
      logger.error(err);
      throw err;
    } finally {
      setCarregando(false);
    }
  };

  // 🚀 Carregar na primeira vez
  useEffect(() => {
    carregarHorarios();
  }, []);

  return {
    horarios,
    carregando,
    erro,
    carregarHorarios,
    adicionarHorario,
    editarHorario,
    removerHorario,
    atualizarVariosHorarios, // 🔥 exportado para o pai usar
  };
}
