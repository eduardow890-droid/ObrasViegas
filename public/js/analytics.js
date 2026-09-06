(function iniciarAnalytics() {
    "use strict";

    const measurementId = "G-RT8D338WRZ";

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
})();