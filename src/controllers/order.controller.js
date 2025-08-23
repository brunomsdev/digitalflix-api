import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Por enquanto simulamos usuários em memória
let users = [];

/**
 * Cadastro
 */
export const register = async (req, res) => {
  try {
    const { username, password, role } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Username e password são obrigatórios" });
    }

    const userExists = users.find(u => u.username === username);
    if (userExists) {
      return res.status(400).json({ error: "Usuário já existe" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const newUser = {
      id: users.length + 1,
      username,
      password: hashed,
      role: role || "user", // padrão para 'user'
    };

    users.push(newUser);

    res.status(201).json({ message: "Usuário registrado com sucesso" });
  } catch (err) {
    res.status(500).json({ error: "Erro ao registrar usuário" });
  }
};


  // Login 

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = users.find(u => u.username === username);
    if (!user) return res.status(401).json({ error: "Usuário não encontrado" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: "Senha inválida" });

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: "Erro no login" });
  }
};


 // Rota protegida (teste)
 
export const profile = (req, res) => {
  res.json({ message: "Perfil acessado", user: req.user });
};
