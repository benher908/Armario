// Importa el módulo 'pg'
const { Pool } = require('pg');


require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    
    ssl: {
        rejectUnauthorized: false 
    }
});

// Verifica la conexión a la base de datos
pool.connect()
    .then(client => {
        console.log('✅ Conectado a la base de datos PostgreSQL');
        client.release();
    })
    .catch(err => {
        console.error('❌ Error al conectar a la base de datos:', err);
    });


module.exports = pool;