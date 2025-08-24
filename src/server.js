const express = require("express");
const dotenv = require("dotenv");
const router = require("./routes");

dotenv.config();

const app = express();
app.use(express.json());

app.get("/", (_, res) => res.json({ ok: true, up: new Date().toISOString() }));
app.use("/api", router);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
