// 🎯 Repository - Pré-Matrículas Públicas
// Responsável por acessar o banco e registrar novas pré-matrículas
const db = require("../../../database/connection");
const logger = require("../../../utils/logger.js");
/**
 * Verifica se já existe uma pré-matrícula com o mesmo CPF
 */
async function verificarCpfExistente(cpf, organizacao_id) {
    try {
        const [rows] = await db.execute("SELECT id FROM pre_matriculas WHERE cpf = ? AND organizacao_id = ? LIMIT 1", [cpf.replace(/\D/g, ""), organizacao_id]);
        const existe = rows.length > 0;
        if (existe) {
            logger.warn(`[preMatriculasRepository] CPF duplicado detectado: ${cpf} (org ${organizacao_id})`);
        }
        return existe;
    }
    catch (err) {
        logger.error("[preMatriculasRepository] Erro ao verificar CPF existente:", err.message);
        throw err;
    }
}
/**
 * Verifica se já existe um aluno ativo com o mesmo CPF
 */
async function verificarCpfEmAlunos(cpf, organizacao_id) {
    try {
        const [rows] = await db.execute("SELECT id FROM alunos WHERE cpf = ? AND organizacao_id = ? LIMIT 1", [cpf.replace(/\D/g, ""), organizacao_id]);
        const existe = rows.length > 0;
        if (existe) {
            logger.warn(`[preMatriculasRepository] CPF já cadastrado em alunos: ${cpf} (org ${organizacao_id})`);
        }
        return existe;
    }
    catch (err) {
        logger.error("[preMatriculasRepository] Erro ao verificar CPF em alunos:", err.message);
        throw err;
    }
}
/**
 * Cria uma nova pré-matrícula
 * @param {Object} dados - dados do formulário público
 * @returns {number} id da nova pré-matrícula
 */
async function criarPreMatricula(dados) {
    try {
        const sql = `
  INSERT INTO pre_matriculas (
    organizacao_id,
    nome,
    apelido,
    nascimento,
    cpf,
    email,
    telefone_aluno,
    telefone_responsavel,
    nome_responsavel,
    responsavel_documento,
    responsavel_parentesco,
    endereco,
    ja_treinou,
    grupo_origem,
    categoria_id,
    graduacao_id,
    observacoes_medicas,
    autorizacao_imagem,
    aceite_lgpd,
    foto_url
  )
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`;
        const params = [
            dados.organizacao_id,
            dados.nome,
            dados.apelido || null,
            dados.nascimento,
            dados.cpf,
            dados.email,
            dados.telefone_aluno,
            dados.telefone_responsavel,
            dados.nome_responsavel,
            dados.responsavel_documento,
            dados.responsavel_parentesco,
            dados.endereco,
            dados.ja_treinou,
            dados.grupo_origem,
            dados.categoria_id,
            dados.graduacao_id,
            dados.observacoes_medicas,
            dados.autorizacao_imagem,
            dados.aceite_lgpd,
            dados.foto_url,
        ];
        logger.debug("[preMatriculasRepository] SQL →", sql);
        logger.debug("[preMatriculasRepository] Params →", params);
        const [result] = await db.execute(sql, params);
        logger.info("[preMatriculasRepository] Pré-matrícula criada com sucesso", {
            id: result.insertId,
            nome: dados.nome,
            apelido: dados.apelido,
        });
        return result.insertId;
    }
    catch (err) {
        logger.error("[preMatriculasRepository] Erro ao criar pré-matrícula:", err.message);
        throw err;
    }
}
/**
 * Busca todas as pré-matrículas pendentes (usado no painel admin)
 */
/**
 * Busca todas as pré-matrículas pendentes (usado no painel admin)
 */
async function listarPendentes(organizacaoId) {
    try {
        const sql = `
      SELECT 
        pm.id,
        pm.nome,
        pm.apelido,
        pm.nascimento,
        pm.cpf,
        pm.email,
        pm.telefone_aluno,
        pm.telefone_responsavel,
        pm.ja_treinou,
        pm.grupo_origem,
        pm.observacoes_medicas,
        pm.endereco,
        pm.foto_url,
        pm.status,
        pm.criado_em,
        g.nome AS graduacao_nome,
        c.nome AS categoria_nome
      FROM pre_matriculas pm
      LEFT JOIN graduacoes g ON pm.graduacao_id = g.id
      LEFT JOIN categorias c ON pm.categoria_id = c.id
      WHERE pm.status = 'pendente'
        AND pm.organizacao_id = ?
      ORDER BY pm.criado_em DESC
    `;
        const [rows] = await db.execute(sql, [organizacaoId]);
        logger.debug(`[preMatriculasRepository] org ${organizacaoId} - ${rows.length} pré-matrículas pendentes encontradas.`);
        if (rows.length > 0) {
            logger.debug("[preMatriculasRepository] Exemplo de registro:", rows[0]);
        }
        return rows;
    }
    catch (err) {
        logger.error(`[preMatriculasRepository] Erro ao listar pendentes (org ${organizacaoId}):`, err.message);
        throw err;
    }
}
/**
 * Atualiza status da pré-matrícula (aprovada, rejeitada, etc.)
 */
