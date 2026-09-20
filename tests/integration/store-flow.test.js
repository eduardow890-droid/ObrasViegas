const test = require("node:test");
const assert = require("node:assert/strict");

const app = require("../../server");
const { iniciarServidor, json, cookiesDaResposta } = require("../helpers/http");
const { pool, bancoDisponivel, limparConta } = require("../helpers/database");

let disponibilidade;

async function podeTestar() {
    if (disponibilidade === undefined) disponibilidade = await bancoDisponivel();
    return disponibilidade;
}

test("fluxo completo de loja: cadastro, login, perfil comercial e filtro de lojas", async (t) => {
    if (!(await podeTestar())) return t.skip("banco de teste indisponível");
    const server = await iniciarServidor(app);
    t.after(() => server.close());

    const email = `teste.loja.${Date.now()}@teste.local`;
    const senha = "Senha123!";
    t.after(async () => limparConta(email));

    const cadastro = await json(server, "/cadastrar-loja", {
        method: "POST",
        body: {
            nome: "Loja Teste",
            email,
            senha,
            contato: "21988887777",
            bairro: "Viegas",
            categoria: "Materiais de construção"
        }
    });
    assert.equal(cadastro.statusCode, 201, cadastro.body);

    const login = await json(server, "/login", {
        method: "POST",
        body: { email, senha }
    });
    assert.equal(login.statusCode, 200, login.body);
    assert.equal(login.json().tipo, "loja");
    const cookie = cookiesDaResposta(login.headers);

    const me = await json(server, "/me", { headers: { Cookie: cookie } });
    assert.equal(me.statusCode, 200, me.body);
    assert.equal(me.json().usuario.tipo, "loja");
    assert.equal(me.json().usuario.categoria, "Materiais de construção");

    const criar = await json(server, "/posts", {
        method: "POST",
        headers: { Cookie: cookie },
        body: {
            tipo: "servico",
            titulo: "Entrega de materiais",
            bairro: "Viegas",
            descricao: "Materiais para obras",
            whatsapp: "21988887777"
        }
    });
    assert.equal(criar.statusCode, 201, criar.body);

    const lojas = await json(server, "/posts?criador=loja", { headers: { Cookie: cookie } });
    assert.equal(lojas.statusCode, 200, lojas.body);
    assert.equal(lojas.json().posts.some((post) => post.tipo_criador === "loja"), true);
});

test.after(async () => {
    if (disponibilidade === false) await pool.end();
});
