function filtroImagem(req, file, callback) {
    const tiposPermitidos = ["image/jpeg", "image/png", "image/webp"];
    if (tiposPermitidos.includes(file.mimetype)) {
        callback(null, true);
    } else {
        callback(new Error("Formato de imagem não permitido."));
    }
}

async function validarImagem(buffer) {
    const { fileTypeFromBuffer } = await import("file-type");
    const tipo = await fileTypeFromBuffer(buffer);
    if (!tipo) return false;
    const tiposPermitidos = ["image/jpeg", "image/png", "image/webp"];
    return tiposPermitidos.includes(tipo.mime);
}

function extensaoPorMime(mimetype) {
    const mapa = {
        "image/jpeg": ".jpg",
        "image/png": ".png",
        "image/webp": ".webp"
    };
    return mapa[mimetype] || ".jpg";
}

module.exports = { filtroImagem, validarImagem, extensaoPorMime };