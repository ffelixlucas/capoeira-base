require("dotenv").config();
const db = require("../../database/connection");
const logger = require("../../utils/logger");

(async () => {
  try {

    console.log("🚀 Cron limpeza inscrições pendentes iniciado...");

    // Buscar IDs das inscrições que serão deletadas
    const [rows] = await db.execute(
      `SELECT id, nome, email, cpf 
       FROM inscricoes_evento 
       WHERE status = 'pendente' 
       AND date_of_expiration < NOW()`
    );

    if (rows.length === 0) {
      console.log("✅ Nenhuma inscrição pendente expirada encontrada.");
    } else {

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

      console.log(`🗑️ ${result.affectedRows} inscrições expiradas foram removidas.`);
    }

    // =====================================
    // 🔄 Expiração automática pedidos Loja
    // =====================================

    const [pedidosExpirados] = await db.execute(
      `UPDATE pedidos
       SET status = 'cancelado',
           status_financeiro = 'expirado'
       WHERE status = 'aberto'
         AND status_financeiro = 'pendente'
         AND criado_em < NOW() - INTERVAL 30 MINUTE`
    );

    if (pedidosExpirados.affectedRows > 0) {
      logger.log(
        `🛒 ${pedidosExpirados.affectedRows} pedidos da loja expirados automaticamente.`
      );
    } else {
      logger.log("🛒 Nenhum pedido da loja para expirar.");
    }

    process.exit(0);

  } catch (error) {
    console.error("❌ Erro ao limpar inscrições pendentes:", error);
    process.exit(1);
  }
})();