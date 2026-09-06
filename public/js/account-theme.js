(async function aplicarTemaDaConta() {
    try {
        const resposta = await fetch("/me");
        if (!resposta.ok) return;

        const dados = await resposta.json();
        if (dados.autenticado && dados.usuario?.tipo === "loja") {
            document.body.classList.add("loja-premium");
        }
    } catch (erro) {
        console.warn("Não foi possível carregar o tema da conta:", erro);
    }
})();
