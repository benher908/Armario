const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const pool = require("../database/db"); // <-- IMPORTANTE: Importa tu pool de conexiones

// Configuración de Multer para la subida de archivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Asegúrate de que esta carpeta exista en la raíz de tu backend
  },
  filename: function (req, file, cb) {
    // Genera un nombre de archivo único con timestamp
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

const upload = multer({ storage: storage });

// --- Rutas de la API para el Perfil ---

// Ruta POST para subir una imagen de perfil
// Se espera que el frontend envíe la imagen en un campo llamado 'profileImage'
router.post("/upload_image", upload.single("profileImage"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No se subió ninguna imagen." });
  }

  // Construye la URL pública de la imagen
  // req.headers.host puede ser 'localhost:4000' o la IP de tu servidor
  const imageUrl = `http://${req.headers.host}/uploads/${req.file.filename}`;

  console.log(`Imagen subida: ${imageUrl}`);
  res.status(200).json({
    message: "Imagen subida correctamente.",
    imageUrl: imageUrl, // Devuelve la URL pública de la imagen al frontend
  });
});

// Ruta GET para obtener el perfil de un usuario por su ID
router.get("/:userId", async (req, res) => {
  const { userId } = req.params;
  console.log(
    `BACKEND PERFIL - Intentando obtener perfil para userId: ${userId}`
  );

  try {
    // Busca el perfil en la tabla 'perfil' usando el IdUsuario
    const result = await pool.query(
      `SELECT "Nombre", "Descripcion", "Genero", "Edad", "Peso", "ImagenUrl" FROM "perfil" WHERE "IdUsuario" = $1`,
      [userId]
    );

    const rows = result.rows;

    if (rows.length > 0) {
      // Si se encuentra el perfil, lo devuelve
      const profile = rows[0];
      console.log(`BACKEND PERFIL - Perfil de ${userId} recuperado.`);
      res.status(200).json(profile);
    } else {
      // Si no se encuentra el perfil, devuelve un perfil vacío para inicializar en el frontend
      console.log(
        `BACKEND PERFIL - Perfil de ${userId} no encontrado. Devolviendo perfil vacío.`
      );
      res.status(200).json({
        // Usamos 200 OK para indicar que la operación fue exitosa, pero el perfil no existe
        message: "Perfil no encontrado, inicializando.",
        Nombre: "",
        Descripcion: "",
        Genero: "",
        Edad: null, // Usar null para números si no hay valor
        Peso: null, // Usar null para números si no hay valor
        ImagenUrl: "",
      });
    }
  } catch (error) {
    console.error("BACKEND PERFIL - Error al obtener perfil:", error);
    res
      .status(500)
      .json({ message: "Error interno del servidor al obtener el perfil." });
  }
});

// Ruta PUT para actualizar (o crear) el perfil de un usuario por su ID
router.put("/:userId", async (req, res) => {
  const { userId } = req.params;
  const { Nombre, Descripcion, Genero, Edad, Peso, ImagenUrl } = req.body; // Datos del perfil del frontend

  console.log(
    `BACKEND PERFIL - Intentando actualizar/crear perfil para userId: ${userId}`
  );
  console.log("Datos recibidos:", req.body);

  // Validación básica: el nombre es obligatorio
  if (!Nombre) {
    console.log(
      "BACKEND PERFIL - Validación fallida: El nombre es obligatorio."
    );
    return res.status(400).json({ message: "El nombre es obligatorio." });
  }

  try {
    // Usa INSERT ... ON CONFLICT (...) DO UPDATE para insertar o actualizar el perfil
    // Esto funciona porque "IdUsuario" es UNIQUE en la tabla 'perfil'
    const result = await pool.query(
      `INSERT INTO "perfil" ("IdUsuario", "Nombre", "Descripcion", "Genero", "Edad", "Peso", "ImagenUrl")
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT ("IdUsuario") DO UPDATE SET
       "Nombre" = EXCLUDED."Nombre",
       "Descripcion" = EXCLUDED."Descripcion",
       "Genero" = EXCLUDED."Genero",
       "Edad" = EXCLUDED."Edad",
       "Peso" = EXCLUDED."Peso",
       "ImagenUrl" = EXCLUDED."ImagenUrl"`,
      [userId, Nombre, Descripcion, Genero, Edad, Peso, ImagenUrl]
    );

    console.log(
      `BACKEND PERFIL - Perfil de ${userId} guardado/actualizado.`,
      result.rowCount
    );
    res.status(200).json({ message: "Perfil guardado correctamente." });
  } catch (error) {
    console.error("BACKEND PERFIL - Error al guardar perfil:", error);
    res
      .status(500)
      .json({ message: "Error interno del servidor al guardar el perfil." });
  }
});

module.exports = router; // Exporta el router para que app.js pueda usarlo
