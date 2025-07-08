import { useEffect, useState } from "react";
import { listarEquipe } from "../services/equipeService";
import { listarHorarios } from "../services/horariosService";
import {
  listarDestinosWhatsapp,
  atualizarDestinoWhatsapp,
} from "../services/whatsappService";
import { toast } from "react-toastify";

export default function Contatos() {
  const [membros, setMembros] = useState([]);
  const [turmas, setTurmas] = useState([]);
  const [destinos, setDestinos] = useState({});
  const [backupGlobal, setBackupGlobal] = useState("");

  useEffect(() => {
    async function carregar() {
      try {
        const [equipe, horarios, destinoRes] = await Promise.all([
          listarEquipe(),
          listarHorarios(),
          listarDestinosWhatsapp(),
        ]);

        setMembros(equipe);
        setTurmas(horarios);
        setDestinos(destinoRes.destinos || {});
        if (destinoRes.backup_id) setBackupGlobal(destinoRes.backup_id);
      } catch (err) {
        toast.error("Erro ao carregar dados.");
      }
    }

    carregar();
  }, []);

  async function salvar(horarioId, membroId) {
    try {
      await atualizarDestinoWhatsapp(horarioId, membroId);
      setDestinos((prev) => ({
        ...prev,
        [horarioId]: {
          ...prev[horarioId],
          id: Number(membroId),
        },
      }));
      toast.success("Responsável atualizado!");
    } catch (err) {
      toast.error("Erro ao salvar contato.");
    }
  }

  async function salvarBackupGlobal(id) {
    try {
      await atualizarDestinoWhatsapp("backup", id, true);
      setBackupGlobal(id);
      toast.success("Backup global atualizado!");
    } catch (err) {
      toast.error("Erro ao salvar backup.");
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">📞 Contatos de WhatsApp</h1>

      {turmas.map((turma) => (
        <div key={turma.id} className="mb-6 border-b border-gray-200 pb-4">
          <h2 className="font-semibold text-lg mb-3">
            WhatsApp – {turma.turma}
          </h2>

          <select
            className="w-full p-2 border rounded bg-gray-100 text-black"
            value={destinos[turma.id]?.id || ""}
            onChange={(e) => salvar(turma.id, e.target.value)}
          >
            <option value="">-- Selecione --</option>
            {membros.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nome} — {m.whatsapp}
              </option>
            ))}
          </select>
        </div>
      ))}

      <div className="mt-10">
        <h2 className="text-lg font-semibold mb-2">📦 Backup Global</h2>
        <label className="block text-sm font-medium mb-1">
          Usado caso o responsável da turma esteja inativo
        </label>
        <select
          className="w-full p-2 border rounded bg-gray-100 text-black"
          value={backupGlobal}
          onChange={(e) => salvarBackupGlobal(e.target.value)}
        >
          <option value="">-- Nenhum --</option>
          {membros.map((m) => (
            <option key={m.id} value={m.id}>
              {m.nome} — {m.whatsapp}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
