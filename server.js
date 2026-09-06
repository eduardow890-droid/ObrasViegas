require("dotenv").config();

const express = require("express");
const path = require("path");
const session = require("express-session");
const PgSession = require("connect-pg-simple")(session);
const bcrypt = require("bcrypt");
const multer = require("multer");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const { createClient } = require("@supabase/supabase-js");

const pool = require("./database/database");

// =============================================================================
// Supabase Storage
// =============================================================================

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

async function uploadParaStorage(bucket, nomeArquivo, buffer, mimetype) {
    const { data, error } = await supabase.storage
        .from(bucket)
        .upload(nomeArquivo, buffer, {
            contentType: mimetype,
            upsert: true
        });

    if (error) {
        throw new Error(`Erro ao enviar imagem: ${error.message}`);
    }

    const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(nomeArquivo);

    return urlData.publicUrl;
}

async function removerDoStorage(bucket, nomeArquivo) {
    if (!nomeArquivo) return;

    await supabase.storage
        .from(bucket)
        .remove([nomeArquivo]);
}

function extrairNomeArquivoStorage(url) {
    if (!url) return null;
    const partes = url.split("/");
    return partes[partes.length - 1];
}

// =============================================================================
// Configuração e middlewares
// =============================================================================

const app = express();
const porta = process.env.PORT || 3000;

const diretivasCsp = helmet.contentSecurityPolicy.getDefaultDirectives();
diretivasCsp["script-src"].push("https://www.googletagmanager.com");
diretivasCsp["connect-src"] = [
    "'self'",
    "https://www.google-analytics.com",
    "https://analytics.google.com",
    "https://region1.google-analytics.com"
];
diretivasCsp["img-src"].push("blob:", "https://umbqphkbvwjbxschtfnl.supabase.co");

app.set("trust proxy", 1);

// Multer em memória (sem salvar no disco)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: filtroImagem
});

const uploadPost = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: filtroImagem
});

app.use(helmet({
    contentSecurityPolicy: {
        directives: diretivasCsp
    }
}));

app.use(session({
    store: new PgSession({
        pool,
        tableName: "sessions",
        createTableIfMissing: true
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 1000 * 60 * 60 * 24
    }
}));

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

function verificarLogin(req, res, next) {
    if (!req.session.usuarioId) {
        return res.redirect("/index.html");
    }
    res.set("Cache-Control", "no-store");
    next();
}

function verificarApi(req, res, next) {
    if (!req.session.usuarioId) {
        return res.status(401).json({
            sucesso: false,
            mensagem: "Você precisa estar logado"
        });
    }
    next();
}

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        return res.status(429).json({
            sucesso: false,
            mensagem: "Muitas tentativas de login. Tente novamente em alguns minutos."
        });
    }
});

// =============================================================================
// Rotas públicas: autenticação
// =============================================================================

app.post("/cadastrar", async (req, res) => {
    const { nome, email, senha } = req.body;

    if (!nome || !email || !senha) {
        return res.status(400).json({
            sucesso: false,
            mensagem: "Preencha todos os campos"
        });
    }

    if (nome.trim() === "" || email.trim() === "" || senha.trim() === "") {
        return res.status(400).json({
            sucesso: false,
            mensagem: "Os campos não podem ficar vazios"
        });
    }

    const senhaValida = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

    if (!senhaValida.test(senha)) {
        return res.status(400).json({
            sucesso: false,
            mensagem: "A senha deve ter pelo menos 8 caracteres, uma letra, um numero e um caractere especial"
        });
    }

    const nomeLimpo = nome.trim();
    const emailLimpo = email.trim().toLowerCase();

    try {
        const senhaHash = await bcrypt.hash(senha, 10);

        // Ajustado para inserir na tabela unificada 'contas' com o tipo 'usuario'
        await pool.query(
            `INSERT INTO contas (tipo, nome, email, senha) VALUES ('usuario', $1, $2, $3)`,
            [nomeLimpo, emailLimpo, senhaHash]
        );

        return res.status(201).json({
            sucesso: true,
            mensagem: "Usuario cadastrado"
        });
    } catch (erro) {
        if (erro.code === "23505") {
            return res.status(409).json({
                sucesso: false,
                mensagem: "Email já cadastrado"
            });
        }

        console.error("Erro ao cadastrar usuário:", erro);
        return res.status(500).json({
            sucesso: false,
            mensagem: "Erro ao cadastrar o usuário"
        });
    }
});

