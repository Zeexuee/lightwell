require('dotenv').config();

const mysql = require('mysql2/promise');

async function migrate() {
	const databaseName = process.env.DB_NAME || 'lightwell';

	const connection = await mysql.createConnection({
		host: process.env.DB_HOST || '127.0.0.1',
		port: Number(process.env.DB_PORT || 3306),
		user: process.env.DB_USER || 'root',
		password: process.env.DB_PASSWORD || '',
		multipleStatements: true
	});

	await connection.query(`CREATE DATABASE IF NOT EXISTS \`${databaseName}\``);
	await connection.query(`USE \`${databaseName}\``);
	await connection.query(`
		CREATE TABLE IF NOT EXISTS items (
			id INT UNSIGNED NOT NULL AUTO_INCREMENT,
			name VARCHAR(120) NOT NULL,
			created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
			PRIMARY KEY (id)
		) ENGINE=InnoDB
	`);

	await connection.end();
	console.log(`Database dan tabel items siap: ${databaseName}.items`);
}

migrate().catch((error) => {
	console.error('Migrasi gagal:', error.message);
	process.exitCode = 1;
});
