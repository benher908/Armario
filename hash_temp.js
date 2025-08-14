const bcrypt = require("bcrypt"); //libreria

async function generateHash() {
  const password = "12345clara#"; // <-- ¡ contraseña de texto plano!
  const hashedPassword = await bcrypt.hash(password, 10);
  console.log("Contraseña hasheada:", hashedPassword);
  process.exit(); //  script se cierre automáticamente
}

generateHash();
