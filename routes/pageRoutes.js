const express = require("express");
const path = require("path");
const router = express.Router();
const { verificarLogin } = require("../middlewares/authMiddleware");

function enviarPaginaPrivada(nomeArquivo) {
    return (req, res) => {
        res.sendFile(path.join(__dirname, "..", "private", nomeArquivo));
    };
}

router.get("/main", verificarLogin, enviarPaginaPrivada("main.html"));
router.get("/buscar", verificarLogin, enviarPaginaPrivada("buscar.html"));
router.get("/postar", verificarLogin, enviarPaginaPrivada("postar.html"));
router.get("/perfil", verificarLogin, enviarPaginaPrivada("perfil.html"));
router.get("/editar-post", verificarLogin, enviarPaginaPrivada("editar-post.html"));
router.get("/editar-perfil", verificarLogin, enviarPaginaPrivada("editar-perfil.html"));

module.exports = router;