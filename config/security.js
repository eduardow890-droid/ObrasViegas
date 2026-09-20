const helmet = require('helmet');

function configurarHelmet(){
    const diretivasCsp = helmet.contentSecurityPolicy.getDefaultDirectives();
    diretivasCsp["script-src"].push("https://www.googletagmanager.com");
    diretivasCsp["connect-src"] = [
        "'self'",
    "https://www.google-analytics.com",
    "https://analytics.google.com",
    "https://region1.google-analytics.com"
];
diretivasCsp["img-src"].push("blob:", "https://umbqphkbvwjbxschtfnl.supabase.co");

return helmet({
    contentSecurityPolicy: {
        directives: diretivasCsp
    }
});
    }

module.exports = {
    configurarHelmet
};