app.post("/cadastrar-loja", async (req, res) => {
    const { nome, email, senha, contato, bairro, categoria } = req.body;

    // Valida se todos os campos obrigatórios da loja foram preenchidos
    if (!nome || !email || !senha || !contato || !bairro || !categoria) {
        return res.status(400).json({ sucesso: false, mensagem: "Preencha todos os campos obrigatórios da loja" });
    }

    if ([nome, email, senha, contato, bairro, categoria].some(campo => campo.trim() === "")) {
        return res.status(400).json({ sucesso: false, mensagem: "Nenhum campo pode ficar em branco" });
    }

    const senhaValida = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
    if (!senhaValida.test(senha)) {
        return res.status(400).json({
            sucesso: false,
            mensagem: "A senha deve ter pelo menos 8 caracteres, uma letra, um número e um caractere especial"
        });
    }

    const nomeLimpo = nome.trim(); // Nome Comercial da Loja
    const emailLimpo = email.trim().toLowerCase();

    try {
        const senhaHash = await bcrypt.hash(senha, 10);

        // Insere na tabela 'contas' com o tipo 'loja' salvando os campos extras comerciais
        await pool.query(
            `INSERT INTO contas (tipo, nome, email, senha, contato, bairro, categoria) 
             VALUES ('loja', $1, $2, $3, $4, $5, $6)`,
            [nomeLimpo, emailLimpo, senhaHash, contato.trim(), bairro.trim(), categoria.trim()]
        );

        return res.status(201).json({ sucesso: true, mensagem: "Loja cadastrada com sucesso!" });
    } catch (erro) {
        if (erro.code === "23505") {
            return res.status(409).json({ sucesso: false, mensagem: "Email já cadastrado" });
        }
        console.error("Erro ao cadastrar loja:", erro);
        return res.status(500).json({ sucesso: false, mensagem: "Erro ao cadastrar a loja" });
    }
});

app.post("/login", loginLimiter, async (req, res) => {
    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).json({ sucesso: false, mensagem: "Informe o email e a senha." });
    }

    const emailLimpo = email.trim().toLowerCase();

    try {
        // Busca na tabela 'contas' puxando também o tipo do perfil
        const resultado = await pool.query(
            `SELECT id, nome, email, senha, tipo FROM contas WHERE email = $1`,
            [emailLimpo]
        );

        const conta = resultado.rows[0];

        if (!conta || !(await bcrypt.compare(senha, conta.senha))) {
            return res.status(401).json({ sucesso: false, mensagem: "Email ou Senha incorretos" });
        }

        req.session.regenerate((erro) => {
            if (erro) {
                console.error("Erro ao criar sessão:", erro);
                return res.status(500).json({ sucesso: false, mensagem: "Erro ao realizar login." });
            }

            // Agora guardamos o id e também o tipo de perfil que logou
            req.session.usuarioId = conta.id;
            req.session.usuarioTipo = conta.tipo; 

            return res.json({
                sucesso: true,
                mensagem: "Login realizado com sucesso",
                tipo: conta.tipo // Retorna o tipo para o front gerenciar o redirecionamento
            });
        });

    } catch (erro) {
        console.error("Erro ao realizar login:", erro);
        return res.status(500).json({ sucesso: false, mensagem: "Erro ao realizar login." });
    }
});

app.post("/logout", (req, res) => {
    req.session.destroy((erro) => {
        if (erro) {
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao Sair"
            });
        }
        return res.json({
            sucesso: true,
            mensagem: "Logout realizado"
        });
    });
});

