const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

function authMiddleware(requiredRole) {
  return (req, res, next) => {
    const header = req.headers["authorization"];
    const token = header?.startsWith("Bearer ") ? header.split(" ")[1] : null;

    if (!token) return res.status(401).json({ message: "Token não informado" });

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;

      if (requiredRole && decoded.role !== requiredRole) {
        return res.status(403).json({ message: "Acesso negado" });
      }

      next();
    } catch (err) {
      return res.status(401).json({ message: "Token inválido" });
    }
  };
}

module.exports = { authMiddleware };
