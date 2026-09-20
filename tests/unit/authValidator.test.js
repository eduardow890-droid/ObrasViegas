const test = require("node:test");
const assert = require("node:assert/strict");

const {
    validarCadastro,
    validarCadastroLoja,
    validarLogin
} = require("../../validators/authValidator");

test("valida cadastro de usuário e normaliza nome e email", () => {
    const resultado = validarCadastro({
        nome: "  Ana  ",
        email: " ANA@EXEMPLO.COM ",
        senha: "Senha123!"
    });

    assert.equal(resultado.valido, true);
    assert.deepEqual(resultado.dados, {
        nome: "Ana",
        email: "ana@exemplo.com",
        senha: "Senha123!"
    });
});

test("rejeita cadastro com campos vazios", () => {
    assert.equal(validarCadastro({ nome: "", email: "a@b.com", senha: "Senha123!" }).valido, false);
    assert.equal(validarCadastro({ nome: "Ana", email: " ", senha: "Senha123!" }).valido, false);
});

test("rejeita senha sem os requisitos mínimos", () => {
    const resultado = validarCadastro({ nome: "Ana", email: "ana@b.com", senha: "abcdefgh" });
    assert.equal(resultado.valido, false);
    assert.match(resultado.mensagem, /8 caracteres/);
});

test("valida cadastro de loja e normaliza dados comerciais", () => {
    const resultado = validarCadastroLoja({
        nome: " Loja Central ",
        email: " LOJA@EXEMPLO.COM ",
        senha: "Senha123!",
        contato: "21999999999",
        bairro: " Centro ",
        categoria: " Construção "
    });

    assert.equal(resultado.valido, true);
    assert.equal(resultado.dados.email, "loja@exemplo.com");
    assert.equal(resultado.dados.bairro, "Centro");
    assert.equal(resultado.dados.categoria, "Construção");
});

test("exige os campos comerciais da loja", () => {
    const resultado = validarCadastroLoja({
        nome: "Loja", email: "loja@b.com", senha: "Senha123!",
        contato: "", bairro: "Centro", categoria: "Construção"
    });
    assert.equal(resultado.valido, false);
});

test("valida login e normaliza email", () => {
    const resultado = validarLogin({ email: " USUARIO@EXEMPLO.COM ", senha: "Senha123!" });
    assert.deepEqual(resultado, {
        valido: true,
        dados: { email: "usuario@exemplo.com", senha: "Senha123!" }
    });
});

test("rejeita login sem email ou senha", () => {
    assert.equal(validarLogin({ email: "", senha: "x" }).valido, false);
    assert.equal(validarLogin({ email: "a@b.com", senha: "" }).valido, false);
});
