const db = require("../../database/connection");

async function listarDestinos() {
  const query = `
    SELECT 
      h.id AS horario_id,
      h.turma,
      h.dias,
      h.horario,
      h.faixa_etaria,
      e1.id AS membro_id,
      e1.nome AS membro_nome,
      e1.whatsapp AS membro_whatsapp,
      e2.id AS backup_id,
      e2.nome AS backup_nome,
      e2.whatsapp AS backup_whatsapp
    FROM horarios_aula h
    LEFT JOIN whatsapp_destinos wd ON wd.horario_id = h.id
    LEFT JOIN equipe e1 ON wd.membro_id = e1.id AND e1.status = 'ativo'
    LEFT JOIN equipe e2 ON wd.membro_backup_id = e2.id AND e2.status = 'ativo'
    ORDER BY h.ordem IS NULL, h.ordem;
  `;

  const [rows] = await db.query(query);
  return rows;
}
