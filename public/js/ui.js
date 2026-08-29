// =========================================================
// UI.JS — Sistema de notificações e confirmações
// Substitui alert() e confirm() em todo o projeto
// =========================================================

// ─── TOAST ───────────────────────────────────────────────
// Uso: mostrarToast("Mensagem", "sucesso" | "erro" | "info" | "aviso")

(function () {
    "use strict";

    // Cria o container de toasts uma única vez
    function getContainer() {
        let container = document.getElementById("toastContainer");
        if (!container) {
            container = document.createElement("div");
            container.id = "toastContainer";
            container.classList.add("toast-container");
            document.body.appendChild(container);
        }
        return container;
    }

    const ICONES = {
        sucesso: "✓",
        erro:    "✕",
        info:    "i",
        aviso:   "!"
    };

    window.mostrarToast = function (mensagem, tipo = "info", duracao = 4000) {
        const container = getContainer();

        const toast = document.createElement("div");
        toast.classList.add("toast", tipo);

        const icone = document.createElement("span");
        icone.classList.add("toast-icone");
        icone.textContent = ICONES[tipo] || "i";
        icone.setAttribute("aria-hidden", "true");

        const texto = document.createElement("span");
        texto.classList.add("toast-mensagem");
        texto.textContent = mensagem;

        const fechar = document.createElement("button");
        fechar.classList.add("toast-fechar");
        fechar.textContent = "×";
        fechar.setAttribute("aria-label", "Fechar notificação");
        fechar.addEventListener("click", () => remover(toast));

        toast.appendChild(icone);
        toast.appendChild(texto);
        toast.appendChild(fechar);
        container.appendChild(toast);

        // Remove automaticamente após a duração
        const timer = setTimeout(() => remover(toast), duracao);

        // Cancela o timer se o usuário fechar manualmente
        fechar.addEventListener("click", () => clearTimeout(timer));
    };

    function remover(toast) {
        toast.classList.add("saindo");
        toast.addEventListener("animationend", () => toast.remove(), { once: true });
    }

    // ─── MODAL DE CONFIRMAÇÃO ─────────────────────────────
    // Uso: const confirmou = await confirmarAcao("Mensagem", "Texto do botão", "destrutivo" | "neutro")

    window.confirmarAcao = function (mensagem, textoBotao = "Confirmar", variante = "destrutivo") {
        return new Promise((resolve) => {

            const overlay = document.createElement("div");
            overlay.classList.add("modal-overlay");
            overlay.setAttribute("role", "dialog");
            overlay.setAttribute("aria-modal", "true");

            const box = document.createElement("div");
            box.classList.add("modal-box");
            if (variante === "neutro") box.classList.add("neutro");

            const icone = document.createElement("div");
            icone.classList.add("modal-icone");
            icone.textContent = variante === "neutro" ? "💾" : "🗑️";
            icone.setAttribute("aria-hidden", "true");

            const titulo = document.createElement("div");
            titulo.classList.add("modal-titulo");
            titulo.textContent = variante === "neutro" ? "Confirmar ação" : "Tem certeza?";

            const msg = document.createElement("div");
            msg.classList.add("modal-mensagem");
            msg.textContent = mensagem;

            const acoes = document.createElement("div");
            acoes.classList.add("modal-acoes");

            const btnCancelar = document.createElement("button");
            btnCancelar.classList.add("modal-btn-cancelar");
            btnCancelar.textContent = "Cancelar";

            const btnConfirmar = document.createElement("button");
            btnConfirmar.classList.add("modal-btn-confirmar");
            btnConfirmar.textContent = textoBotao;

            acoes.appendChild(btnCancelar);
            acoes.appendChild(btnConfirmar);

            box.appendChild(icone);
            box.appendChild(titulo);
            box.appendChild(msg);
            box.appendChild(acoes);
            overlay.appendChild(box);
            document.body.appendChild(overlay);

            // Foca no botão cancelar por padrão (mais seguro)
            btnCancelar.focus();

            function fechar(resultado) {
                overlay.remove();
                resolve(resultado);
            }

            btnConfirmar.addEventListener("click", () => fechar(true));
            btnCancelar.addEventListener("click",  () => fechar(false));

            // Fecha ao clicar fora do box
            overlay.addEventListener("click", (e) => {
                if (e.target === overlay) fechar(false);
            });

            // Fecha com Escape
            document.addEventListener("keydown", function handler(e) {
                if (e.key === "Escape") {
                    fechar(false);
                    document.removeEventListener("keydown", handler);
                }
            });
        });
    };

})();