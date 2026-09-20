const express = require("express");
const multer = require("multer");
const router = express.Router();
const perfilController = require("../controllers/perfilController");
const { verificarApi } = require("../middlewares/authMiddleware");
const { filtroImagem } = require("../utils/imagem");

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: filtroImagem
});

// A página HTML usa GET /perfil. A API de consulta fica em /api/perfil
// para não haver colisão entre a página privada e o endpoint JSON.
router.get("/api/perfil", verificarApi, perfilController.obterPerfil);
router.put("/perfil", verificarApi, upload.single("foto"), perfilController.atualizarPerfil);

module.exports = router;
