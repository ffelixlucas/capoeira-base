const repo = require("./whatsappDestinosRepository");
const db = require("../../database/connection");

async function getDestinosFormatados() {
  const destinos = await repo.listarDestinos();

  const resultado = {};
  destinos.forEach((destino) => {
    resultado[destino.horario_id] = {
      turma: destino.turma,
      dias: destino.dias,
      horario: destino.horario,
      faixa_etaria: destino.faixa_etaria,
      membro_id: destino.membro_id || null,
      membro_nome: destino.membro_nome || null,
      membro_whatsapp: destino.membro_whatsapp || null,
      backup_id: destino.backup_id || null,
      backup_nome: destino.backup_nome || null,
      backup_whatsapp: destino.backup_whatsapp || null,
    };
  });

  return resultado;
}

async function atualizarDestino(horarioId, membroId, membroBackupId = null) {
  const [rows] = await db.query(
    "SELECT id FROM whatsapp_destinos WHERE horario_id = ?",
    [horarioId]
  );

  if (rows.length > 0) {
    // Já existe destino para essa turma → atualiza
    await db.query(
      `UPDATE whatsapp_destinos 
       SET 
         membro_id = COALESCE(?, membro_id),
         membro_backup_id = COALESCE(?, membro_backup_id),
         atualizado_em = NOW()
       WHERE horario_id = ?`,
      [membroId, membroBackupId, horarioId]
    );
  } else {
    // Não existe destino ainda → insere
    await db.query(
      `INSERT INTO whatsapp_destinos (horario_id, membro_id, membro_backup_id)
       VALUES (?, ?, ?)`,
      [horarioId, membroId, membroBackupId]
    );
  }
}

module.exports = {
  getDestinosFormatados,
  atualizarDestino,
};
