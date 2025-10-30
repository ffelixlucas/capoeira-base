const admin = require("firebase-admin");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const logger = require("../../utils/logger");

const upload = multer({ dest: "tmp/" });
const bucket = admin.storage().bucket(); // já configurado no server.js

exports.uploadFoto = [
  upload.single("foto"),
  async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ error: "Arquivo não enviado" });

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
        if (!req.file) return res.status(400).json({ error: "Arquivo não enviado" });
        if (!preMatriculaId) return res.status(400).json({ error: "ID da pré-matrícula ausente" });
  
        const { file } = req;
        const destino = `fotos-perfil/pre-matriculas/${preMatriculaId}_${Date.now()}_${file.originalname}`;
  
        await bucket.upload(file.path, {
          destination: destino,
          metadata: { contentType: file.mimetype },
        });
        fs.unlinkSync(file.path);
  
        const fileRef = bucket.file(destino);
        const [url] = await fileRef.getSignedUrl({ action: "read", expires: "03-01-2030" });
  
        // salva no banco
        const db = require("../../database/connection");
        await db.execute(
          "UPDATE pre_matriculas SET foto_url = ?, data_atualizacao = NOW() WHERE id = ?",
          [url, preMatriculaId]
        );
  
        logger.info(`[uploadController] Foto de pré-matrícula atualizada (id ${preMatriculaId})`);
        res.json({ success: true, url });
      } catch (error) {
        logger.error("[uploadController] Erro no upload pré-matrícula:", error);
        res.status(500).json({ error: "Falha ao enviar imagem" });
      }
    },
  ];
  