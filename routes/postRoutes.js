const express = require("express");
const router = express.Router();
const multer = require("multer");
const postController = require("../controllers/postController");
const { verificarApi } = require("../middlewares/authMiddleware");
const { filtroImagem } = require("../utils/imagem");

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: filtroImagem
});

router.get("/posts", verificarApi, postController.listar);
router.post("/posts", verificarApi, upload.single("foto"), postController.criar);
router.get("/posts/:id", verificarApi, postController.buscarPorId);
router.put("/posts/:id", verificarApi, postController.editar);
router.delete("/posts/:id", verificarApi, postController.excluir);
router.get("/carregarPosts", verificarApi, postController.meusPosts);

module.exports = router;