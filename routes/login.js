// back/routes/login.js (Backend)
const express = require("express");
const router = express.Router();
const pool = require("../database/db"); // <-- IMPORTANTE: Importa tu pool de PostgreSQL
const bcrypt = require("bcryptjs"); // Para comparar contraseñas
const jwt = require("jsonwebtoken"); // Para generar el token JWT
require("dotenv").config(); // Carga las variables de entorno desde el archivo .env

// RUTA DE INICIO DE SESIÓN (LOGIN)
router.post("/login", async (req, res) => {
  // Desestructura 'correo' y 'contrasena' del cuerpo de la petición
  const { correo, contrasena } = req.body;

  console.log("BACKEND LOGIN - Petición recibida.");
  console.log("BACKEND LOGIN - Correo recibido:", correo);
  // console.log("BACKEND LOGIN - Contraseña recibida (DEPURACIÓN):", contrasena); // ¡No dejes esto en producción!

  // 1. Validaciones iniciales: verificar que ambos campos estén presentes
  if (!correo || !contrasena) {
    console.log(
      "BACKEND LOGIN - Validación fallida: Correo o contraseña faltan."
    );
    return res
      .status(400) // Bad Request
      .json({ message: "Por favor, proporcione correo y contraseña." });
  }

  try {
    // 2. Buscar al usuario en la base de datos (tabla 'usuario')
    const result = await pool.query(
      `SELECT "IdUsuario", "Nombre", "correo", "contrasena" FROM "usuario" WHERE "correo" = $1`,
      [correo]
    );

    // Si no se encuentra ningún usuario con ese correo
    if (result.rows.length === 0) {
      console.log(
        "BACKEND LOGIN - Credenciales inválidas: Correo no encontrado."
      );
      return res.status(401).json({ message: "Credenciales inválidas." }); // Unauthorized
    }

    const user = result.rows[0]; // Obtiene el primer (y único) usuario encontrado

    // 3. Comparar la contraseña proporcionada con la contraseña hasheada en la BD
    const isMatch = await bcrypt.compare(contrasena, user.contrasena);

    // Si las contraseñas no coinciden
    if (!isMatch) {
      console.log(
        "BACKEND LOGIN - Credenciales inválidas: Contraseña incorrecta."
      );
      return res.status(401).json({ message: "Credenciales inválidas." }); // Unauthorized
    }

    // 4. Generar un token JWT para el usuario autenticado
    const token = jwt.sign(
      { id: user.IdUsuario, email: user.correo },
      process.env.JWT_SECRET || "tu_secreto_jwt_muy_seguro", // Usa una variable de entorno en producción
      { expiresIn: "1h" } // Token válido por 1 hora
    );

    // 5. Enviar respuesta de éxito con el token y datos del usuario
    console.log("BACKEND LOGIN - Inicio de sesión exitoso para:", user.correo);
    res.json({
      message: "Inicio de sesión exitoso",
      token: token,
      userId: user.IdUsuario,
      userName: user.Nombre, // Devolver el nombre de usuario
    });
  } catch (error) {
    // 6. Manejo de Errores
    console.error(
      "BACKEND LOGIN - Error durante el login (catch block):",
      error
    );
    res
      .status(500) // Internal Server Error
      .json({ message: "Error interno del servidor al iniciar sesión." });
  }
});

module.exports = router;
