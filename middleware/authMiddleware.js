// backend/middleware/authMiddleware.js
const jwt = require("jsonwebtoken");
// Aunque app.js ya carga dotenv, es una buena práctica asegurar la carga aquí también
// para módulos que puedan ser ejecutados de forma independiente, o simplemente por robustez.
// require("dotenv").config(); // Descomenta si este middleware pudiera ser usado fuera de la app principal

module.exports = function (req, res, next) {
  const authHeader = req.headers["authorization"];

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token no proporcionado" });
  }

  const token = authHeader.split(" ")[1];

  try {
    // ¡CAMBIO CLAVE AQUÍ!
    // Usa la misma clave secreta que en login.js, incluyendo el fallback.
    const JWT_SECRET = process.env.JWT_SECRET || "tu_secreto_jwt_muy_seguro";
    const decoded = jwt.verify(token, JWT_SECRET); // Usar la clave asegurada

    req.user = decoded; // aquí estará { id: X, ... }
    next();
  } catch (error) {
    console.error("ERROR AUTH MIDDLEWARE:", error.message); // Log para depuración
    return res.status(403).json({ error: "Token inválido o expirado" });
  }
};
