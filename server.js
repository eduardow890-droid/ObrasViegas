require("dotenv").config();

const express = require("express");
const path = require("path");
const session = require("express-session");
const SqliteStore = require("better-sqlite3-session-store")(session);
const bcrypt = require("bcrypt");
const multer = require("multer");
const fs = require("fs");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");

const db = require("./database/database");

// =============================================================================
// Configuração e middlewares
// =============================================================================

const app = express();
const porta = 3000;

const storage = multer.diskStorage({
    destination: path.join(__dirname, "uploads", "perfil"),
    filename: (req, file, callback) => {
        const extensao = path.extname(file.originalname);
        callback(null, `perfil-${req.session.usuarioId}${extensao}`);
    }
});

const upload = multer({ 
    storage,
      limits: {
        fileSize: 5 * 1024 * 1024
    },
    fileFilter: filtroImagem
});

const storagePosts = multer.diskStorage({

    destination: path.join(__dirname, "uploads", "posts"),

    filename: (req, file, callback) => {
        const extensao = path.extname(file.originalname);

        const nomeArquivo = `post-${Date.now()}${extensao}`;

        callback(null, nomeArquivo);
    }
});

const uploadPost = multer({
    storage: storagePosts,
        limits: {
        fileSize: 5 * 1024 * 1024
    },
    fileFilter: filtroImagem
});

app.use(helmet());

