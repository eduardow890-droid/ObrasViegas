const { contemPalavraProibida } = require("./contentValidator");

const LIMITES = {
    nomeUsuario: 80,
    nomeLoja: 100,
    email: 254,
    senhaBytes: 72,
    contato: 20,
    bairro: 60
};

const CATEGORIAS_LOJA = new Set([
    "Alimentação",
    "Roupas",
    "Serviços",
    "Mercado",
    "Construção",
    "Outros"
]);

function resultadoInvalido(mensagem) {
    return { valido: false, mensagem };
}

function ehTexto(valor) {
    return typeof valor === "string";
}

function contemCaractereControle(valor) {
    return /[\u0000-\u001F\u007F]/.test(valor);
}

function validarTexto(valor, campo, maximo, minimo = 1) {
    if (!ehTexto(valor)) {
        return resultadoInvalido(`O campo ${campo} deve ser um texto.`);
    }

    const texto = valor.trim();

    if (!texto) {
        return resultadoInvalido(`O campo ${campo} não pode ficar vazio.`);
    }

    if (contemCaractereControle(texto)) {
        return resultadoInvalido(`O campo ${campo} contém caracteres inválidos.`);
    }

    if (texto.length < minimo) {
        return resultadoInvalido(`O campo ${campo} deve ter pelo menos ${minimo} caracteres.`);
    }

    if (texto.length > maximo) {
        return resultadoInvalido(`O campo ${campo} não pode ter mais de ${maximo} caracteres.`);
    }

    return { valido: true, valor: texto };
}

function validarEmail(valor) {
    const validacao = validarTexto(valor, "email", LIMITES.email);
    if (!validacao.valido) return validacao;

    const email = validacao.valor.toLowerCase();
    const formatoEmail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    if (!formatoEmail.test(email) || email.includes("..")) {
        return resultadoInvalido("Informe um email válido.");
    }

    return { valido: true, valor: email };
}

function validarSenha(valor, exigirComplexidade = true) {
    if (!ehTexto(valor)) {
        return resultadoInvalido("A senha deve ser um texto.");
    }

    if (!valor || valor.trim() === "") {
        return resultadoInvalido("A senha não pode ficar vazia.");
    }

    if (contemCaractereControle(valor)) {
        return resultadoInvalido("A senha contém caracteres inválidos.");
    }

    if (Buffer.byteLength(valor, "utf8") > LIMITES.senhaBytes) {
        return resultadoInvalido(`A senha não pode ultrapassar ${LIMITES.senhaBytes} bytes.`);
    }

    if (exigirComplexidade) {
        const senhaValida = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

        if (!senhaValida.test(valor)) {
            return resultadoInvalido(
                "A senha deve ter pelo menos 8 caracteres, uma letra, um número e um caractere especial."
            );
        }
    }

    return { valido: true, valor };
}

function validarNome(valor, campo, maximo) {
    const validacao = validarTexto(valor, campo, maximo, 2);
    if (!validacao.valido) return validacao;

    if (contemPalavraProibida(validacao.valor)) {
        return resultadoInvalido(`O campo ${campo} contém linguagem não permitida.`);
    }

    return validacao;
}

function validarCadastro(entrada = {}) {
    const { nome, email, senha } = entrada || {};

    const nomeValidado = validarNome(nome, "nome", LIMITES.nomeUsuario);
    if (!nomeValidado.valido) return nomeValidado;

    const emailValidado = validarEmail(email);
    if (!emailValidado.valido) return emailValidado;

    const senhaValidada = validarSenha(senha);
    if (!senhaValidada.valido) return senhaValidada;

    return {
        valido: true,
        dados: {
            nome: nomeValidado.valor,
            email: emailValidado.valor,
            senha: senhaValidada.valor
        }
    };
}

function validarCadastroLoja(entrada = {}) {
    const { nome, email, senha, contato, bairro, categoria } = entrada || {};

    const nomeValidado = validarNome(nome, "nome da loja", LIMITES.nomeLoja);
    if (!nomeValidado.valido) return nomeValidado;

    const emailValidado = validarEmail(email);
    if (!emailValidado.valido) return emailValidado;

    const senhaValidada = validarSenha(senha);
    if (!senhaValidada.valido) return senhaValidada;

    const contatoValidado = validarTexto(contato, "contato", LIMITES.contato, 10);
    if (!contatoValidado.valido) return contatoValidado;

    if (!/^[\d\s()+-]+$/.test(contatoValidado.valor)) {
        return resultadoInvalido("O contato deve conter apenas números e formatação de telefone válida.");
    }

    const contatoNumeros = contatoValidado.valor.replace(/\D/g, "");
    if (![10, 11].includes(contatoNumeros.length)) {
        return resultadoInvalido("O contato deve ter 10 ou 11 dígitos com DDD.");
    }

    const bairroValidado = validarTexto(bairro, "bairro", LIMITES.bairro, 2);
    if (!bairroValidado.valido) return bairroValidado;

    if (!ehTexto(categoria) || !CATEGORIAS_LOJA.has(categoria.trim())) {
        return resultadoInvalido("Selecione uma categoria de loja válida.");
    }

    return {
        valido: true,
        dados: {
            nome: nomeValidado.valor,
            email: emailValidado.valor,
            senha: senhaValidada.valor,
            contato: contatoNumeros,
            bairro: bairroValidado.valor,
            categoria: categoria.trim()
        }
    };
}

function validarLogin(entrada = {}) {
    const { email, senha } = entrada || {};

    const emailValidado = validarEmail(email);
    if (!emailValidado.valido) return emailValidado;

    const senhaValidada = validarSenha(senha, false);
    if (!senhaValidada.valido) return senhaValidada;

    return {
        valido: true,
        dados: {
            email: emailValidado.valor,
            senha: senhaValidada.valor
        }
    };
}

module.exports = { validarCadastro, validarCadastroLoja, validarLogin };
