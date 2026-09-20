const pool = require("../database/database");
const { uploadParaStorage, removerDoStorage, extrairNomeArquivoStorage } = require("../lib/storage");
const { validarImagem, extensaoPorMime } = require("../utils/imagem");

function normalizarTexto(valor) {
    return typeof valor === "string" ? valor.trim() : "";
}

async function listar(req, res) {
    try {
        const busca = normalizarTexto(req.query.busca);
        const bairro = normalizarTexto(req.query.bairro);
        const tipo = normalizarTexto(req.query.tipo);
        const criador = normalizarTexto(req.query.criador);

        let sql = `
            SELECT
                p.id,
                p.conta_id,
                p.tipo,
                p.titulo,
                p.bairro,
                p.descricao,
                p.whatsapp,
                p.foto AS foto_post,
                c.nome,
                c.foto,
                c.tipo AS tipo_criador,
                c.categoria AS categoria_loja,
                p.created_at
            FROM posts p
            INNER JOIN contas c ON c.id = p.conta_id
            WHERE 1 = 1
        `;
        const valores = [];

        if (busca) {
            sql += ` AND (
                LOWER(p.titulo) ILIKE $${valores.length + 1}
                OR LOWER(p.descricao) ILIKE $${valores.length + 1}
            )`;
            valores.push(`%${busca.toLowerCase()}%`);
        }

        if (bairro) {
            sql += ` AND LOWER(p.bairro) = LOWER($${valores.length + 1})`;
            valores.push(bairro);
        }

        if (tipo) {
            sql += ` AND LOWER(p.tipo) = LOWER($${valores.length + 1})`;
            valores.push(tipo);
        }

        if (criador) {
            // contas.tipo é um enum PostgreSQL; faça o cast antes de usar LOWER.
            sql += ` AND LOWER(c.tipo::text) = LOWER($${valores.length + 1})`;
            valores.push(criador);
        }

        sql += " ORDER BY p.created_at DESC";

        const resultado = await pool.query(sql, valores);
        return res.json({ sucesso: true, posts: resultado.rows });
    } catch (erro) {
        console.error("Erro ao listar posts:", erro);
        return res.status(500).json({ sucesso: false, mensagem: "Erro ao carregar posts." });
    }
}

async function criar(req, res) {
    const contaId = req.session.usuarioId;
    if (!contaId) {
        return res.status(401).json({ sucesso: false, mensagem: "Você precisa estar logado." });
    }

    const tipo = normalizarTexto(req.body.tipo);
    const titulo = normalizarTexto(req.body.titulo);
    const bairro = normalizarTexto(req.body.bairro);
    const descricao = normalizarTexto(req.body.descricao);
    const whatsapp = normalizarTexto(req.body.whatsapp).replace(/\D/g, "");

    if (!tipo || !titulo || !bairro || !descricao || !whatsapp) {
        return res.status(400).json({ sucesso: false, mensagem: "Preencha todos os campos obrigatórios." });
    }

    try {
        let fotoUrl = null;

        if (req.file) {
            const valido = await validarImagem(req.file.buffer);
            if (!valido) {
                return res.status(400).json({ sucesso: false, mensagem: "Formato de imagem inválido." });
            }

            const extensao = extensaoPorMime(req.file.mimetype);
            const nomeArquivo = `posts/${contaId}-${Date.now()}${extensao}`;
            fotoUrl = await uploadParaStorage("posts", nomeArquivo, req.file.buffer, req.file.mimetype);
        }

        const resultado = await pool.query(
            `
                INSERT INTO posts (conta_id, tipo, titulo, bairro, descricao, whatsapp, foto)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING *
            `,
            [contaId, tipo, titulo, bairro, descricao, whatsapp, fotoUrl]
        );

        return res.status(201).json({ sucesso: true, mensagem: "Post publicado com sucesso.", post: resultado.rows[0] });
    } catch (erro) {
        console.error("Erro ao criar post:", erro);
        return res.status(500).json({ sucesso: false, mensagem: "Erro ao publicar o post." });
    }
}

async function buscarPorId(req, res) {
    const contaId = req.session.usuarioId;
    if (!contaId) {
        return res.status(401).json({ sucesso: false, mensagem: "Você precisa estar logado." });
    }

    try {
        const resultado = await pool.query(
            `
                SELECT p.*, c.nome, c.foto, c.tipo AS tipo_criador, c.categoria AS categoria_loja
                FROM posts p
                INNER JOIN contas c ON c.id = p.conta_id
                WHERE p.id = $1 AND p.conta_id = $2
            `,
            [req.params.id, contaId]
        );

        if (resultado.rows.length === 0) {
            return res.status(404).json({ sucesso: false, mensagem: "Publicação não encontrada." });
        }

        return res.json({ sucesso: true, post: resultado.rows[0] });
    } catch (erro) {
        console.error("Erro ao buscar post:", erro);
        return res.status(500).json({ sucesso: false, mensagem: "Erro ao buscar publicação." });
    }
}

