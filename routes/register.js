const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs"); // Para hashear contraseñas
const jwt = require("jsonwebtoken"); // Para generar el token JWT al registrar
const pool = require("../database/db"); // <-- IMPORTANTE: Importa tu pool de PostgreSQL
require("dotenv").config(); // Carga las variables de entorno desde el archivo .env

// RUTA DE REGISTRO DE USUARIO
router.post("/register", async (req, res) => {
  // Desestructura los campos que esperas del frontend
  const { Nombre, Correo, Contrasena } = req.body;

  // Validaciones básicas de backend para todos los campos
  if (!Nombre || !Correo || !Contrasena) {
    return res
      .status(400) // Bad Request
      .json({ message: "Por favor, ingresa todos los campos." });
  }

  // Validación de longitud de contraseña
  if (Contrasena.length < 6) {
    return res
      .status(400) // Bad Request
      .json({ message: "La contraseña debe tener al menos 6 caracteres." });
  }

  try {
    // 1. Verificar si el correo ya existe en la tabla 'usuario'
    const result = await pool.query(
      `SELECT "IdUsuario" FROM "usuario" WHERE "correo" = $1`,
      [Correo]
    );

    if (result.rows.length > 0) {
      return res
        .status(409) // Conflict (el recurso ya existe)
        .json({ message: "Este correo electrónico ya está registrado." });
    }

    // 2. Hashear la contraseña antes de guardarla
    const salt = await bcrypt.genSalt(10); // Genera un "salt" para mayor seguridad
    const hashedPassword = await bcrypt.hash(Contrasena, salt); // Hashea la contraseña

    // 3. Insertar el nuevo usuario en la tabla 'usuario'
    // La cláusula RETURNING es necesaria en PostgreSQL para obtener el ID del nuevo registro.
    const insertResult = await pool.query(
      `INSERT INTO "usuario" ("Nombre", "correo", "contrasena") VALUES ($1, $2, $3) RETURNING "IdUsuario"`,
      [Nombre, Correo, hashedPassword]
    );

    const newUserId = insertResult.rows[0].IdUsuario; // Obtener el ID del usuario recién creado

    // 4. Generar un token JWT para auto-loguear (opcional pero recomendado)
    const token = jwt.sign(
      { id: newUserId, email: Correo },
      process.env.JWT_SECRET || "tu_secreto_jwt_muy_seguro", // Usa una variable de entorno en producción
      { expiresIn: "1h" } // El token expira en 1 hora
    );

    // 5. Enviar respuesta de éxito
    res.status(201).json({
      message: "Usuario registrado exitosamente!",
      userId: newUserId,
      token: token,
      userName: Nombre, // Opcional: enviar el nombre del usuario
    });
  } catch (error) {
    console.error("Error al registrar usuario:", error);
    res
      .status(500) // Internal Server Error
      .json({ message: "Error interno del servidor al registrar el usuario." });
  }
});

module.exports = router;
