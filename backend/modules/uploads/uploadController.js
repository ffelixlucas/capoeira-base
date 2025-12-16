const admin = require("firebase-admin");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const logger = require("../../utils/logger.js");
const { processarFotoAluno } = require("./fotoService");


const upload = multer({ dest: "tmp/" });
const bucket = admin.storage().bucket(); // já configurado no server.js

exports.uploadFoto = [
  upload.single("foto"),
  async (req, res) => {
    try {
      if (!req.file)
        return res.status(400).json({ error: "Arquivo não enviado" });

      const { file } = req;
      const destino = `fotos-perfil/alunos/${Date.now()}_${file.originalname}`;

      await bucket.upload(file.path, {
        destination: destino,
        metadata: { contentType: file.mimetype },
      });

      fs.unlinkSync(file.path); // apaga o arquivo temporário

      const fileRef = bucket.file(destino);
      const [url] = await fileRef.getSignedUrl({
        action: "read",
        expires: "03-01-2030",
      });

      logger.log(`[uploadController] Foto enviada: ${destino}`);

      return res.json({ success: true, url });
    } catch (error) {
      logger.error("[uploadController] Erro no upload:", error);
      return res.status(500).json({ error: "Falha ao enviar imagem" });
    }
  },
];

// uploadController.js
exports.uploadFotoPreMatricula = [
  upload.single("foto"),
  async (req, res) => {
    try {
      const { preMatriculaId } = req.body;
      if (!req.file)
        return res.status(400).json({ error: "Arquivo não enviado" });
      if (!preMatriculaId)
        return res.status(400).json({ error: "ID da pré-matrícula ausente" });

      const { file } = req;
      const destino = `fotos-perfil/pre-matriculas/${preMatriculaId}_${Date.now()}_${file.originalname}`;

      await bucket.upload(file.path, {
        destination: destino,
        metadata: { contentType: file.mimetype },
      });
      fs.unlinkSync(file.path);

      const fileRef = bucket.file(destino);
      const [url] = await fileRef.getSignedUrl({
        action: "read",
        expires: "03-01-2030",
      });

      // salva no banco
      const db = require("../../database/connection");
      await db.execute(
        "UPDATE pre_matriculas SET foto_url = ?, data_atualizacao = NOW() WHERE id = ?",
        [url, preMatriculaId]
      );

      logger.info(
        `[uploadController] Foto de pré-matrícula atualizada (id ${preMatriculaId})`
      );
      res.json({ success: true, url });
    } catch (error) {
      logger.error("[uploadController] Erro no upload pré-matrícula:", error);
      res.status(500).json({ error: "Falha ao enviar imagem" });
    }
  },
];


exports.uploadFotoAluno = [
  upload.single("foto"),
  async (req, res) => {
    try {
      const { alunoId } = req.body;
      const usuario = req.user;

      if (!req.file) {
        return res.status(400).json({ error: "Arquivo não enviado" });
      }

      if (!alunoId) {
        return res.status(400).json({ error: "ID do aluno ausente" });
      }

      if (!usuario?.organizacao_id) {
        return res.status(403).json({ error: "Organização não identificada" });
      }

      const db = require("../../database/connection");

      const [[aluno]] = await db.execute(
        `
        SELECT a.id, a.nome, a.foto_url, o.slug AS org_slug
        FROM alunos a
        JOIN organizacoes o ON o.id = a.organizacao_id
        WHERE a.id = ? AND a.organizacao_id = ?
        `,
        [alunoId, usuario.organizacao_id]
      );

      if (!aluno) {
        return res.status(404).json({ error: "Aluno não encontrado" });
      }

      // 🔥 TODA a inteligência vai para o service
      const url = await processarFotoAluno({
        file: req.file,
        aluno,
        bucket,
      });

      // 🔹 Atualiza banco
      await db.execute(
        "UPDATE alunos SET foto_url = ?, atualizado_em = NOW() WHERE id = ?",
        [url, aluno.id]
      );

      logger.info("[uploadController] Foto do aluno atualizada via service", {
        alunoId: aluno.id,
      });

      return res.json({ success: true, url });
    } catch (error) {
      logger.error("[uploadController] Erro uploadFotoAluno:", error);
      return res.status(500).json({ error: "Falha ao enviar imagem" });
    }
  },
];
