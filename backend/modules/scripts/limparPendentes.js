require("dotenv").config();
const db = require("../../database/connection");
const logger = require("../../utils/logger");

(async () => {
  try {
    // Buscar IDs das inscrições que serão deletadas
    const [rows] = await db.execute(
      `SELECT id, nome, email, cpf 
       FROM inscricoes_evento 
       WHERE status = 'pendente' 
       AND date_of_expiration < NOW()`
    );

    if (rows.length === 0) {
      logger.log("✅ Nenhuma inscrição pendente expirada encontrada.");
      return process.exit(0);
    }

    // Mostrar quais serão deletadas
    logger.log(`🔎 Encontradas ${rows.length} inscrições expiradas:`);
    rows.forEach((r) => {
      logger.log(` - ID: ${r.id} | Nome: ${r.nome} | CPF: ${r.cpf} | Email: ${r.email}`);
    });

    // Deletar as inscrições
    const [result] = await db.execute(
      `DELETE FROM inscricoes_evento 
       WHERE status = 'pendente' 
       AND date_of_expiration < NOW()`
    );

    logger.log(`🗑️ ${result.affectedRows} inscrições pendentes expiradas foram deletadas.`);
    process.exit(0);
  } catch (error) {
    logger.error("❌ Erro ao limpar inscrições pendentes:", error);
    process.exit(1);
  }
})();
