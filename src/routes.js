const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { users } = require("./users");
const { authMiddleware } = require("./middlewares/auth");
const dotenv = require("dotenv");
const router = express.Router();

module.exports = router;

// ===== Cadastro =====
router.post("/register", (req, res) => {
  const { username, password, role } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "username e password são obrigatórios" });
  }

  const exists = users.find(u => u.username === username);
  if (exists) return res.status(409).json({ message: "Usuário já existe" });

  const newUser = {
    id: users.length + 1,
    username,
    password: bcrypt.hashSync(password, 8),
    role: role === "admin" ? "admin" : "user",
  };

  users.push(newUser);
  return res.status(201).json({
    message: "Usuário cadastrado",
    user: { id: newUser.id, username: newUser.username, role: newUser.role },
  });
});

// ===== Login =====
router.post("/login", (req, res) => {
  const { username, password } = req.body;

  const user = users.find(u => u.username === username);
  if (!user) return res.status(404).json({ message: "Usuário não encontrado" });

  const ok = bcrypt.compareSync(password, user.password);
  if (!ok) return res.status(401).json({ message: "Senha inválida" });

  const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });

  return res.json({ message: "Login bem-sucedido", token });
});

// ===== Rota autenticada (qualquer usuário logado) =====
router.get("/profile", authMiddleware(), (req, res) => {
  return res.json({ message: "Perfil do usuário autenticado", user: req.user });
});

// ===== Rota restrita a admins =====
router.get("/admin", authMiddleware("admin"), (req, res) => {
  return res.json({ message: "Área admin", user: req.user });
});

module.exports = router;
