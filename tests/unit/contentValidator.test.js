const test = require("node:test");
const assert = require("node:assert/strict");

const {
    contemPalavraProibida,
    normalizarTextoModeracao
} = require("../../validators/contentValidator");

test("detecta palavrão ignorando maiúsculas e acentos", () => {
    assert.equal(contemPalavraProibida("CARALHO"), true);
    assert.equal(contemPalavraProibida("filho-da-puta"), true);
});

test("detecta palavras compostas e variações de separador", () => {
    assert.equal(contemPalavraProibida("Esse cara é fdp"), true);
    assert.equal(contemPalavraProibida("x_o_t_a"), false);
    assert.equal(contemPalavraProibida("filho_da_puta"), true);
});

test("não bloqueia palavras que apenas contêm o termo", () => {
    assert.equal(contemPalavraProibida("caralhona"), false);
    assert.equal(contemPalavraProibida("computador"), false);
});

test("normaliza acentos e espaços", () => {
    assert.equal(normalizarTextoModeracao("  Otário  "), "otario");
});
