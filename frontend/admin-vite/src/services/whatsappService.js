import api from "./api";

/**
 * 🔄 Listar destinos de WhatsApp por tipo (com fallback automático)
 */
export async function listarDestinosWhatsapp() {
  const { data } = await api.get("/whatsapp-destinos");
  return data;
}

/**
 * 💾 Atualizar membro ou backup por tipo
 * @param {string} tipo - Ex: 'infantil', 'adulto'
 * @param {number} membroId
 * @param {boolean} isBackup
 */
export async function atualizarDestinoWhatsapp(tipo, membroId, isBackup = false) {
  const payload = {
    [isBackup ? "membro_backup_id" : "membro_id"]: Number(membroId),
  };

  const { data } = await api.put(`/whatsapp-destinos/${tipo}`, payload);
  return data;
}
