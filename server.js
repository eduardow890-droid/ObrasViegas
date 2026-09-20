require("dotenv").config();

const express = require("express");
const path = require("path");

const { configurarHelmet } = require("./config/security");
const { configurarSession } = require("./config/session");
const { errorMiddleware } = require("./middlewares/errorMiddleware");

const authRoutes = require("./routes/authRoutes");
const postRoutes = require("./routes/postRoutes");
const perfilRoutes = require("./routes/perfilRoutes");
const pageRoutes = require("./routes/pageRoutes");
const legalRoutes = require("./routes/legalRoutes");

const app = express();
const porta = process.env.PORT || 3000;

app.set("trust proxy", 1);

// Middlewares globais
app.use(configurarHelmet());
app.use(configurarSession());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Rotas
app.use("/", legalRoutes);
app.use("/", authRoutes);
app.use("/", postRoutes);
app.use("/", perfilRoutes);
app.use("/", pageRoutes);

// Tratamento de erros (sempre por último)
app.use(errorMiddleware);

if (require.main === module) {
    app.listen(porta, "0.0.0.0", () => {
        console.log(`Servidor rodando em http://localhost:${porta}`);
    });
}

module.exports = app;