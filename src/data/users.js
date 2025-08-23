// src/data/users.js

// Simulação de usuários (user e admin)
export const users = [
  {
    id: 1,
    username: "luan",
    password: "123456", // em produção deve ser criptografado (bcrypt)
    role: "user",
  },
  {
    id: 2,
    username: "bruno",
    password: "admin123",
    role: "admin",
  },
];
