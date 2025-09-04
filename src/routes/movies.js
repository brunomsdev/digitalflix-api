// src/movies.js
const express = require("express");
const { PrismaClient } = require("../generated/prisma");
const { authMiddleware } = require("../middlewares/auth");
const { getAllMovies, createMovie } = require('../controllers/moviesController');

const prisma = new PrismaClient();
const router = express.Router();

router.get('/', getAllMovies);
router.post("/", createMovie);

router.get("/", authMiddleware(), async (req, res) => {
  try {
    const movies = await prisma.movie.findMany({
      select: { id: true, title: true, description: true, trailerUrl: true, coverImage: true, createdAt: true },
    });
    return res.json(movies);
  } catch (err) {
    return res.status(500).json({ message: "Erro ao buscar filmes", error: err.message });
  }
});


router.get("/:id", authMiddleware(), async (req, res) => {
  try {
    const { id } = req.params;

    const movie = await prisma.movie.findUnique({
      where: { id },
      select: { id: true, title: true, description: true, trailerUrl: true, coverImage: true, createdAt: true },
    });

    if (!movie) return res.status(404).json({ message: "Filme não encontrado" });

    return res.json(movie);
  } catch (err) {
    return res.status(500).json({ message: "Erro ao buscar filme", error: err.message });
  }
});


router.post("/", authMiddleware("admin"), async (req, res) => {
  try {
    const { title, description, trailerUrl, coverImage } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: "Título e descrição são obrigatórios" });
    }

    const movie = await prisma.movie.create({
      data: { title, description, trailerUrl, coverImage },
      select: { id: true, title: true, description: true, trailerUrl: true, coverImage: true, createdAt: true },
    });

    return res.status(201).json({ message: "Filme criado com sucesso", movie });
  } catch (err) {
    return res.status(500).json({ message: "Erro ao criar filme", error: err.message });
  }
});


router.put("/:id", authMiddleware("admin"), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, trailerUrl, coverImage } = req.body;

    const movie = await prisma.movie.update({
      where: { id },
      data: { title, description, trailerUrl, coverImage },
      select: { id: true, title: true, description: true, trailerUrl: true, coverImage: true, createdAt: true },
    });

    return res.json({ message: "Filme atualizado com sucesso", movie });
  } catch (err) {
    return res.status(500).json({ message: "Erro ao atualizar filme", error: err.message });
  }
});


router.delete("/:id", authMiddleware("admin"), async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.movie.delete({ where: { id } });

    return res.json({ message: "Filme removido com sucesso" });
  } catch (err) {
    return res.status(500).json({ message: "Erro ao deletar filme", error: err.message });
  }
});

module.exports = router;

