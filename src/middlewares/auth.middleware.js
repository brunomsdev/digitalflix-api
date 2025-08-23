import jwt from "jsonwebtoken";

const SECRET = "seusegredoaqui";

// Verifica se o usuário está autenticado
export const authenticate = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // "Bearer token"

  if (!token) {
    return res.status(401).json({ message: "Token não fornecido" });
  }

  jwt.verify(token, SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Token inválido" });

    req.user = user;
    next();
  });
};

// Verifica se o usuário tem o papel necessário
export const authorize = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Acesso negado" });
    }
    next();
  };
};
