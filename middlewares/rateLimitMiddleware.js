const rateLimit = require("express-rate-limit");

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        return res.status(429).json({
            sucesso: false,
            mensagem: "Muitas tentativas de login. Tente novamente em alguns minutos."
        });
    }
});

module.exports = { loginLimiter };