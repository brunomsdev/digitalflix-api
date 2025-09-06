const bcrypt = require("bcrypt");
const { PrismaClient } = require("../generated/prisma");
const { z } = require("zod");

const prisma = new PrismaClient();

// Step 1: Define Zod schema for validation
const userSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["user", "admin"]), // Limit accepted roles
});

exports.createUser = async (req, res) => {
  // Step 2: Validate incoming data
  const result = userSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      error: "Invalid input",
      issues: result.error.format(),
    });
  }

  const { username, password, role } = result.data;

  try {
    // Step 3: Check if username already exists
    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      return res.status(409).json({ error: "Username already taken" });
    }

    // Step 4: Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Step 5: Create user in the database
    const newUser = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        role,
      },
    });

    // Step 6: Return response (don’t return password!)
    res.status(201).json({
      message: "User created successfully",
      user: {
        id: newUser.id,
        username: newUser.username,
        role: newUser.role,
        createdAt: newUser.createdAt,
      },
    });
  } catch (err) {
    console.error("Error creating user:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
