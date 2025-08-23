// src/controllers/auth.controller.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { users } from "../data/users.js";

const hashedPassword = await bcrypt.hash(password, 10);
const SECRET = "seusegredoaqui"; // depois coloque em variáveis de ambiente

const validPassword = await bcrypt.compare(password, user.password);
if (!validPassword) return res.status(401).json({ message: "Credenciais inválidas" });




// Login
export const login = (req, res) => {
  const { username, password } = req.body;

  const user = users.find(
    (u) => u.username === username && u.password === password
  );

  if (!user) {
    return res.status(401).json({ message: "Credenciais inválidas" });
  }

  // Gera token JWT
  const token = jwt.sign(
    { id: user.id, role: user.role },
    SECRET,
    { expiresIn: "1h" }
  );

  return res.json({ token, role: user.role });
};

// Cadastro (simulação)
export const register = (req, res) => {
  const { username, password, role } = req.body;

  const exists = users.find((u) => u.username === username);
  if (exists) {
    return res.status(400).json({ message: "Usuário já existe" });
  }

  const newUser = {
    id: users.length + 1,
    username,
    password,
    role: role || "user",
  };

  users.push(newUser);

  return res.status(201).json({ message: "Usuário registrado com sucesso", newUser });
};
