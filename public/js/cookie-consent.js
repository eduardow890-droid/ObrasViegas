(function configurarConsentimentoCookies() {
    "use strict";

    const chaveConsentimento = "obrasViegasConsentimentoCookies";
    const escolhaAtual = localStorage.getItem(chaveConsentimento);

    if (["aceito", "rejeitado"].includes(escolhaAtual)) return;

    const banner = document.createElement("section");
    banner.className = "cookie-consentimento";
    banner.setAttribute("role", "dialog");
    banner.setAttribute("aria-label", "Consentimento de cookies");

    const texto = document.createElement("div");
    texto.className = "cookie-consentimento-texto";

    const titulo = document.createElement("strong");
    titulo.textContent = "Cookies e privacidade";

    const descricao = document.createElement("p");
    descricao.textContent = "Usamos cookies essenciais para manter sua sessão e cookies de análise para melhorar a plataforma. Você pode aceitar ou rejeitar os cookies de análise.";

    const link = document.createElement("a");
    link.href = "/cookies";
    link.textContent = "Saiba mais";

    const acoes = document.createElement("div");
    acoes.className = "cookie-consentimento-acoes";

    const btnRejeitar = document.createElement("button");
    btnRejeitar.type = "button";
    btnRejeitar.className = "cookie-btn cookie-btn-secundario";
    btnRejeitar.textContent = "Rejeitar análise";

    const btnAceitar = document.createElement("button");
    btnAceitar.type = "button";
    btnAceitar.className = "cookie-btn cookie-btn-primario";
    btnAceitar.textContent = "Aceitar análise";

    texto.append(titulo, descricao, link);
    acoes.append(btnRejeitar, btnAceitar);
    banner.append(texto, acoes);
    document.body.appendChild(banner);

    function salvarEscolha(escolha) {
        localStorage.setItem(chaveConsentimento, escolha);
        window.dispatchEvent(new CustomEvent("obras-viegas:consentimento-cookies", {
            detail: escolha
        }));
        banner.remove();
    }

    btnRejeitar.addEventListener("click", () => salvarEscolha("rejeitado"));
    btnAceitar.addEventListener("click", () => salvarEscolha("aceito"));
})();
