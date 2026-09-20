const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { loginLimiter } = require("../middlewares/rateLimitMiddleware");

router.post("/cadastrar", authController.cadastrar);
router.post("/cadastrar-loja", authController.cadastrarLoja);
router.post("/login", loginLimiter, authController.login);
router.post("/logout", authController.logout);
router.get("/me", authController.me);

module.exports = router;