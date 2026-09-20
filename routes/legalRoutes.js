const express = require("express");
const path = require("path");
const router = express.Router();

function enviarPaginaLegal(nomeArquivo) {
    return (req, res) => {
        res.sendFile(path.join(__dirname, "..", "public", "legal", nomeArquivo));
    };
}

router.get("/termos", enviarPaginaLegal("termos.html"));
router.get("/privacidade", enviarPaginaLegal("privacidade.html"));
router.get("/conteudo", enviarPaginaLegal("conteudo.html"));
router.get("/isencao", enviarPaginaLegal("isencao.html"));
router.get("/cookies", enviarPaginaLegal("cookies.html"));

module.exports = router;