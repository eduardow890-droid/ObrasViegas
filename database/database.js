const Database = require("better-sqlite3");

const path = require("path");

const caminhoBanco = path.join(__dirname, "obras.db");

const db = new Database(caminhoBanco);

db.pragma("foreign_keys = ON");


db.exec(`
    CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        senha TEXT NOT NULL,
        foto TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
`);


db.exec(`
    CREATE TABLE IF NOT EXISTS posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        usuario_id INTEGER NOT NULL,
        tipo TEXT NOT NULL,
        titulo TEXT NOT NULL,
        bairro TEXT NOT NULL,
        descricao TEXT NOT NULL,
        whatsapp TEXT NOT NULL,
        foto TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,

        FOREIGN KEY (usuario_id)
            REFERENCES usuarios(id)
    )
`);


db.exec(`
    CREATE INDEX IF NOT EXISTS idx_posts_usuario_id
    ON posts(usuario_id)
`);


db.exec(`
    CREATE INDEX IF NOT EXISTS idx_posts_created_at
    ON posts(created_at DESC)
`);


module.exports = db;