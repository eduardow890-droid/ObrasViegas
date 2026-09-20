// Lista base para moderação de nomes, títulos e descrições.
// A lista deve ser revisada conforme as regras da comunidade.
const PALAVRAS_PROIBIDAS = [
    "arrombado",
    "babaca",
    "bosta",
    "buceta",
    "cacete",
    "caralho",
    "corno",
    "cu",
    "cuzao",
    "desgracado",
    "fdp",
    "filho da puta",
    "foda",
    "foder",
    "fodase",
    "imbecil",
    "otario",
    "pau",
    "pica",
    "pinto",
    "porra",
    "puta",
    "putaria",
    "puto",
    "retardado",
    "vagabunda",
    "vagabundo",
    "vadia",
    "viado",
    "veado",
    "xota",
    "xoxota"
];

function normalizarTextoModeracao(valor) {
    return String(valor || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[-_]+/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

function escaparRegex(valor) {
    return valor.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function contemPalavraProibida(valor) {
    const texto = normalizarTextoModeracao(valor);

    return PALAVRAS_PROIBIDAS.some((palavra) => {
        const termo = escaparRegex(normalizarTextoModeracao(palavra));
        return new RegExp(`(^|\\s)${termo}(?=\\s|$)`, "i").test(texto);
    });
}

module.exports = {
    PALAVRAS_PROIBIDAS,
    normalizarTextoModeracao,
    contemPalavraProibida
};
