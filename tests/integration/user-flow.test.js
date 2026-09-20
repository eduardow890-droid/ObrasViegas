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

test("fluxo completo de usuário: cadastro, login, post, edição, exclusão e logout", async (t) => {
    if (!(await podeTestar())) return t.skip("banco de teste indisponível");
    const server = await iniciarServidor(app);
    t.after(() => server.close());

    const email = `teste.usuario.${Date.now()}@teste.local`;
    const senha = "Senha123!";
    let cookie = "";

    t.after(async () => {
        await limparConta(email);
    });

    const cadastro = await json(server, "/cadastrar", {
        method: "POST",
        body: { nome: "Usuário de Teste", email, senha }
    });
    assert.equal(cadastro.statusCode, 201, cadastro.body);

    const login = await json(server, "/login", {
        method: "POST",
        body: { email, senha }
    });
    assert.equal(login.statusCode, 200, login.body);
    cookie = cookiesDaResposta(login.headers);
    assert.match(cookie, /connect\.sid=/i);

    const me = await json(server, "/me", { headers: { Cookie: cookie } });
    assert.equal(me.statusCode, 200, me.body);
    assert.equal(me.json().usuario.email, email);

    const paginaPrincipal = await json(server, "/main", { headers: { Cookie: cookie } });
    assert.equal(paginaPrincipal.statusCode, 200);
    assert.match(paginaPrincipal.body, /main/i);

    const paginaPerfil = await json(server, "/perfil", { headers: { Cookie: cookie } });
    assert.equal(paginaPerfil.statusCode, 200);
    assert.match(paginaPerfil.body, /perfil/i);

    const criar = await json(server, "/posts", {
        method: "POST",
        headers: { Cookie: cookie },
        body: {
            tipo: "servico",
            titulo: "Pintura residencial",
            bairro: "Centro",
            descricao: "Faço pintura de casas",
            whatsapp: "(21) 99999-9999"
        }
    });
    assert.equal(criar.statusCode, 201, criar.body);
    const postId = criar.json().post.id;
    assert.equal(criar.json().post.whatsapp, "21999999999");

    const lista = await json(server, "/posts?busca=pintura&bairro=Centro&tipo=servico", {
        headers: { Cookie: cookie }
    });
    assert.equal(lista.statusCode, 200, lista.body);
    assert.equal(lista.json().posts.some((post) => post.id === postId), true);

    const meusPosts = await json(server, "/carregarPosts", { headers: { Cookie: cookie } });
    assert.equal(meusPosts.statusCode, 200, meusPosts.body);
    assert.equal(meusPosts.json().posts.length, 1);

    const editar = await json(server, `/posts/${postId}`, {
        method: "PUT",
        headers: { Cookie: cookie },
        body: { titulo: "Pintura residencial atualizada" }
    });
    assert.equal(editar.statusCode, 200, editar.body);
    assert.equal(editar.json().post.titulo, "Pintura residencial atualizada");

    const excluir = await json(server, `/posts/${postId}`, {
        method: "DELETE",
        headers: { Cookie: cookie }
    });
    assert.equal(excluir.statusCode, 200, excluir.body);

    const logout = await json(server, "/logout", {
        method: "POST",
        headers: { Cookie: cookie }
    });
    assert.equal(logout.statusCode, 200, logout.body);

    const depoisLogout = await json(server, "/me", { headers: { Cookie: cookie } });
    assert.equal(depoisLogout.statusCode, 401, depoisLogout.body);
});

test("rotas protegidas recusam acesso sem sessão", async (t) => {
    if (!(await podeTestar())) return t.skip("banco de teste indisponível");
    const server = await iniciarServidor(app);
    t.after(() => server.close());

    for (const rota of ["/posts", "/carregarPosts", "/api/perfil"]) {
        const resposta = await json(server, rota);
        assert.equal(resposta.statusCode, 401, `${rota}: ${resposta.body}`);
    }
});

test.after(async () => {
    if (disponibilidade === false) await pool.end();
});