async function editar(req, res) {
    const contaId = req.session.usuarioId;
    if (!contaId) {
        return res.status(401).json({ sucesso: false, mensagem: "Você precisa estar logado." });
    }

    const tipo = normalizarTexto(req.body.tipo);
    const titulo = normalizarTexto(req.body.titulo);
    const bairro = normalizarTexto(req.body.bairro);
    const descricao = normalizarTexto(req.body.descricao);
    const whatsapp = normalizarTexto(req.body.whatsapp).replace(/\D/g, "");

    try {
        const existente = await pool.query(
            `SELECT id, foto FROM posts WHERE id = $1 AND conta_id = $2`,
            [req.params.id, contaId]
        );

        if (existente.rows.length === 0) {
            return res.status(404).json({ sucesso: false, mensagem: "Publicação não encontrada." });
        }

        let fotoUrl = existente.rows[0].foto;

        if (req.file) {
            const valido = await validarImagem(req.file.buffer);
            if (!valido) {
                return res.status(400).json({ sucesso: false, mensagem: "Formato de imagem inválido." });
            }

            const extensao = extensaoPorMime(req.file.mimetype);
            const nomeArquivo = `posts/${contaId}-${Date.now()}${extensao}`;
            fotoUrl = await uploadParaStorage("posts", nomeArquivo, req.file.buffer, req.file.mimetype);

            const nomeAntigo = extrairNomeArquivoStorage(existente.rows[0].foto);
            if (nomeAntigo) {
                await removerDoStorage("posts", nomeAntigo);
            }
        }

        const resultado = await pool.query(
            `
                UPDATE posts
                SET tipo = COALESCE($3, tipo), titulo = COALESCE($4, titulo), bairro = COALESCE($5, bairro),
                    descricao = COALESCE($6, descricao), whatsapp = COALESCE($7, whatsapp), foto = $8
                WHERE id = $1 AND conta_id = $2
                RETURNING *
            `,
            [req.params.id, contaId, tipo || null, titulo || null, bairro || null, descricao || null, whatsapp || null, fotoUrl]
        );

        return res.json({ sucesso: true, mensagem: "Publicação atualizada.", post: resultado.rows[0] });
    } catch (erro) {
        console.error("Erro ao editar post:", erro);
        return res.status(500).json({ sucesso: false, mensagem: "Erro ao editar publicação." });
    }
}

async function excluir(req, res) {
    const contaId = req.session.usuarioId;
    if (!contaId) {
        return res.status(401).json({ sucesso: false, mensagem: "Você precisa estar logado." });
    }

    try {
        const existente = await pool.query(
            `SELECT id, foto FROM posts WHERE id = $1 AND conta_id = $2`,
            [req.params.id, contaId]
        );

        if (existente.rows.length === 0) {
            return res.status(404).json({ sucesso: false, mensagem: "Publicação não encontrada." });
        }

        const nomeArquivo = extrairNomeArquivoStorage(existente.rows[0].foto);
        if (nomeArquivo) {
            await removerDoStorage("posts", nomeArquivo);
        }

        await pool.query(`DELETE FROM posts WHERE id = $1 AND conta_id = $2`, [req.params.id, contaId]);

        return res.json({ sucesso: true, mensagem: "Publicação removida." });
    } catch (erro) {
        console.error("Erro ao excluir post:", erro);
        return res.status(500).json({ sucesso: false, mensagem: "Erro ao excluir publicação." });
    }
}

async function meusPosts(req, res) {
    const contaId = req.session.usuarioId;
    if (!contaId) {
        return res.status(401).json({ sucesso: false, mensagem: "Você precisa estar logado." });
    }

    try {
        const resultado = await pool.query(
            `SELECT * FROM posts WHERE conta_id = $1 ORDER BY created_at DESC`,
            [contaId]
        );

        return res.json({ sucesso: true, posts: resultado.rows });
    } catch (erro) {
        console.error("Erro ao listar meus posts:", erro);
        return res.status(500).json({ sucesso: false, mensagem: "Erro ao carregar suas publicações." });
    }
}

module.exports = { listar, criar, buscarPorId, editar, excluir, meusPosts };
