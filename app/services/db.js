const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'db',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'secretpassword',
  database: process.env.DB_DATABASE || 'team_awesome',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// This helps debug the connection in your Docker logs
pool.getConnection((err, connection) => {
  if (err) {
    console.error('Database connection failed:', err.message);
  } else {
    console.log('Connected to the MySQL database.');
    connection.release();
  }
});

module.exports = pool.promise();