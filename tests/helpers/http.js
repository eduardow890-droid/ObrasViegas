const http = require("node:http");
const { once } = require("node:events");

async function iniciarServidor(app) {
    const server = app.listen(0, "127.0.0.1");
    await once(server, "listening");
    return server;
}

function cookiesDaResposta(headers) {
    const cookies = headers["set-cookie"] || [];
    return Array.isArray(cookies)
        ? cookies.map((cookie) => cookie.split(";")[0]).join("; ")
        : "";
}

function requisicao(server, caminho, opcoes = {}) {
    return new Promise((resolve, reject) => {
        const corpo = opcoes.body ?? null;
        const headers = { ...(opcoes.headers || {}) };

        if (corpo !== null && !headers["Content-Type"]) {
            headers["Content-Type"] = "application/json";
        }

        const req = http.request({
            host: "127.0.0.1",
            port: server.address().port,
            path: caminho,
            method: opcoes.method || "GET",
            headers,
            agent: false
        }, (res) => {
            let body = "";
            res.setEncoding("utf8");
            res.on("data", (chunk) => { body += chunk; });
            res.on("end", () => resolve({
                statusCode: res.statusCode,
                headers: res.headers,
                body,
                json() {
                    return JSON.parse(body);
                }
            }));
        });

        req.on("error", reject);
        if (corpo !== null) req.write(corpo);
        req.end();
    });
}

async function json(server, caminho, opcoes = {}) {
    const headers = { ...(opcoes.headers || {}) };
    const body = opcoes.body === undefined ? undefined : JSON.stringify(opcoes.body);
    const resposta = await requisicao(server, caminho, { ...opcoes, headers, body });
    return resposta;
}

module.exports = { iniciarServidor, requisicao, json, cookiesDaResposta };
