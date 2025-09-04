// src/controllers/moviesController.js
const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient();

const getAllMovies = async (req, res) => {
  try {
    const { search } = req.query;

    let movies;
    if (search) {
      movies = await prisma.movie.findMany({
        where: {
          title: {
            contains: search,
            mode: 'insensitive', 
          },
        },
      });
    } else {
      movies = await prisma.movie.findMany();
    }

    res.json(movies);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao listar filmes' });
  }
};


const createMovie = async (req, res) => {
  try {
    const { title, director, releaseYear } = req.body;

   
    if (!title || !director || !releaseYear) {
      return res.status(400).json({ error: "Todos os campos são obrigatórios" });
    }

    const newMovie = await prisma.movie.create({
      data: {
        title,
        director,
        releaseYear,
      },
    });

    res.status(201).json(newMovie);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao criar filme" });
  }
};

module.exports = {
  getAllMovies,
  createMovie,
};