app.get("/me", async (req, res) => {
    if (!req.session.usuarioId) {
        return res.status(401).json({ autenticado: false, mensagem: "Não autenticado" });
    }

    try {
        // Busca os dados na tabela contas incluindo as colunas específicas comerciais
        const resultado = await pool.query(
            `SELECT id, tipo, nome, email, foto, contato, bairro, categoria FROM contas WHERE id = $1`,
            [req.session.usuarioId]
        );

        const conta = resultado.rows[0];

        if (!conta) {
            return res.status(401).json({ autenticado: false, message: "Conta não encontrada" });
        }

        return res.json({ autenticado: true, usuario: conta });

    } catch (erro) {
        console.error("Erro ao buscar dados da sessão:", erro);
        return res.status(500).json({ autenticado: false, mensagem: "Erro ao buscar dados do usuário." });
    }
});

// =============================================================================
// Rotas privadas: páginas da aplicação
// =============================================================================

function enviarPaginaPrivada(nomeArquivo) {
    return (req, res) => {
        res.sendFile(path.join(__dirname, "private", nomeArquivo));
    };
}

app.get("/main", verificarLogin, enviarPaginaPrivada("main.html"));
app.get("/buscar", verificarLogin, enviarPaginaPrivada("buscar.html"));
app.get("/postar", verificarLogin, enviarPaginaPrivada("postar.html"));
app.get("/perfil", verificarLogin, enviarPaginaPrivada("perfil.html"));
app.get("/editar-post", verificarLogin, enviarPaginaPrivada("editar-post.html"));
app.get("/editar-perfil", verificarLogin, enviarPaginaPrivada("editar-perfil.html"));

// =============================================================================
// Rotas de publicações
// =============================================================================

