const express = require("express");
const dotenv = require("dotenv");
const authRoutes = require("./routes/routes");  
const userRoutes = require("./routes/users"); 
const movieRoutes = require("./routes/movies"); 
const cors = require("cors");



dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());


app.get("/", (_, res) => res.json({ ok: true, up: new Date().toISOString() }));

app.use("/api/movies", movieRoutes);
app.use("/api/auth", authRoutes);   
app.use("/api/users", userRoutes); 
app.use("/api/movies", movieRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
