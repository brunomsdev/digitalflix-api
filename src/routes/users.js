const express = require("express");
const bcrypt = require("bcryptjs");
const { PrismaClient } = require("../generated/prisma");
const { authMiddleware } = require("../middlewares/auth");

const prisma = new PrismaClient();
const router = express.Router();


router.get("/", authMiddleware("admin"), async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, username: true, role: true, createdAt: true },
    });
    return res.json(users);
  } catch (err) {
    return res.status(500).json({ message: "Erro ao buscar usuários", error: err.message });
  }
});


router.get("/:id", authMiddleware(), async (req, res) => {
  try {
    const { id } = req.params;

    
    if (req.user.role !== "admin" && req.user.id !== id) {
      return res.status(403).json({ message: "Acesso negado" });
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, username: true, role: true, createdAt: true },
    });

    if (!user) return res.status(404).json({ message: "Usuário não encontrado" });

    return res.json(user);
  } catch (err) {
    return res.status(500).json({ message: "Erro ao buscar usuário", error: err.message });
  }
});


router.put("/:id/password", authMiddleware(), async (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.body;

    if (!password) return res.status(400).json({ message: "Nova senha é obrigatória" });

    if (req.user.role !== "admin" && req.user.id !== id) {
      return res.status(403).json({ message: "Acesso negado" });
    }

    const hashed = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { id },
      data: { password: hashed },
    });

    return res.json({ message: "Senha atualizada com sucesso" });
  } catch (err) {
    return res.status(500).json({ message: "Erro ao atualizar senha", error: err.message });
  }
});


router.delete("/:id", authMiddleware("admin"), async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.user.delete({ where: { id } });

    return res.json({ message: "Usuário removido com sucesso" });
  } catch (err) {
    return res.status(500).json({ message: "Erro ao deletar usuário", error: err.message });
  }
});

module.exports = router;
