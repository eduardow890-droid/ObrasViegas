const pool = require("../database/database");
const { uploadParaStorage, removerDoStorage, extrairNomeArquivoStorage } = require("../lib/storage");
const { validarImagem, extensaoPorMime } = require("../utils/imagem");

function normalizarTexto(valor) {
    return typeof valor === "string" ? valor.trim() : "";
}

async function obterPerfil(req, res) {
    const contaId = req.session.usuarioId;
    if (!contaId) {
        return res.status(401).json({ autenticado: false, mensagem: "Não autenticado" });
    }

    try {
        const resultado = await pool.query(
            `SELECT id, nome, email, tipo, foto, contato, bairro, categoria FROM contas WHERE id = $1`,
            [contaId]
        );

        if (resultado.rows.length === 0) {
            return res.status(404).json({ autenticado: false, mensagem: "Conta não encontrada" });
        }

        return res.json({ autenticado: true, usuario: resultado.rows[0] });
    } catch (erro) {
        console.error("Erro ao buscar perfil:", erro);
        return res.status(500).json({ autenticado: false, mensagem: "Erro ao buscar perfil." });
    }
}

async function atualizarPerfil(req, res) {
    const contaId = req.session.usuarioId;
    if (!contaId) {
        return res.status(401).json({ sucesso: false, mensagem: "Você precisa estar logado." });
    }

    const nome = normalizarTexto(req.body.nome);
    const email = normalizarTexto(req.body.email);
    const contato = normalizarTexto(req.body.contato);
    const bairro = normalizarTexto(req.body.bairro);
    const categoria = normalizarTexto(req.body.categoria);

    if (!nome || !email) {
        return res.status(400).json({ sucesso: false, mensagem: "Preencha nome e email." });
    }

    try {
        const atual = await pool.query(
            `SELECT foto, tipo FROM contas WHERE id = $1`,
            [contaId]
        );

        if (atual.rows.length === 0) {
            return res.status(404).json({ sucesso: false, mensagem: "Conta não encontrada." });
        }

        let fotoUrl = atual.rows[0].foto;
        if (req.file) {
            const valido = await validarImagem(req.file.buffer);
            if (!valido) {
                return res.status(400).json({ sucesso: false, mensagem: "Formato de imagem inválido." });
            }

            const extensao = extensaoPorMime(req.file.mimetype);
            const nomeArquivo = `perfil/${contaId}-${Date.now()}${extensao}`;
            fotoUrl = await uploadParaStorage("perfil", nomeArquivo, req.file.buffer, req.file.mimetype);

            const nomeAntigo = extrairNomeArquivoStorage(atual.rows[0].foto);
            if (nomeAntigo) {
                await removerDoStorage("perfil", nomeAntigo);
            }
        }

        const tipo = atual.rows[0].tipo;
        const dadosComerciais = tipo === "loja" ? [contato, bairro, categoria] : [null, null, null];

        await pool.query(
            `
                UPDATE contas
                SET nome = $2,
                    email = $3,
                    foto = $4,
                    contato = $5,
                    bairro = $6,
                    categoria = $7
                WHERE id = $1
            `,
            [contaId, nome, email, fotoUrl, dadosComerciais[0], dadosComerciais[1], dadosComerciais[2]]
        );

        return res.json({ sucesso: true, mensagem: "Perfil atualizado com sucesso." });
    } catch (erro) {
        console.error("Erro ao atualizar perfil:", erro);
        return res.status(500).json({ sucesso: false, mensagem: "Erro ao atualizar o perfil." });
    }
}

module.exports = { obterPerfil, atualizarPerfil };
