// src/server.js
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.route.js";
import { authenticate, authorize } from "./middlewares/auth.middleware.js";

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Rotas públicas
app.use("/auth", authRoutes);

// Rota protegida para USER e ADMIN
app.get("/dashboard", authenticate, (req, res) => {
  res.json({ message: `Bem-vindo, usuário ${req.user.id}!`, role: req.user.role });
});

// Rota protegida apenas para ADMIN
app.get("/admin", authenticate, authorize(["admin"]), (req, res) => {
  res.json({ message: "Área restrita para ADMIN" });
});

app.listen(PORT, () => {
  console.log(` Servidor rodando em http://localhost:${PORT}`);
});