app.use(session({
    store: new SqliteStore({
        client: db,
        expired: {
            clear: true,
            intervalMs: 15 * 60 * 1000
        }
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

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
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
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 5,                    // 5 tentativas por IP nesse período
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
        db.prepare(`
            INSERT INTO usuarios (nome, email, senha)
            VALUES (?, ?, ?)
        `).run(nomeLimpo, emailLimpo, senhaHash);

        return res.status(201).json({
            sucesso: true,
            mensagem: "Usuario cadastrado"
        });
    } catch (erro) {
        if (erro.code === "SQLITE_CONSTRAINT_UNIQUE") {
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

app.post("/login", loginLimiter, async (req, res) => {
    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).json({
            sucesso: false,
            mensagem: "Informe o email e a senha."
        });
    }
    const emailLimpo = email.trim().toLowerCase();

    const usuario = db.prepare(`
        SELECT id, nome, email, senha
        FROM usuarios
        WHERE email = ?
    `).get(emailLimpo);

    if (!usuario || !(await bcrypt.compare(senha, usuario.senha))) {
        return res.status(401).json({
            sucesso: false,
            mensagem: "Email ou Senha incorretos"
        });
    }

    req.session.regenerate((erro) => {

        if (erro) {
            console.error("Erro ao criar sessão:", erro);

            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao realizar login."
            });
        }

        req.session.usuarioId = usuario.id;

        return res.json({
            sucesso: true,
            mensagem: "Login realizado com sucesso"
        });
    });
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

app.get("/me", (req, res) => {
    if (!req.session.usuarioId) {
        return res.status(401).json({
            autenticado: false,
            mensagem: "Não autenticado"
        });
    }

    const usuario = db.prepare(`
        SELECT id, nome, email, foto
        FROM usuarios
        WHERE id = ?
    `).get(req.session.usuarioId);

    if (!usuario) {
        return res.status(401).json({
            autenticado: false,
            mensagem: "Usuário não encontrado"
        });
    }

    return res.json({ autenticado: true, usuario });
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

app.post("/posts", verificarApi,uploadPost.single("foto"),async (req, res) => {
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

        if (req.file) {

    const imagemValida = await validarImagem(req.file.path);

    if (!imagemValida) {

        fs.unlinkSync(req.file.path);

        return res.status(400).json({
            sucesso: false,
            mensagem: "O arquivo enviado não é uma imagem válida."
        });
    }
}

        const caminhoFoto = req.file
        ? `/uploads/posts/${req.file.filename}`
        : null;

        db.prepare(`
            INSERT INTO posts (
                usuario_id, tipo, titulo, bairro, descricao, whatsapp, foto
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(
            req.session.usuarioId,
            tipoLimpo,
            tituloLimpo,
            bairroLimpo,
            descricaoLimpa,
            whatsappLimpo,
            caminhoFoto
        );

        return res.status(201).json({
            sucesso: true,
            mensagem: "Post publicado com sucesso"
        });
    } catch (erro) {
        console.error("Erro ao publicar post:", erro);

        if (req.file) {
            try {
                fs.unlinkSync(req.file.path);
            } catch (erroRemocao) {
                console.error("Erro ao remover arquivo órfão:", erroRemocao);
            }
        }

        return res.status(500).json({
            sucesso: false,
            mensagem: "Erro ao publicar o post"
        });
    }
});

app.get("/posts", verificarApi, (req, res) => {
    const { busca, bairro, tipo } = req.query;
  let sql = `
    SELECT
        posts.id,
        posts.usuario_id,
        posts.tipo,
        posts.titulo,
        posts.bairro,
        posts.descricao,
        posts.whatsapp,
        posts.foto AS foto_post,
        posts.created_at,
        usuarios.nome,
        usuarios.foto
    FROM posts
    INNER JOIN usuarios ON posts.usuario_id = usuarios.id
    WHERE 1 = 1
`;
    const valores = [];

    if (busca && busca.trim() !== "") {
        sql += `
            AND (
                posts.titulo LIKE ?
                OR posts.descricao LIKE ?
                OR usuarios.nome LIKE ?
            )
        `;
        const termoBusca = `%${busca.trim()}%`;
        valores.push(termoBusca, termoBusca, termoBusca);
    }

    if (bairro && bairro.trim() !== "") {
        sql += " AND posts.bairro = ?";
        valores.push(bairro.trim());
    }

    if (tipo && tipo.trim() !== "") {
        sql += " AND posts.tipo = ?";
        valores.push(tipo.trim());
    }

    sql += " ORDER BY posts.created_at DESC";

    try {
        const posts = db.prepare(sql).all(...valores);
        return res.json({ sucesso: true, posts });
    } catch (erro) {
        console.error("Erro ao buscar posts:", erro);
        return res.status(500).json({
            sucesso: false,
            mensagem: "Erro ao buscar publicações"
        });
    }
});

app.get("/posts/:id", verificarApi, (req, res) => {

    try {

        const post = db.prepare(`
            SELECT
                id,
                usuario_id,
                titulo,
                tipo,
                bairro,
                descricao,
                whatsapp,
                foto AS foto_post
            FROM posts
            WHERE id = ?
        `).get(req.params.id);

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

app.put("/posts/:id", verificarApi, (req, res) => {

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

    const post = db.prepare(`
        SELECT id, usuario_id
        FROM posts
        WHERE id = ?
    `).get(req.params.id);

    if (!post) {
        return res.status(404).json({
            sucesso: false,
            mensagem: "Post não encontrado."
        });
    }

    if (post.usuario_id !== req.session.usuarioId) {
        return res.status(403).json({
            sucesso: false,
            mensagem: "Você não pode editar esse post."
        });
    }

    try {

        db.prepare(`
            UPDATE posts
            SET titulo = ?,
                tipo = ?,
                bairro = ?,
                descricao = ?,
                whatsapp = ?
            WHERE id = ?
        `).run(
            tituloLimpo,
            tipoLimpo,
            bairroLimpo,
            descricaoLimpa,
            whatsappLimpo,
            req.params.id
        );

        return res.json({
            sucesso: true,
            mensagem: "Post atualizado com sucesso."
        });

    } catch (erro) {

        console.error("Erro ao atualizar post:", erro);

        return res.status(500).json({
            sucesso: false,
            mensagem: "Erro ao atualizar o post."
        });
    }
});

app.delete("/posts/:id", verificarApi, (req, res) => {

    const post = db.prepare(`
        SELECT id, usuario_id, foto
        FROM posts
        WHERE id = ?
    `).get(req.params.id);

    if (!post) {
        return res.status(404).json({
            sucesso: false,
            mensagem: "Post não encontrado"
        });
    }

    if (post.usuario_id !== req.session.usuarioId) {
        return res.status(403).json({
            sucesso: false,
            mensagem: "Você não pode excluir esse post"
        });
    }

    try {

        // Exclui a imagem do servidor
        if (post.foto) {

            const caminhoFoto = path.join(
                __dirname,
                post.foto.replace(/^\/uploads\//, "uploads/")
            );

            if (fs.existsSync(caminhoFoto)) {
                fs.unlinkSync(caminhoFoto);
            }
        }

        // Exclui o post do banco
        db.prepare(`
            DELETE FROM posts
            WHERE id = ?
        `).run(req.params.id);

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

app.get("/carregarPosts", verificarApi, (req, res) => {

    try {

        const posts = db.prepare(`
            SELECT
                posts.id,
                posts.usuario_id,
                posts.tipo,
                posts.titulo,
                posts.bairro,
                posts.descricao,
                posts.whatsapp,
                posts.foto,
                posts.created_at,
                usuarios.nome
            FROM posts
            INNER JOIN usuarios ON posts.usuario_id = usuarios.id
            WHERE posts.usuario_id = ?
            ORDER BY posts.created_at DESC
        `).all(req.session.usuarioId);

        return res.json({
            sucesso: true,
            posts
        });

    } catch (erro) {

        console.error("Erro ao carregar posts do usuário:", erro);

        return res.status(500).json({
            sucesso: false,
            mensagem: "Erro ao carregar suas publicações."
        });
    }
});

// =============================================================================
// Rotas de perfil
// =============================================================================

app.put("/perfil", verificarApi, upload.single("foto"), async (req, res) => {
    try {

        const { nome, email } = req.body;
        const usuarioId = req.session.usuarioId;

        // ============================================================
        // Validação dos campos
        // ============================================================

        if (!nome || !email) {
            return res.status(400).json({
                sucesso: false,
                mensagem: "Preencha todos os campos."
            });
        }

        const nomeLimpo = nome.trim();
        const emailLimpo = email.trim().toLowerCase();

        if (nomeLimpo === "" || emailLimpo === "") {
            return res.status(400).json({
                sucesso: false,
                mensagem: "Os campos não podem ficar vazios."
            });
        }

        // ============================================================
        // Busca a foto atual do usuário
        // ============================================================

        const usuario = db.prepare(`
            SELECT id, foto
            FROM usuarios
            WHERE id = ?
        `).get(usuarioId);

        if (!usuario) {
            return res.status(404).json({
                sucesso: false,
                mensagem: "Usuário não encontrado."
            });
        }

        // ============================================================
        // Validação da nova imagem
        // ============================================================

        if (req.file) {

            const imagemValida = await validarImagem(req.file.path);

            if (!imagemValida) {

                fs.unlinkSync(req.file.path);

                return res.status(400).json({
                    sucesso: false,
                    mensagem: "O arquivo enviado não é uma imagem válida."
                });
            }
        }

        // ============================================================
        // Atualização com nova foto
        // ============================================================

        if (req.file) {

            const novaFoto = `/uploads/perfil/${req.file.filename}`;

            db.prepare(`
                UPDATE usuarios
                SET nome = ?, email = ?, foto = ?
                WHERE id = ?
            `).run(
                nomeLimpo,
                emailLimpo,
                novaFoto,
                usuarioId
            );

            // ========================================================
            // Exclui a foto antiga
            // ========================================================

            if (usuario.foto) {

                const caminhoFotoAntiga = path.join(
                    __dirname,
                    usuario.foto.replace(/^\/uploads\//, "uploads/")
                );

                if (
                    fs.existsSync(caminhoFotoAntiga) &&
                    caminhoFotoAntiga !== req.file.path
                ) {
                    fs.unlinkSync(caminhoFotoAntiga);
                }
            }

        } else {

            // ========================================================
            // Atualização sem alteração da foto
            // ========================================================

            db.prepare(`
                UPDATE usuarios
                SET nome = ?, email = ?
                WHERE id = ?
            `).run(
                nomeLimpo,
                emailLimpo,
                usuarioId
            );
        }

        return res.json({
            sucesso: true,
            mensagem: "Perfil atualizado com sucesso."
        });

    } catch (erro) {

        console.error("Erro ao atualizar perfil:", erro);

        if (
            erro.code === "SQLITE_CONSTRAINT_UNIQUE" ||
            erro.message.includes("UNIQUE constraint failed: usuarios.email")
        ) {
            return res.status(409).json({
                sucesso: false,
                mensagem: "Este e-mail já está sendo utilizado por outro usuário."
            });
        }

        return res.status(500).json({
            sucesso: false,
            mensagem: "Erro interno ao atualizar o perfil."
        });
    }
});

// =============================================================================
// Configurações do MULTER
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

function filtroImagem(req, file, callback) {

    const tiposPermitidos = [
        "image/jpeg",
        "image/png",
        "image/webp"
    ];

    if (tiposPermitidos.includes(file.mimetype)) {
        callback(null, true);
    } else {
        callback(new Error("Formato de imagem não permitido."));
    }
}

async function validarImagem(caminho) {

    const { fileTypeFromFile } = await import("file-type");

    const tipo = await fileTypeFromFile(caminho);

    if (!tipo) {
        return false;
    }

    const tiposPermitidos = [
        "image/jpeg",
        "image/png",
        "image/webp"
    ];

    return tiposPermitidos.includes(tipo.mime);
}

// =============================================================================
// Inicialização
// =============================================================================

app.listen(porta, "0.0.0.0", () => {
    console.log(`Servidor rodando em http://localhost:${porta}`);
});
