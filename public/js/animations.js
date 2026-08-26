(() => {
    "use strict";

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const pageContentSelector = [
        ".feed-container > *",
        ".buscar-topo",
        ".postar-card",
        ".perfil-card",
        ".perfil-acoes",
        ".editar-card"
    ].join(", ");

    function animateElement(element, index) {
        if (element.dataset.animacaoAplicada === "true") {
            return;
        }

        element.dataset.animacaoAplicada = "true";
        element.classList.add("animacao-entrada");

        if (!prefersReducedMotion) {
            element.style.setProperty("--animacao-delay", `${Math.min(index * 55, 275)}ms`);
        }
    }

    function animateCards(container) {
        container.querySelectorAll(".post-card").forEach((card, index) => {
            animateElement(card, index);
            card.classList.add("animacao-entrada");
        });
    }

    function observeDynamicCards() {
        document.querySelectorAll("#listaPosts, #listaResultados").forEach((container) => {
            animateCards(container);

            const observer = new MutationObserver(() => {
                animateCards(container);
            });

            observer.observe(container, { childList: true });
        });
    }

    function observeFeedback() {
        document.querySelectorAll("#mensagem, #mensagemStatus").forEach((element) => {
            const observer = new MutationObserver(() => {
                if (element.textContent.trim()) {
                    element.classList.add("feedback-visivel");
                }
            });

            observer.observe(element, { childList: true, characterData: true, subtree: true });
        });
    }

    function initializeAnimations() {
        document.body.classList.add("pagina-pronta");
        document.querySelectorAll(pageContentSelector).forEach((element, index) => {
            animateElement(element, index);
        });
        observeDynamicCards();
        observeFeedback();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initializeAnimations, { once: true });
    } else {
        initializeAnimations();
    }
})();
