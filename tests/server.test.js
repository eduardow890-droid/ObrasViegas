const test = require("node:test");
const assert = require("node:assert/strict");
const http = require("node:http");
const { once } = require("node:events");
const bcrypt = require("bcrypt");

const app = require("../server");
const pool = require("../database/database");
const { bancoDisponivel } = require("./helpers/database");

let disponibilidade;

async function exigirBanco(t) {
    if (disponibilidade === undefined) disponibilidade = await bancoDisponivel();
    if (!disponibilidade) {
        t.skip("banco de teste indisponível");
        return false;
    }
    return true;
}

async function iniciarServidor() {
    const server = app.listen(0, "127.0.0.1");
    await once(server, "listening");
    return server;
}

function fazerRequisicao(server, caminho, opcoes = {}) {
    return new Promise((resolve, reject) => {
        const porta = server.address().port;
        const metodo = opcoes.method || "GET";
        const corpo = opcoes.body || null;
        const cabecalhos = {
            ...(opcoes.headers || {})
        };

        if (corpo !== null && !cabecalhos["Content-Type"]) {
            cabecalhos["Content-Type"] = "application/json";
        }

        const req = http.request(
            {
                host: "127.0.0.1",
                port: porta,
                path: caminho,
                method: metodo,
                headers: cabecalhos,
                agent: false
            },
            (res) => {
                let body = "";
                res.setEncoding("utf8");
                res.on("data", (chunk) => {
                    body += chunk;
                });
                res.on("end", () => {
                    resolve({
                        statusCode: res.statusCode,
                        headers: res.headers,
                        body
                    });
                });
            }
        );

        req.on("error", reject);

        if (corpo !== null) {
            req.write(corpo);
        }

        req.end();
    });
}

function extrairCookies(headers) {
    const cookies = headers["set-cookie"] || [];
    return Array.isArray(cookies) ? cookies.map((cookie) => cookie.split(";")[0]).join("; ") : "";
}

test("as páginas legais respondem com sucesso", async (t) => {
    if (!(await exigirBanco(t))) return;
    const server = await iniciarServidor();
    t.after(() => server.close());

    const resposta = await fazerRequisicao(server, "/termos");

    assert.equal(resposta.statusCode, 200);
    assert.ok(resposta.body.includes("Termos") || resposta.body.includes("termos"));
});

test("a rota protegida redireciona quando não autenticado", async (t) => {
    if (!(await exigirBanco(t))) return;
    const server = await iniciarServidor();
    t.after(() => server.close());

    const resposta = await fazerRequisicao(server, "/main");

    assert.equal(resposta.statusCode, 302);
    assert.equal(resposta.headers.location, "/index.html");
});

test("o login cria sessão e permite acesso ao perfil autenticado", async (t) => {
    if (!(await exigirBanco(t))) return;

    const server = await iniciarServidor();
    t.after(() => server.close());

    const email = `login.${Date.now()}@teste.local`;
    const senha = "Senha123!";
    const senhaHash = await bcrypt.hash(senha, 10);

    await pool.query(
        `INSERT INTO contas (tipo, nome, email, senha) VALUES ('usuario', 'Teste Login', $1, $2)`,
        [email, senhaHash]
    );

    t.after(async () => {
        await pool.query(`DELETE FROM contas WHERE email = $1`, [email]);
    });

    const respostaLogin = await fazerRequisicao(server, "/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, senha })
    });

    assert.equal(respostaLogin.statusCode, 200, respostaLogin.body);

    const cookieHeader = extrairCookies(respostaLogin.headers);
    assert.match(cookieHeader, /(?:connect\.sid|sid)=/i, "Esperava cookie de sessão no login");

    const respostaPerfil = await fazerRequisicao(server, "/me", {
        headers: {
            Cookie: cookieHeader
        }
    });

    assert.equal(respostaPerfil.statusCode, 200, respostaPerfil.body);

    const dadosPerfil = JSON.parse(respostaPerfil.body);
    assert.equal(dadosPerfil.autenticado, true);
    assert.equal(dadosPerfil.usuario.email, email);
    assert.equal(dadosPerfil.usuario.tipo, "usuario");
});

test.after(async () => {
    if (disponibilidade === false) await pool.end();
});
