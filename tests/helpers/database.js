require("dotenv").config();

const pool = require("../../database/database");

async function bancoDisponivel() {
    try {
        await pool.query("SELECT 1");
        return true;
    } catch (erro) {
        if (process.env.REQUIRE_TEST_DB === "1") throw erro;
        console.warn(`Testes de integração ignorados: banco indisponível (${erro.code || erro.message})`);
        return false;
    }
}

async function limparConta(email) {
    await pool.query("DELETE FROM contas WHERE email = $1", [email]);
}

module.exports = { pool, bancoDisponivel, limparConta };
