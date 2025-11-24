const bucket = require("../../config/firebase");
const { v4: uuidv4 } = require("uuid");
const galeriaRepository = require("./galeriaRepository");
const logger = require("../../utils/logger.js");
async function processarUpload(imagem, titulo = null, criadoPor = null, legenda = null) {
    const totalItens = await galeriaRepository.contarTotalItens();
    if (totalItens >= 20) {
        throw new Error("Limite de 20 itens atingido. Exclua um para continuar.");
    }
    const nomeArquivo = `galeria/${uuidv4()}-${imagem.originalname}`;
    const file = bucket.file(nomeArquivo);
    try {
        // ✅ Upload rápido e direto
        await file.save(imagem.buffer, {
            metadata: {
                contentType: imagem.mimetype,
            },
        });
        const url = `https://storage.googleapis.com/${bucket.name}/${nomeArquivo}`;
        const id = await galeriaRepository.salvarImagem(url, titulo, criadoPor, legenda);
        const novaImagem = await galeriaRepository.buscarPorId(id);
        return novaImagem;
    }
    catch (error) {
        logger.error("Erro no upload direto:", error);
        throw error;
    }
}
async function obterTodasImagens() {
    return await galeriaRepository.buscarTodasImagens();
}
async function atualizarOrdemGaleria(lista) {
    if (!Array.isArray(lista) || lista.length === 0) {
        throw new Error("Lista de ordem inválida");
    }
    for (const item of lista) {
        item.id = Number(item.id);
        item.ordem = Number(item.ordem);
        if (isNaN(item.id) || isNaN(item.ordem)) {
            throw new Error("ID ou ordem inválido");
        }
    }
    return await galeriaRepository.atualizarOrdem(lista);
}
async function removerImagemPorId(id) {
    const imagem = await galeriaRepository.buscarPorId(id);
    if (!imagem) {
        throw new Error("Imagem não encontrada");
    }
    const url = imagem.imagem_url;
    const caminhoArquivo = decodeURIComponent(new URL(url).pathname.replace(/^\/[^/]+\//, ""));
    await bucket.file(caminhoArquivo).delete();
    await galeriaRepository.excluir(id);
}
async function atualizarLegenda(id, legenda) {
    const imagem = await galeriaRepository.buscarPorId(id);
    if (!imagem) {
        throw new Error("Imagem não encontrada.");
    }
    return await galeriaRepository.atualizarLegenda(id, legenda);
}
module.exports = {
    processarUpload,
    atualizarLegenda,
    obterTodasImagens,
    atualizarOrdemGaleria,
    removerImagemPorId,
};
