const db = require("../../database/connection");
const logger = require("../../utils/logger.js");
/* -------------------------------------------------------------------------- */
/* 📋 Listar membros da equipe (multi-organização)                            */
/* -------------------------------------------------------------------------- */
async function getAllEquipe(organizacaoId) {
    try {
        if (!organizacaoId) {
            logger.warn("[equipeRepository] Tentativa de listar equipe sem organizacao_id");
            throw new Error("organizacao_id é obrigatório");
        }
        logger.debug("[equipeRepository] Listando equipe", { organizacaoId });
        const sql = `
      SELECT 
        e.id,
        e.nome,
        e.telefone,
        e.whatsapp,
        e.email,
        e.status,
        e.observacoes,
        e.funcao,
        e.criado_em,
        e.atualizado_em,
        e.organizacao_id
      FROM equipe e
      WHERE e.visivel_no_painel = 1
        AND e.organizacao_id = ?
      ORDER BY e.nome ASC
    `;
        const [rows] = await db.query(sql, [organizacaoId]);
        // 🔹 Carregar roles de todos os membros (JOIN único otimizado)
        if (rows.length > 0) {
            const ids = rows.map((m) => m.id);
            const [roles] = await db.query(`
        SELECT 
          er.equipe_id, 
          r.id AS role_id, 
          r.nome AS role_nome
        FROM equipe_roles er
        JOIN roles r ON er.role_id = r.id
        WHERE er.equipe_id IN (${ids.map(() => "?").join(",")})
          AND er.organizacao_id = ?
        `, [...ids, organizacaoId]);
            for (const membro of rows) {
                membro.roles = roles
                    .filter((r) => r.equipe_id === membro.id)
                    .map((r) => ({ id: r.role_id, nome: r.role_nome }));
            }
        }
        logger.debug("[equipeRepository] Equipe carregada com sucesso", {
            organizacaoId,
            total: rows.length,
        });
        return rows;
    }
    catch (error) {
        logger.error("[equipeRepository] Erro ao listar equipe", {
            organizacaoId,
            erro: error.message,
        });
        throw error;
    }
}
/* -------------------------------------------------------------------------- */
/* 🧱 Criar novo membro da equipe (multi-organização)                         */
/* -------------------------------------------------------------------------- */
async function createEquipe({ organizacao_id, nome, telefone, whatsapp, email, status, observacoes, senha_hash, funcao, }) {
    try {
        if (!organizacao_id)
            throw new Error("organizacao_id é obrigatório");
        const sql = `
      INSERT INTO equipe (
        organizacao_id,
        nome,
        telefone,
        whatsapp,
        email,
        status,
        observacoes,
        senha_hash,
        funcao
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
        const params = [
            organizacao_id,
            nome,
            telefone,
            whatsapp,
            email,
            status || "ativo",
            observacoes || null,
            senha_hash,
            funcao || null,
        ];
        const [result] = await db.query(sql, params);
        logger.debug("[equipeRepository] Membro criado", {
            organizacao_id,
            id: result.insertId,
            nome,
        });
        return { id: result.insertId };
    }
    catch (error) {
        logger.error("[equipeRepository] Erro ao criar membro", {
            organizacao_id,
            erro: error.message,
        });
        throw error;
    }
}
/* -------------------------------------------------------------------------- */
/* ✏️ Atualizar membro da equipe (multi-organização)                          */
/* -------------------------------------------------------------------------- */
async function updateEquipe(id, organizacaoId, dados) {
    try {
        if (!organizacaoId)
            throw new Error("organizacao_id é obrigatório");
        const campos = [];
        const valores = [];
        if (dados.nome) {
            campos.push("nome = ?");
            valores.push(dados.nome);
        }
        if (dados.telefone) {
            campos.push("telefone = ?");
            valores.push(dados.telefone);
        }
        if (dados.whatsapp) {
            campos.push("whatsapp = ?");
            valores.push(dados.whatsapp);
        }
        if (dados.email) {
            campos.push("email = ?");
            valores.push(dados.email);
        }
        if (dados.status) {
            campos.push("status = ?");
            valores.push(dados.status);
        }
        if (dados.observacoes) {
            campos.push("observacoes = ?");
            valores.push(dados.observacoes);
        }
        if (dados.senha_hash) {
            campos.push("senha_hash = ?");
            valores.push(dados.senha_hash);
        }
        if (dados.funcao) {
            campos.push("funcao = ?");
            valores.push(dados.funcao);
        }
        if (campos.length === 0) {
            logger.warn("[equipeRepository] Nenhum campo para atualizar", {
                id,
                organizacaoId,
            });
            return 0;
        }
        const sql = `
      UPDATE equipe
      SET ${campos.join(", ")}
      WHERE id = ? AND organizacao_id = ?
    `;
        valores.push(id, organizacaoId);
        const [result] = await db.query(sql, valores);
        logger.debug("[equipeRepository] Membro atualizado", {
            id,
            organizacaoId,
            afetados: result.affectedRows,
        });
        return result.affectedRows;
    }
    catch (error) {
        logger.error("[equipeRepository] Erro ao atualizar membro", {
            id,
            organizacaoId,
            erro: error.message,
        });
        throw error;
    }
}
/* -------------------------------------------------------------------------- */
/* ❌ Remover membro da equipe (multi-organização)                            */
/* -------------------------------------------------------------------------- */
async function deleteEquipe(id, organizacaoId) {
    try {
        if (!organizacaoId)
            throw new Error("organizacao_id é obrigatório");
        const sql = "DELETE FROM equipe WHERE id = ? AND organizacao_id = ?";
        const [result] = await db.query(sql, [id, organizacaoId]);
        logger.debug("[equipeRepository] Membro removido", {
            id,
            organizacaoId,
            afetados: result.affectedRows,
        });
        return result.affectedRows;
    }
    catch (error) {
        logger.error("[equipeRepository] Erro ao remover membro", {
            id,
            organizacaoId,
            erro: error.message,
        });
        throw error;
    }
}
/* -------------------------------------------------------------------------- */
/* 🔍 Buscar membro por ID (multi-organização)                                */
/* -------------------------------------------------------------------------- */
async function buscarPorId(id, organizacaoId) {
    try {
        if (!organizacaoId)
            throw new Error("organizacao_id é obrigatório");
        const sql = `
      SELECT 
        e.id,
        e.nome,
        e.email,
        e.telefone,
        e.whatsapp,
        e.status,
        e.observacoes,
        e.organizacao_id,
        e.grupo_id,
        e.funcao,
        e.senha_hash
      FROM equipe e
      WHERE e.id = ? AND e.organizacao_id = ?
      LIMIT 1
    `;
        const [rows] = await db.query(sql, [id, organizacaoId]);
        const usuario = rows[0];
        if (!usuario)
            return null;
        const [roles] = await db.query(`
      SELECT r.id, r.nome
      FROM equipe_roles er
      JOIN roles r ON er.role_id = r.id
      WHERE er.equipe_id = ? AND er.organizacao_id = ?
      `, [id, organizacaoId]);
        usuario.roles = roles || [];
        logger.debug("[equipeRepository] Membro encontrado", {
            id,
            organizacaoId,
            roles: roles?.length || 0,
        });
        return usuario;
    }
    catch (error) {
        logger.error("[equipeRepository] Erro ao buscar membro por ID", {
            id,
            organizacaoId,
            erro: error.message,
        });
        throw error;
    }
}
/* -------------------------------------------------------------------------- */
module.exports = {
    getAllEquipe,
    createEquipe,
    updateEquipe,
    deleteEquipe,
    buscarPorId,
};
