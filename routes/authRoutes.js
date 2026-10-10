const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { loginLimiter } = require("../middlewares/rateLimitMiddleware");
const { verificarOrigem } = require("../middlewares/csrfMiddleware");

router.post("/cadastrar", verificarOrigem, authController.cadastrar);
router.post("/cadastrar-loja", verificarOrigem, authController.cadastrarLoja);
router.post("/login", loginLimiter, authController.login);
router.post("/logout", verificarOrigem, authController.logout);
router.get("/me", authController.me);

module.exports = router;
