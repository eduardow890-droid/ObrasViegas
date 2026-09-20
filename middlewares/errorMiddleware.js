const multer = require("multer");

function errorMiddleware(erro, req, res, next) {
    if (erro instanceof multer.MulterError) {
        if (erro.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({
                sucesso: false,
                mensagem: "A imagem deve ter no máximo 5 MB."
            });
        }
        return res.status(400).json({
            sucesso: false,
            mensagem: "Erro ao enviar a imagem."
        });
    }

    if (erro.message === "Formato de imagem não permitido.") {
        return res.status(400).json({
            sucesso: false,
            mensagem: "Formato de imagem não permitido. Use JPG, PNG ou WEBP."
        });
    }

    console.error("Erro no servidor:", erro);
    return res.status(500).json({
        sucesso: false,
        mensagem: "Erro interno do servidor."
    });
}

module.exports = { errorMiddleware };