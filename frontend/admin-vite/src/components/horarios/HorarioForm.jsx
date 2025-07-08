import React, { useState, useEffect } from "react";
import { useContext } from "react";
import { useAuth } from "../../contexts/AuthContext";

function HorarioForm({ onSubmit, onCancel, dadosIniciais = {} }) {
  const { token } = useAuth();

  const [turma, setTurma] = useState("");
  const [diasSelecionados, setDiasSelecionados] = useState([]);
  const [horarioInicio, setHorarioInicio] = useState("");
  const [horarioFim, setHorarioFim] = useState("");
  const [faixaEtariaMin, setFaixaEtariaMin] = useState("");
  const [faixaEtariaMax, setFaixaEtariaMax] = useState("");
  const [equipe, setEquipe] = useState([]);
  const [responsavelId, setResponsavelId] = useState("");

  useEffect(() => {
    fetch("/api/equipe", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setEquipe(data))
      .catch((err) => console.error("Erro ao buscar equipe:", err));
  }, [token]);
  
  const diasSemana = [
    "Segunda",
    "Terça",
    "Quarta",
    "Quinta",
    "Sexta",
    "Sábado",
    "Domingo",
  ];

  useEffect(() => {
    if (dadosIniciais) {
      setTurma(dadosIniciais.turma || "");
      setDiasSelecionados(
        dadosIniciais.dias ? dadosIniciais.dias.split(", ") : []
      );

      const horarioParts = dadosIniciais.horario?.split(" - ") || [];
      setHorarioInicio(horarioParts[0] || "");
      setHorarioFim(horarioParts[1] || "");

      const faixa = dadosIniciais.faixa_etaria?.split(" a ") || [];
      if (faixa.length === 2) {
        setFaixaEtariaMin(faixa[0] || "");
        setFaixaEtariaMax(faixa[1]?.replace(" anos", "") || "");
      } else {
        const faixaPlus = dadosIniciais.faixa_etaria?.split("+") || [];
        setFaixaEtariaMin(faixaPlus[0]?.trim() || "");
        setFaixaEtariaMax("");
      }

      setResponsavelId(dadosIniciais.responsavel_id || "");
    }
  }, [dadosIniciais]);

  const toggleDia = (dia) => {
    if (diasSelecionados.includes(dia)) {
      setDiasSelecionados(diasSelecionados.filter((d) => d !== dia));
    } else {
      setDiasSelecionados([...diasSelecionados, dia]);
    }
  };

  const formatarWhatsapp = (valor) => {
    const numeros = valor.replace(/\D/g, "");

    if (numeros.length === 0) return "";

    if (numeros.length <= 2) {
      return `(${numeros}`;
    }
    if (numeros.length <= 6) {
      return `(${numeros.slice(0, 2)}) ${numeros.slice(2)}`;
    }
    if (numeros.length <= 7) {
      return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 3)} ${numeros.slice(
        3
      )}`;
    }
    if (numeros.length <= 11) {
      return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 3)} ${numeros.slice(
        3,
        7
      )}-${numeros.slice(7)}`;
    }
    return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 3)} ${numeros.slice(
      3,
      7
    )}-${numeros.slice(7, 11)}`;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !turma ||
      diasSelecionados.length === 0 ||
      !horarioInicio ||
      !horarioFim ||
      !faixaEtariaMin
    ) {
      alert("Preencha todos os campos obrigatórios.");
      return;
    }

    const faixaEtaria = faixaEtariaMax
      ? `${faixaEtariaMin} a ${faixaEtariaMax} anos`
      : `${faixaEtariaMin}+ anos`;

    const dados = {
      turma,
      dias: diasSelecionados.join(", "),
      horario: `${horarioInicio} - ${horarioFim}`,
      faixa_etaria: faixaEtaria,
      responsavel_id: responsavelId || null,
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
          className="w-full border border-cor-primaria rounded px-3 py-2 bg-cor-fundo text-cor-texto focus:outline-none focus:ring-2 focus:ring-cor-primaria"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Dias *</label>
        <div className="flex flex-wrap gap-3">
          {diasSemana.map((dia) => (
            <label key={dia} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={diasSelecionados.includes(dia)}
                onChange={() => toggleDia(dia)}
                className="accent-cor-primaria"
              />
              <span>{dia}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium">Horário *</label>
        <div className="flex gap-4">
          <input
            type="time"
            value={horarioInicio}
            onChange={(e) => setHorarioInicio(e.target.value)}
            className="w-full border border-cor-primaria rounded px-3 py-2 bg-cor-fundo text-cor-texto focus:outline-none focus:ring-2 focus:ring-cor-primaria"
            required
          />
          <input
            type="time"
            value={horarioFim}
            onChange={(e) => setHorarioFim(e.target.value)}
            className="w-full border border-cor-primaria rounded px-3 py-2 bg-cor-fundo text-cor-texto focus:outline-none focus:ring-2 focus:ring-cor-primaria"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium">Faixa Etária *</label>
        <div className="flex gap-4">
          <input
            type="number"
            value={faixaEtariaMin}
            onChange={(e) => setFaixaEtariaMin(e.target.value)}
            placeholder="De"
            className="w-full border border-cor-primaria rounded px-3 py-2 bg-cor-fundo text-cor-texto focus:outline-none focus:ring-2 focus:ring-cor-primaria"
            required
          />
          <input
            type="number"
            value={faixaEtariaMax}
            onChange={(e) => setFaixaEtariaMax(e.target.value)}
            placeholder="Até (opcional)"
            className="w-full border border-cor-primaria rounded px-3 py-2 bg-cor-fundo text-cor-texto focus:outline-none focus:ring-2 focus:ring-cor-primaria"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium">Responsável *</label>
        <select
          value={responsavelId}
          onChange={(e) => setResponsavelId(e.target.value)}
          className="w-full border border-cor-primaria rounded px-3 py-2 bg-cor-fundo text-cor-texto focus:outline-none focus:ring-2 focus:ring-cor-primaria"
          required
        >
          <option value="">Selecione um responsável</option>
          {equipe.map((membro) => (
            <option key={membro.id} value={membro.id}>
              {membro.nome} – {formatarWhatsapp(membro.whatsapp)}
            </option>
          ))}
        </select>
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