async function atualizarStatus(id, novoStatus, organizacaoId) {
    try {
        const [result] = await db.execute(`
      UPDATE pre_matriculas 
      SET status = ?, atualizado_em = NOW() 
      WHERE id = ? AND organizacao_id = ?

      `, [novoStatus, id, organizacaoId]);
        if (result.affectedRows === 0) {
            logger.warn(`[preMatriculasRepository] Nenhum registro atualizado (id ${id}, org ${organizacaoId})`);
            throw new Error("Pré-matrícula não encontrada para esta organização.");
        }
        logger.info(`[preMatriculasRepository] Status atualizado → ${novoStatus} (ID ${id}, org ${organizacaoId})`);
    }
    catch (err) {
        logger.error("[preMatriculasRepository] Erro ao atualizar status:", err.message);
        throw err;
    }
}
/**
 * Busca informações básicas da organização (nome, nome_fantasia e grupo)
 * Usado em e-mails e formulários públicos
 */
async function buscarGrupoPorOrganizacaoId(organizacaoId) {
    try {
        const [rows] = await db.execute("SELECT nome, nome_fantasia, grupo FROM organizacoes WHERE id = ?", [organizacaoId]);
        if (rows.length > 0) {
            logger.debug(`[preMatriculasRepository] org ${organizacaoId} - dados da organização encontrados`);
            return rows[0];
        }
        else {
            logger.warn(`[preMatriculasRepository] org ${organizacaoId} - organização não encontrada`);
            return null;
        }
    }
    catch (err) {
        logger.error(`[preMatriculasRepository] Erro ao buscar dados da organização (id ${organizacaoId}):`, err.message);
        throw err;
    }
}
/**
 * Remove uma pré-matrícula específica da organização
 * @param {number} id - ID da pré-matrícula
 * @param {number} organizacao_id - ID da organização
 * @returns {boolean} - true se removida com sucesso
 */
async function deletar(id, organizacao_id) {
    try {
        const [result] = await db.execute("DELETE FROM pre_matriculas WHERE id = ? AND organizacao_id = ?", [id, organizacao_id]);
        if (result.affectedRows > 0) {
            logger.info(`[preMatriculasRepository] Pré-matrícula ${id} removida com sucesso (org ${organizacao_id})`);
            return true;
        }
        else {
            logger.warn(`[preMatriculasRepository] Nenhuma pré-matrícula removida (id ${id}, org ${organizacao_id})`);
            return false;
        }
    }
    catch (err) {
        logger.error(`[preMatriculasRepository] Erro ao deletar pré-matrícula ${id}:`, err.message);
        throw err;
    }
}
/**
 * 🔎 Busca uma pré-matrícula específica por ID e organização
 * Agora retorna também nomes da categoria e graduação
 */
async function buscarPorId(id, organizacao_id) {
    try {
        const sql = `
      SELECT 
        pm.*,
        c.nome AS categoria_nome,
        g.nome AS graduacao_nome
      FROM pre_matriculas pm
      LEFT JOIN categorias c ON pm.categoria_id = c.id
      LEFT JOIN graduacoes g ON pm.graduacao_id = g.id
      WHERE pm.id = ? AND pm.organizacao_id = ?
      LIMIT 1
    `;
        const [rows] = await db.execute(sql, [id, organizacao_id]);
        if (rows.length > 0) {
            logger.debug(`[preMatriculasRepository] org ${organizacao_id} - pré-matrícula encontrada (id ${id})`);
            return rows[0];
        }
        else {
            logger.warn(`[preMatriculasRepository] org ${organizacao_id} - pré-matrícula não encontrada (id ${id})`);
            return null;
        }
    }
    catch (err) {
        logger.error(`[preMatriculasRepository] Erro ao buscar pré-matrícula (id ${id}, org ${organizacao_id}): ${err.message}`);
        throw err;
    }
}
module.exports = {
    criarPreMatricula,
    listarPendentes,
    atualizarStatus,
    buscarGrupoPorOrganizacaoId,
    verificarCpfExistente,
    verificarCpfEmAlunos,
    deletar,
    buscarPorId,
};
