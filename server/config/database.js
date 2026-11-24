const mysql = require('mysql2/promise');

// Pool mengelola beberapa koneksi database dan dapat dipakai berulang.
// Jangan membuat koneksi baru untuk setiap operasi CRUD.
const pool = mysql.createPool({
	host: process.env.DB_HOST || '127.0.0.1',
	port: Number(process.env.DB_PORT || 3306),
	user: process.env.DB_USER || 'root',
	password: process.env.DB_PASSWORD || '',
	database: process.env.DB_NAME || 'lightwell',
	waitForConnections: true,
	connectionLimit: 10,
	queueLimit: 0
});

module.exports = pool;
