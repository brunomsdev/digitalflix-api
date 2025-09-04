const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

const JWT_OPTIONS = {
  algorithms: ["HS256"],
  ...(process.env.JWT_ISSUER ? { issuer: process.env.JWT_ISSUER } : {}),
  ...(process.env.JWT_AUDIENCE ? { audience: process.env.JWT_AUDIENCE } : {}),
};


function getTokenFromRequest(req) {
  const header = req.headers?.authorization || req.headers?.Authorization;
  if (header && /^Bearer\s+/i.test(header)) {
    return header.split(" ")[1];
  }

  if (req.headers?.["x-access-token"]) {
    return req.headers["x-access-token"];
  }

  if (req.query?.token) {
    return req.query.token;
  }

  return null;
}


function issueAccessToken(user, options = {}) {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET não definido nas variáveis de ambiente.");
  }

  const payload = {
    sub: String(user.id ?? user._id ?? user.uuid),
    role: user.role,
    ...(user.email ? { email: user.email } : {}),
  };

  const signOptions = {
    expiresIn: options.expiresIn || "1h",
    ...(process.env.JWT_ISSUER ? { issuer: process.env.JWT_ISSUER } : {}),
    ...(process.env.JWT_AUDIENCE ? { audience: process.env.JWT_AUDIENCE } : {}),
  };

  return jwt.sign(payload, process.env.JWT_SECRET, signOptions);
}


function authMiddleware(required) {
  return (req, res, next) => {
    try {
      const token = getTokenFromRequest(req);
      if (!token) {
        return res.status(401).json({ message: "Token não informado" });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET, JWT_OPTIONS);
      req.user = decoded;

    
      if (required) {
        let allowed = false;

        if (typeof required === "string") {
          allowed = decoded.role === required;
        } else if (Array.isArray(required)) {
          allowed = required.includes(decoded.role);
        } else if (typeof required === "function") {
          allowed = Boolean(required(decoded, req));
        }

        if (!allowed) {
          return res.status(403).json({ message: "Acesso negado" });
        }
      }

      return next();
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({ message: "Token expirado" });
      }
      return res.status(401).json({ message: "Token inválido" });
    }
  };
}


const requireAuth = authMiddleware(null);
const requireRole = (role) => authMiddleware(role);
const requireAnyRole = (roles) => authMiddleware(roles);


function authorizeSelfOrRole(paramName = "id", elevatedRoles = ["admin"]) {
  return authMiddleware((decoded, req) => {
    const targetId = String(req.params?.[paramName] ?? "");
    const isSelf = targetId && String(decoded.sub) === targetId;
    const hasElevated = Array.isArray(elevatedRoles)
      ? elevatedRoles.includes(decoded.role)
      : decoded.role === elevatedRoles;
    return isSelf || hasElevated;
  });
}


module.exports = {
  authMiddleware,
  requireAuth,
  requireRole,
  requireAnyRole,
  authorizeSelfOrRole,
  issueAccessToken,
};