app.post("/posts", verificarApi, uploadPost.single("foto"), async (req, res) => {
    const { tipo, titulo, bairro, descricao, whatsapp } = req.body;

    if (!tipo || !titulo || !bairro || !descricao || !whatsapp) {
        return res.status(400).json({
            sucesso: false,
            mensagem: "Preencha todos os campos"
        });
    }

    const tituloLimpo = titulo.trim();
    const bairroLimpo = bairro.trim();
    const descricaoLimpa = descricao.trim();
    const whatsappLimpo = whatsapp.trim();
    const tipoLimpo = tipo.trim();

    if (
        tituloLimpo === "" ||
        bairroLimpo === "" ||
        descricaoLimpa === "" ||
        whatsappLimpo === "" ||
        tipoLimpo === ""
    ) {
        return res.status(400).json({
            sucesso: false,
            mensagem: "Os campos não podem ficar vazios"
        });
    }

    try {
        let urlFoto = null;

        if (req.file) {
            const imagemValida = await validarImagem(req.file.buffer);

            if (!imagemValida) {
                return res.status(400).json({
                    sucesso: false,
                    mensagem: "O arquivo enviado não é uma imagem válida."
                });
            }

            const nomeArquivo = `post-${Date.now()}-${req.session.usuarioId}${extensaoPorMime(req.file.mimetype)}`;
            urlFoto = await uploadParaStorage("posts", nomeArquivo, req.file.buffer, req.file.mimetype);
        }

        // Modificado de usuario_id para conta_id
        await pool.query(
            `INSERT INTO posts (conta_id, tipo, titulo, bairro, descricao, whatsapp, foto)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [req.session.usuarioId, tipoLimpo, tituloLimpo, bairroLimpo, descricaoLimpa, whatsappLimpo, urlFoto]
        );

        return res.status(201).json({
            sucesso: true,
            mensagem: "Post publicado com sucesso"
        });

    } catch (erro) {
        console.error("Erro ao publicar post:", erro);
        return res.status(500).json({
            sucesso: false,
            mensagem: "Erro ao publicar o post"
        });
    }
});

app.get("/posts", verificarApi, async (req, res) => {
    const { busca, bairro, tipo, criador } = req.query;

    // Modificado JOIN para a tabela 'contas' trazendo também o 'tipo' e 'categoria' do criador
    let sql = `
        SELECT
            posts.id,
            posts.conta_id,
            posts.tipo,
            posts.titulo,
            posts.bairro,
            posts.descricao,
            posts.whatsapp,
            posts.foto AS foto_post,
            posts.created_at,
            contas.nome,
            contas.foto,
            contas.tipo AS tipo_criador,
            contas.categoria AS categoria_loja
        FROM posts
        INNER JOIN contas ON posts.conta_id = contas.id
        WHERE 1 = 1
    `;

    const valores = [];
    let contador = 1;

    if (busca && busca.trim() !== "") {
        sql += ` AND (posts.titulo ILIKE $${contador} OR posts.descricao ILIKE $${contador + 1} OR contas.nome ILIKE $${contador + 2})`;
        const termoBusca = `%${busca.trim()}%`;
        valores.push(termoBusca, termoBusca, termoBusca);
        contador += 3;
    }

    if (bairro && bairro.trim() !== "") {
        sql += ` AND posts.bairro = $${contador}`;
        valores.push(bairro.trim());
        contador++;
    }

    if (tipo && tipo.trim() !== "") {
        sql += ` AND posts.tipo = $${contador}`;
        valores.push(tipo.trim());
        contador++;
    }

    if (criador === "loja") {
        sql += " AND contas.tipo = 'loja'";
    }

    sql += " ORDER BY posts.created_at DESC";

    try {
        const resultado = await pool.query(sql, valores);
        return res.json({ sucesso: true, posts: resultado.rows });
    } catch (erro) {
        console.error("Erro ao buscar posts:", erro);
        return res.status(500).json({
            sucesso: false,
            mensagem: "Erro ao buscar publicações"
        });
    }
});

app.get("/posts/:id", verificarApi, async (req, res) => {
    try {
        // Modificado de usuario_id para conta_id
        const resultado = await pool.query(
            `SELECT id, conta_id, titulo, tipo, bairro, descricao, whatsapp, foto AS foto_post
             FROM posts WHERE id = $1`,
            [req.params.id]
        );

        const post = resultado.rows[0];

        if (!post) {
            return res.status(404).json({
                sucesso: false,
                mensagem: "Post não encontrado"
            });
        }

        return res.json(post);

    } catch (erro) {
        console.error("Erro ao buscar post:", erro);
        return res.status(500).json({
            sucesso: false,
            mensagem: "Erro ao buscar o post"
        });
    }
});

app.put("/posts/:id", verificarApi, async (req, res) => {
    const { titulo, tipo, bairro, descricao, whatsapp } = req.body;

    if (!titulo || !tipo || !bairro || !descricao || !whatsapp) {
        return res.status(400).json({
            sucesso: false,
            mensagem: "Preencha todos os campos."
        });
    }

    const tituloLimpo = titulo.trim();
    const tipoLimpo = tipo.trim();
    const bairroLimpo = bairro.trim();
    const descricaoLimpa = descricao.trim();
    const whatsappLimpo = whatsapp.trim();

    if (
        tituloLimpo === "" ||
        tipoLimpo === "" ||
        bairroLimpo === "" ||
        descricaoLimpa === "" ||
        whatsappLimpo === ""
    ) {
        return res.status(400).json({
            sucesso: false,
            mensagem: "Os campos não podem ficar vazios."
        });
    }

    try {
        // Modificado de usuario_id para conta_id
        const resultado = await pool.query(
            `SELECT id, conta_id FROM posts WHERE id = $1`,
            [req.params.id]
        );

        const post = resultado.rows[0];

        if (!post) {
            return res.status(404).json({
                sucesso: false,
                mensagem: "Post não encontrado."
            });
        }

        // Validação usando conta_id
        if (post.conta_id !== req.session.usuarioId) {
            return res.status(403).json({
                sucesso: false,
                mensagem: "Você não pode editar esse post."
            });
        }

        await pool.query(
            `UPDATE posts SET titulo = $1, tipo = $2, bairro = $3, descricao = $4, whatsapp = $5 WHERE id = $6`,
            [tituloLimpo, tipoLimpo, bairroLimpo, descricaoLimpa, whatsappLimpo, req.params.id]
        );

        return res.json({
            sucesso: true,
            mensagem: "Post updated com sucesso."
        });

    } catch (erro) {
        console.error("Erro ao atualizar post:", erro);
        return res.status(500).json({
            sucesso: false,
            mensagem: "Erro ao atualizar o post."
        });
    }
});

app.delete("/posts/:id", verificarApi, async (req, res) => {
    try {
        // Modificado de usuario_id para conta_id
        const resultado = await pool.query(
            `SELECT id, conta_id, foto FROM posts WHERE id = $1`,
            [req.params.id]
        );

        const post = resultado.rows[0];

        if (!post) {
            return res.status(404).json({
                sucesso: false,
                mensagem: "Post não encontrado"
            });
        }

        // Validação usando conta_id
        if (post.conta_id !== req.session.usuarioId) {
            return res.status(403).json({
                sucesso: false,
                mensagem: "Você não pode excluir esse post"
            });
        }

        if (post.foto) {
            const nomeArquivo = extrairNomeArquivoStorage(post.foto);
            await removerDoStorage("posts", nomeArquivo);
        }

        await pool.query(`DELETE FROM posts WHERE id = $1`, [req.params.id]);

        return res.json({
            sucesso: true,
            mensagem: "Post excluído com sucesso"
        });

    } catch (erro) {
        console.error("Erro ao excluir post:", erro);
        return res.status(500).json({
            sucesso: false,
            mensagem: "Erro ao excluir o post"
        });
    }
});

app.get("/carregarPosts", verificarApi, async (req, res) => {
    try {
        // Completado a rota com INNER JOIN modificado para a tabela contas
        const resultado = await pool.query(
            `SELECT 
                posts.id, 
                posts.conta_id, 
                posts.tipo, 
                posts.titulo, 
                posts.bairro,
                posts.descricao, 
                posts.whatsapp, 
                posts.foto, 
                posts.created_at, 
                contas.nome,
                contas.foto AS foto_perfil,
                contas.tipo AS tipo_criador
             FROM posts
             INNER JOIN contas ON posts.conta_id = contas.id
             WHERE posts.conta_id = $1
             ORDER BY posts.created_at DESC`,
            [req.session.usuarioId]
        );
        
        return res.json({ sucesso: true, posts: resultado.rows });
    } catch (erro) {
        console.error("Erro ao carregar posts:", erro);
        return res.status(500).json({
            sucesso: false,
            mensagem: "Erro ao carregar publicações"
        });
    }
});


// =============================================================================
// Rotas de perfil
// =============================================================================

app.put("/perfil", verificarApi, upload.single("foto"), async (req, res) => {
    try {
        const { nome, email, contato, bairro, categoria } = req.body;
        const usuarioId = req.session.usuarioId;

        if (!nome || !email) {
            return res.status(400).json({
                sucesso: false,
                mensagem: "Preencha os campos obrigatórios (nome e email)."
            });
        }

        const nomeLimpo = nome.trim();
        const emailLimpo = email.trim().toLowerCase();

        if (nomeLimpo === "" || emailLimpo === "") {
            return res.status(400).json({
                sucesso: false,
                mensagem: "Os campos de nome e email não podem ficar vazios."
            });
        }

        // Modificado para buscar da tabela 'contas' pegando a foto e o tipo de conta
        const resultUsuario = await pool.query(
            `SELECT id, foto, tipo FROM contas WHERE id = $1`,
            [usuarioId]
        );

        const conta = resultUsuario.rows[0];

        if (!conta) {
            return res.status(404).json({
                sucesso: false,
                mensagem: "Perfil não encontrado."
            });
        }

        // Se for loja, valida se os campos extras obrigatórios foram enviados
        if (conta.tipo === "loja") {
            if (!contato || !bairro || !categoria || 
                contato.trim() === "" || bairro.trim() === "" || categoria.trim() === "") {
                return res.status(400).json({
                    sucesso: false,
                    mensagem: "Para lojas, os campos contato, bairro e categoria são obrigatórios."
                });
            }
        }

        let urlFoto = conta.foto; // Mantém a foto atual por padrão

        // Se um novo arquivo foi enviado, realiza o upload e substituição no storage
        if (req.file) {
            const imagemValida = await validarImagem(req.file.buffer);

            if (!imagemValida) {
                return res.status(400).json({
                    sucesso: false,
                    mensagem: "O arquivo enviado não é uma imagem válida."
                });
            }

            const nomeArquivo = `perfil-${usuarioId}-${Date.now()}${extensaoPorMime(req.file.mimetype)}`;
            urlFoto = await uploadParaStorage("perfil", nomeArquivo, req.file.buffer, req.file.mimetype);

            // Se existia uma foto antiga, remove ela do storage para liberar espaço
            if (conta.foto) {
                const nomeAntigo = extrairNomeArquivoStorage(conta.foto);
                await removerDoStorage("perfil", nomeAntigo);
            }
        }

        // Atualização Dinâmica com base no tipo de conta
        if (conta.tipo === "loja") {
            // Atualiza campos de usuário + dados comerciais da loja
            await pool.query(
                `UPDATE contas 
                 SET nome = $1, email = $2, foto = $3, contato = $4, bairro = $5, categoria = $6 
                 WHERE id = $7`,
                [nomeLimpo, emailLimpo, urlFoto, contato.trim(), bairro.trim(), categoria.trim(), usuarioId]
            );
        } else {
            // Atualiza apenas os dados básicos de usuário comum
            await pool.query(
                `UPDATE contas SET nome = $1, email = $2, foto = $3 WHERE id = $4`,
                [nomeLimpo, emailLimpo, urlFoto, usuarioId]
            );
        }

        return res.json({
            sucesso: true,
            mensagem: "Perfil atualizado com sucesso."
        });

    } catch (erro) {
        console.error("Erro ao atualizar perfil:", erro);

        if (erro.code === "23505") {
            return res.status(409).json({
                sucesso: false,
                mensagem: "Este e-mail já está sendo utilizado por outra conta."
            });
        }

        return res.status(500).json({
            sucesso: false,
            mensagem: "Erro interno ao atualizar o perfil."
        });
    }
});


// =============================================================================
// Middlewares de erro do Multer
// =============================================================================

app.use((erro, req, res, next) => {
    if (erro instanceof multer.MulterError) {
        if (erro.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({
                sucesso: false,
                mensagem: "A imagem deve ter no máximo 5 MB."
            });
        }
        return res.status(400).json({
            sucesso: false,
            mensagem: "Erro ao enviar a imagem."
        });
    }

    if (erro.message === "Formato de imagem não permitido.") {
        return res.status(400).json({
            sucesso: false,
            mensagem: "Formato de imagem não permitido. Use JPG, PNG ou WEBP."
        });
    }

    console.error("Erro no servidor:", erro);
    return res.status(500).json({
        sucesso: false,
        mensagem: "Erro interno do servidor."
    });
});

// =============================================================================
// Funções auxiliares
// =============================================================================

function filtroImagem(req, file, callback) {
    const tiposPermitidos = ["image/jpeg", "image/png", "image/webp"];
    if (tiposPermitidos.includes(file.mimetype)) {
        callback(null, true);
    } else {
        callback(new Error("Formato de imagem não permitido."));
    }
}

async function validarImagem(buffer) {
    const { fileTypeFromBuffer } = await import("file-type");
    const tipo = await fileTypeFromBuffer(buffer);
    if (!tipo) return false;
    const tiposPermitidos = ["image/jpeg", "image/png", "image/webp"];
    return tiposPermitidos.includes(tipo.mime);
}

function extensaoPorMime(mimetype) {
    const mapa = {
        "image/jpeg": ".jpg",
        "image/png": ".png",
        "image/webp": ".webp"
    };
    return mapa[mimetype] || ".jpg";
}

// =============================================================================
// Inicialização
// =============================================================================

app.listen(porta, "0.0.0.0", () => {
    console.log(`Servidor rodando em http://localhost:${porta}`);
});
