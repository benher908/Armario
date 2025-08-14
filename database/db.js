
require('dotenv').config();


const { Pool } = require('pg');


const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: process.env.DB_PORT || 5432, 
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});


pool.connect()
  .then(() => {
    console.log('Conectado a la base de datos PostgreSQL');
  })
  .catch(err => {
    console.error('Error al conectar a la base de datos', err);
  });

// Exporta el pool para usarlo en el resto de tu aplicación
module.exports = pool;
