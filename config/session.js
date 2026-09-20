const session = require("express-session");
const PgSession = require("connect-pg-simple")(session);
const pool = require("../lib/database");

function configurarSession() {
    return session({
        store: new PgSession({
            pool,
            tableName: "sessions",
            createTableIfMissing: true
        }),
        secret: process.env.SESSION_SECRET || "obras-viegas-dev-secret",
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
            maxAge: 1000 * 60 * 60 * 24
        }
    });
}

module.exports = {
    configurarSession,
    configurarSessao: configurarSession
};