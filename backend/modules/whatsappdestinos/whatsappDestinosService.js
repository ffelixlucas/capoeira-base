const repo = require("./whatsappDestinosRepository");

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
module.exports = {
  getDestinosFormatados,
  atualizarDestino,
};
