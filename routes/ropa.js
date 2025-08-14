const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const pool = require("../database/db"); // <-- CAMBIO: Importa tu pool de PostgreSQL
const authMiddleware = require("../middleware/authMiddleware"); // <-- Importa el middleware

// Configuración de Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now();
    const extension = path.extname(file.originalname);
    cb(null, `ropaImage-${uniqueSuffix}${extension}`);
  },
});

const upload = multer({ storage: storage });

// Ruta para agregar ropa (protegida)
router.post(
  "/agregar",
  authMiddleware,
  upload.single("imagen"),
  async (req, res) => {
    console.log("DEBUG BACKEND: POST /api/ropa/agregar recibida.");
    console.log("DEBUG BACKEND: req.body:", req.body);
    console.log("DEBUG BACKEND: req.file:", req.file);

    const { nombre, color, fk_idcategoria } = req.body;
    const imagen = req.file ? req.file.filename : null;
    const fk_idusuario = req.user.id; // <-- ID real del usuario logueado

    if (!nombre || !color || !fk_idcategoria || !imagen) {
      return res
        .status(400)
        .json({
          error: "Todos los campos son obligatorios (incluyendo imagen).",
        });
    }

    const query = `
    INSERT INTO "ropa" ("Nombre", "Color", "imagen", "FK_IdCategoria", "FK_IdUsuario")
    VALUES ($1, $2, $3, $4, $5)
    RETURNING "IdRopa"
  `;

    try {
      const results = await pool.query(query, [
        nombre,
        color,
        imagen,
        fk_idcategoria,
        fk_idusuario,
      ]);
      res
        .status(201)
        .json({ mensaje: "Ropa guardada correctamente", id: results.rows[0].IdRopa });
    } catch (error) {
      console.error("ERROR DB:", error);
      res
        .status(500)
        .json({ error: "Error al guardar la ropa", details: error.message });
    }
  }
);

// Ruta para obtener ropa del usuario logueado (protegida)
router.get("/usuario", authMiddleware, async (req, res) => {
  const userId = req.user.id; // <-- ID real
  console.log(`DEBUG BACKEND: GET /api/ropa/usuario para usuario ${userId}`);

  const query = `SELECT * FROM "ropa" WHERE "FK_IdUsuario" = $1`;

  try {
    const results = await pool.query(query, [userId]);
    const rows = results.rows;
    res.json(rows);
  } catch (error) {
    console.error("ERROR DB:", error);
    res
      .status(500)
      .json({ error: "Error al obtener la ropa", details: error.message });
  }
});

module.exports = router;
