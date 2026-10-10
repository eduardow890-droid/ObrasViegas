const bcrypt = require("bcrypt");
const pool = require("../lib/database");

async function criarUsuario({ nome, email, senha, termosVersao }) {
    const senhaHash = await bcrypt.hash(senha, 10);
    await pool.query(
        `INSERT INTO contas (tipo, nome, email, senha, termos_versao_aceita, termos_aceitos_em)
         VALUES ('usuario', $1, $2, $3, $4, CURRENT_TIMESTAMP)`,
        [nome, email, senhaHash, termosVersao]
    );
}

async function criarLoja({ nome, email, senha, contato, bairro, categoria, termosVersao }) {
    const senhaHash = await bcrypt.hash(senha, 10);
    await pool.query(
        `INSERT INTO contas (tipo, nome, email, senha, contato, bairro, categoria,
                            termos_versao_aceita, termos_aceitos_em)
         VALUES ('loja', $1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)`,
        [nome, email, senhaHash, contato, bairro, categoria, termosVersao]
    );
}

async function autenticar({ email, senha }) {
    const resultado = await pool.query(
        `SELECT id, nome, email, senha, tipo FROM contas WHERE email = $1`,
        [email]
    );
    const conta = resultado.rows[0];
    if (!conta) return null;

    const senhaCorreta = await bcrypt.compare(senha, conta.senha);
    if (!senhaCorreta) return null;

    return conta;
}

async function buscarContaPorId(id) {
    const resultado = await pool.query(
        `SELECT id, tipo, nome, email, foto, contato, bairro, categoria FROM contas WHERE id = $1`,
        [id]
    );
    return resultado.rows[0];
}

module.exports = { criarUsuario, criarLoja, autenticar, buscarContaPorId };
