const { validarCadastro, validarCadastroLoja, validarLogin } = require("../validators/authValidator");
const authService = require("../services/authService");

async function cadastrar(req, res) {
    const validacao = validarCadastro(req.body);
    if (!validacao.valido) {
        return res.status(400).json({ sucesso: false, mensagem: validacao.mensagem });
    }

    try {
        await authService.criarUsuario(validacao.dados);
        return res.status(201).json({ sucesso: true, mensagem: "Usuario cadastrado" });
    } catch (erro) {
        if (erro.code === "23505") {
            return res.status(409).json({ sucesso: false, mensagem: "Email já cadastrado" });
        }
        console.error("Erro ao cadastrar usuário:", erro);
        return res.status(500).json({ sucesso: false, mensagem: "Erro ao cadastrar o usuário" });
    }
}

async function cadastrarLoja(req, res) {
    const validacao = validarCadastroLoja(req.body);
    if (!validacao.valido) {
        return res.status(400).json({ sucesso: false, mensagem: validacao.mensagem });
    }

    try {
        await authService.criarLoja(validacao.dados);
        return res.status(201).json({ sucesso: true, mensagem: "Loja cadastrada com sucesso!" });
    } catch (erro) {
        if (erro.code === "23505") {
            return res.status(409).json({ sucesso: false, mensagem: "Email já cadastrado" });
        }
        console.error("Erro ao cadastrar loja:", erro);
        return res.status(500).json({ sucesso: false, mensagem: "Erro ao cadastrar a loja" });
    }
}

async function login(req, res) {
    const validacao = validarLogin(req.body);
    if (!validacao.valido) {
        return res.status(400).json({ sucesso: false, mensagem: validacao.mensagem });
    }

    try {
        const conta = await authService.autenticar(validacao.dados);

        if (!conta) {
            return res.status(401).json({ sucesso: false, mensagem: "Email ou Senha incorretos" });
        }

        req.session.regenerate((erro) => {
            if (erro) {
                console.error("Erro ao criar sessão:", erro);
                return res.status(500).json({ sucesso: false, mensagem: "Erro ao realizar login." });
            }
            req.session.usuarioId = conta.id;
            req.session.usuarioTipo = conta.tipo;
            return res.json({
                sucesso: true,
                mensagem: "Login realizado com sucesso",
                tipo: conta.tipo
            });
        });
    } catch (erro) {
        console.error("Erro ao realizar login:", erro);
        return res.status(500).json({ sucesso: false, mensagem: "Erro ao realizar login." });
    }
}

function logout(req, res) {
    req.session.destroy((erro) => {
        if (erro) {
            return res.status(500).json({ sucesso: false, mensagem: "Erro ao Sair" });
        }
        return res.json({ sucesso: true, mensagem: "Logout realizado" });
    });
}

async function me(req, res) {
    if (!req.session.usuarioId) {
        return res.status(401).json({ autenticado: false, mensagem: "Não autenticado" });
    }

    try {
        const conta = await authService.buscarContaPorId(req.session.usuarioId);
        if (!conta) {
            return res.status(401).json({ autenticado: false, mensagem: "Conta não encontrada" });
        }
        return res.json({ autenticado: true, usuario: conta });
    } catch (erro) {
        console.error("Erro ao buscar dados da sessão:", erro);
        return res.status(500).json({ autenticado: false, mensagem: "Erro ao buscar dados do usuário." });
    }
}

module.exports = { cadastrar, cadastrarLoja, login, logout, me };