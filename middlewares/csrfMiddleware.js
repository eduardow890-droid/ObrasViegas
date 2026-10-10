function origensPermitidas(req) {
    const configurada = process.env.APP_ORIGIN
        ? process.env.APP_ORIGIN.split(",").map((origem) => origem.trim()).filter(Boolean)
        : [];

    if (configurada.length > 0) return configurada;

    const host = req.get("host");
    return host ? [`${req.protocol}://${host}`] : [];
}

function origemDaRequisicao(req) {
    const origin = req.get("origin");
    if (origin) return origin;

    const referer = req.get("referer");
    if (!referer) return null;

    try {
        return new URL(referer).origin;
    } catch {
        return "";
    }
}

function verificarOrigem(req, res, next) {
    const origem = origemDaRequisicao(req);

    if (!origem) {
        if (process.env.NODE_ENV === "production") {
            return res.status(403).json({
                sucesso: false,
                mensagem: "Origem da requisição não informada."
            });
        }

        return next();
    }

    if (!origensPermitidas(req).includes(origem)) {
        return res.status(403).json({
            sucesso: false,
            mensagem: "Origem da requisição não autorizada."
        });
    }

    return next();
}

module.exports = { verificarOrigem };
