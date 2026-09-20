(function prepararAnalytics() {
    "use strict";

    const chaveConsentimento = "obrasViegasConsentimentoCookies";
    const measurementId = "G-RT8D338WRZ";

    function iniciarAnalytics() {
        if (window.__obrasViegasAnalyticsIniciado) return;
        window.__obrasViegasAnalyticsIniciado = true;

        window.dataLayer = window.dataLayer || [];
        window.gtag = function gtag() {
            window.dataLayer.push(arguments);
        };

        window.gtag("js", new Date());
        window.gtag("config", measurementId);

        const script = document.createElement("script");
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
        document.head.appendChild(script);
    }

    if (localStorage.getItem(chaveConsentimento) === "aceito") {
        iniciarAnalytics();
    }

    window.addEventListener("obras-viegas:consentimento-cookies", (evento) => {
        if (evento.detail === "aceito") iniciarAnalytics();
    });
})();
