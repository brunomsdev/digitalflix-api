const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { authMiddleware } = require("../middlewares/auth"); // ✅ usa o middleware corrigido
const { PrismaClient } = require("@prisma/client");
const dotenv = require("dotenv");

dotenv.config();

const prisma = new PrismaClient();
const router = express.Router();

// 📌 Registro de usuário
router.post("/register", async (req, res) => {
  try {
    const { username, password, role } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "username e password são obrigatórios" });
    }

    // Verifica se já existe
    const exists = await prisma.user.findUnique({ where: { username } });
    if (exists) return res.status(409).json({ message: "Usuário já existe" });

    // Criptografa senha
    const hashedPassword = bcrypt.hashSync(password, 8);

    // Cria novo usuário
    const newUser = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        role: role === "admin" ? "admin" : "user", // apenas admin ou user
      },
      select: { id: true, username: true, role: true }, // não retorna a senha
    });

    return res.status(201).json({
      message: "Usuário cadastrado",
      user: newUser,
    });
  } catch (err) {
    return res.status(500).json({ message: "Erro ao registrar usuário", error: err.message });
  }
});

// 📌 Login
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) return res.status(404).json({ message: "Usuário não encontrado" });

    const ok = bcrypt.compareSync(password, user.password);
    if (!ok) return res.status(401).json({ message: "Senha inválida" });

    // Gera token JWT
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.json({ message: "Login bem-sucedido", token });
  } catch (err) {
    return res.status(500).json({ message: "Erro ao fazer login", error: err.message });
  }
});


router.get("/profile", authMiddleware(), async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.sub }, // ⚡ importante: agora o `sub` vem do JWT
      select: { id: true, username: true, role: true, createdAt: true },
    });
    return res.json({ message: "Perfil do usuário autenticado", user });
  } catch (err) {
    return res.status(500).json({ message: "Erro ao buscar perfil", error: err.message });
  }
});


router.get("/admin", authMiddleware("admin"), (req, res) => {
  return res.json({ message: "Área admin", user: req.user });
});

module.exports = router;
