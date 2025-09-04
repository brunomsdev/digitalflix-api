const bcrypt = require("bcryptjs");

const users = [
  {
    id: 1,
    username: "luan",
    password: bcrypt.hashSync("123456", 8),
    role: "user",
  },
  {
    id: 2,
    username: "admin",
    password: bcrypt.hashSync("admin123", 8),
    role: "admin",
  },
];

module.exports = { users };
