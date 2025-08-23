import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes.js";

dotenv.config();
const app = express();

app.use(express.json());

// rotas de autenticação
app.use("/auth", authRoutes);

app.get("/", (req, res) => {
  res.json({ message: "API rodando" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
