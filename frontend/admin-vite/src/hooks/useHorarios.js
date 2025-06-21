// src/hooks/useHorarios.js

import { useState, useEffect } from 'react';
import {
  listarHorarios,
  obterHorario,
  criarHorario,
  atualizarHorario,
  excluirHorario,
} from '../services/horariosService';

export default function useHorarios() {
  const [horarios, setHorarios] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState(null);

  // 🔄 Carregar os horários ao iniciar
  const carregarHorarios = async () => {
    setCarregando(true);
    setErro(null);
    try {
      const data = await listarHorarios();
      setHorarios(data);
    } catch (err) {
      setErro('Erro ao carregar horários');
      console.error(err);
    } finally {
      setCarregando(false);
    }
  };

  // ➕ Criar novo horário
  const adicionarHorario = async (dados) => {
    setCarregando(true);
    setErro(null);
    try {
      const novo = await criarHorario(dados);
      await carregarHorarios();
      return novo;
    } catch (err) {
      setErro('Erro ao criar horário');
      console.error(err);
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
      setErro('Erro ao atualizar horário');
      console.error(err);
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
      setErro('Erro ao excluir horário');
      console.error(err);
      throw err;
    } finally {
      setCarregando(false);
    }
  };

  // Carregar na primeira vez
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
  };
}
