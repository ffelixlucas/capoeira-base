// src/components/horarios/HorarioForm.jsx

import React, { useState, useEffect } from "react";

function HorarioForm({ onSubmit, onCancel, dadosIniciais = {} }) {
  const [turma, setTurma] = useState("");
  const [dias, setDias] = useState("");
  const [horario, setHorario] = useState("");
  const [faixaEtaria, setFaixaEtaria] = useState("");
  const [instrutor, setInstrutor] = useState("");
  const [whatsappInstrutor, setWhatsappInstrutor] = useState("");
  const [ordem, setOrdem] = useState("");

  // Preenche os dados no modo edição
  useEffect(() => {
    if (dadosIniciais) {
      setTurma(dadosIniciais.turma || "");
      setDias(dadosIniciais.dias || "");
      setHorario(dadosIniciais.horario || "");
      setFaixaEtaria(dadosIniciais.faixa_etaria || "");
      setInstrutor(dadosIniciais.instrutor || "");
      setWhatsappInstrutor(dadosIniciais.whatsapp_instrutor || "");
      setOrdem(dadosIniciais.ordem || "");
    }
  }, [dadosIniciais]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!turma || !dias || !horario || !faixaEtaria) {
      alert("Preencha todos os campos obrigatórios.");
      return;
    }

    const dados = {
      turma,
      dias,
      horario,
      faixa_etaria: faixaEtaria,
      instrutor,
      whatsapp_instrutor: whatsappInstrutor,
      ordem: ordem ? parseInt(ordem) : null,
    };

    onSubmit(dados);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 border border-cor-primaria rounded-lg p-4 shadow-sm bg-cor-secundaria text-cor-texto"
    >
      <div>
        <label className="block text-sm font-medium">Turma *</label>
        <input
          type="text"
          value={turma}
          onChange={(e) => setTurma(e.target.value)}
          className="w-full border border-cor-primaria rounded px-3 py-2 bg-cor-fundo text-cor-texto placeholder-cor-texto/50 focus:outline-none focus:ring-2 focus:ring-cor-primaria"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Dias *</label>
        <input
          type="text"
          value={dias}
          onChange={(e) => setDias(e.target.value)}
          className="w-full border border-cor-primaria rounded px-3 py-2 bg-cor-fundo text-cor-texto placeholder-cor-texto/50 focus:outline-none focus:ring-2 focus:ring-cor-primaria"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Horário *</label>
        <input
          type="text"
          value={horario}
          onChange={(e) => setHorario(e.target.value)}
          className="w-full border border-cor-primaria rounded px-3 py-2 bg-cor-fundo text-cor-texto placeholder-cor-texto/50 focus:outline-none focus:ring-2 focus:ring-cor-primaria"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Faixa Etária *</label>
        <input
          type="text"
          value={faixaEtaria}
          onChange={(e) => setFaixaEtaria(e.target.value)}
          className="w-full border border-cor-primaria rounded px-3 py-2 bg-cor-fundo text-cor-texto placeholder-cor-texto/50 focus:outline-none focus:ring-2 focus:ring-cor-primaria"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Instrutor</label>
        <input
          type="text"
          value={instrutor}
          onChange={(e) => setInstrutor(e.target.value)}
          className="w-full border border-cor-primaria rounded px-3 py-2 bg-cor-fundo text-cor-texto placeholder-cor-texto/50 focus:outline-none focus:ring-2 focus:ring-cor-primaria"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">
          WhatsApp do Instrutor
        </label>
        <input
          type="text"
          value={whatsappInstrutor}
          onChange={(e) => setWhatsappInstrutor(e.target.value)}
          className="w-full border border-cor-primaria rounded px-3 py-2 bg-cor-fundo text-cor-texto placeholder-cor-texto/50 focus:outline-none focus:ring-2 focus:ring-cor-primaria"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Ordem</label>
        <input
          type="number"
          value={ordem}
          onChange={(e) => setOrdem(e.target.value)}
          className="w-full border border-cor-primaria rounded px-3 py-2 bg-cor-fundo text-cor-texto placeholder-cor-texto/50 focus:outline-none focus:ring-2 focus:ring-cor-primaria"
        />
      </div>

      <div className="flex space-x-2">
        <button
          type="submit"
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Salvar
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}

export default HorarioForm;
