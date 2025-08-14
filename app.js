const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();
const path = require("path");

// Middlewares
app.use(express.json());
app.use(cors());

// Rutas existentes
const loginRoutes = require("./routes/login");
const registerRoutes = require("./routes/register");
const ropaRoutes = require("./routes/ropa");

// Nueva ruta perfil
const perfilRoutes = require("./routes/perfil");

// Monta rutas
app.use("/api/auth", loginRoutes);
app.use("/api/auth", registerRoutes);
app.use("/api/perfil", perfilRoutes); // Aquí montas perfil
app.use("/api/ropa", ropaRoutes);

// Servir imágenes
app.use("/uploads", express.static("uploads"));

// Ruta prueba
app.get("/", (req, res) => {
  res.send("API de tu Closet Virtual está funcionando!");
});

app.listen(4000, "0.0.0.0", () => {
  console.log("Servidor corriendo en puerto 4000");
});
