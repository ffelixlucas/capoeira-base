import { useEffect, useState } from "react";
import { listarEquipe } from "../services/equipeService";
import {
  listarDestinosWhatsapp,
  atualizarDestinoWhatsapp,
} from "../services/whatsappService";
import { toast } from "react-toastify";
import BotaoVoltarDashboard from "../components/ui/BotaoVoltarDashboard";

const TIPOS = [
  { tipo: "infantil", label: "Contato - Infantil" },
  { tipo: "juvenil", label: "Contato - Juvenil" },
  { tipo: "adulto", label: "Contato - Adulto" },
  { tipo: "outros", label: "Contato - Outros Assuntos" },
];

export default function Contatos() {
  const [membros, setMembros] = useState([]);
  const [destinos, setDestinos] = useState({});
  const [backupGlobal, setBackupGlobal] = useState("");

  useEffect(() => {
    async function carregar() {
      const equipe = await listarEquipe();
      setMembros(equipe);

      try {
        const data = await listarDestinosWhatsapp();
        setDestinos(data);

        // Se todos tiverem o mesmo backup, preenche o global
        const backups = TIPOS.map((t) => data[t.tipo]?.backup_id).filter(Boolean);
        const mesmoBackup = backups.every((id) => id === backups[0]);
        if (mesmoBackup && backups[0]) setBackupGlobal(backups[0]);
      } catch (err) {
        toast.error("Erro ao carregar destinos do WhatsApp.");
      }
    }

    carregar();
  }, []);

  async function salvar(tipo, membroId) {
    try {
      await atualizarDestinoWhatsapp(tipo, membroId);
      setDestinos((prev) => ({
        ...prev,
        [tipo]: {
          ...prev[tipo],
          id: Number(membroId),
        },
      }));
      toast.success("Contato atualizado!");
    } catch (err) {
      console.error(err);
      toast.error("Erro ao salvar contato.");
    }
  }

  async function salvarBackupGlobal(novoId) {
    try {
      await Promise.all(
        TIPOS.map(({ tipo }) =>
          atualizarDestinoWhatsapp(tipo, novoId, true)
        )
      );
      setBackupGlobal(novoId);
      toast.success("Backup atualizado para todas as turmas!");
    } catch (err) {
      toast.error("Erro ao atualizar backup.");
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
              <BotaoVoltarDashboard className="mb-4" />
        
      <h1 className="text-2xl font-bold mb-6">📞 Contatos de WhatsApp</h1>

      {TIPOS.map(({ tipo, label }) => (
        <div key={tipo} className="mb-6 border-b border-gray-200 pb-4">
          <h2 className="font-semibold text-lg mb-3">{label}</h2>

          <div>
            <label className="block text-sm font-medium mb-1">Responsável</label>
            <select
              className="w-full p-2 border rounded bg-gray-100 text-black"
              value={destinos[tipo]?.id || ""}
              onChange={(e) => salvar(tipo, e.target.value)}
            >
              <option value="">-- Selecione --</option>
              {membros.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nome} — {m.whatsapp}
                </option>
              ))}
            </select>
          </div>
        </div>
      ))}

      {/* Backup Global */}
      <div className="mt-10">
        <h2 className="text-lg font-semibold mb-2">📦 Backup Global</h2>
        <label className="block text-sm font-medium mb-1">
          Usado caso algum responsável fique inativo
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
