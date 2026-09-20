const test = require("node:test");
const assert = require("node:assert/strict");

const { extrairNomeArquivoStorage } = require("../../lib/storage");

test("extrai o nome do arquivo do Storage", () => {
    assert.equal(
        extrairNomeArquivoStorage("https://storage.exemplo.com/posts/foto.jpg"),
        "foto.jpg"
    );
});

test("retorna null quando não há foto", () => {
    assert.equal(extrairNomeArquivoStorage(null), null);
    assert.equal(extrairNomeArquivoStorage(""), null);
});
