const Database =  require("better-sqlite3")

const db = new Database("database/obras.db");

db.exec(`
    CREATE TABLE IF NOT EXISTS usuarios(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    senha TEXT NOT NULL,
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
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
)
`)
module.exports = db;