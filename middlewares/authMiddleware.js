function verificarLogin(req, res, next) {
    if (!req.session.usuarioId) {
        return res.redirect("/index.html");
    }
    res.set("Cache-Control", "no-store");
    next();
}

function verificarApi(req, res, next) {
    if (!req.session.usuarioId) {
        return res.status(401).json({
            sucesso: false,
            mensagem: "Você precisa estar logado"
        });
    }
    next();
}

module.exports = { verificarLogin, verificarApi };