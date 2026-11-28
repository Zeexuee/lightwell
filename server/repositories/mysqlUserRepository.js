const pool = require('../config/database');

async function create(data) {
	try {
		const [result] = await pool.execute(
			'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
			[data.name, data.email, data.passwordHash]
		);

		return { id: result.insertId, name: data.name, email: data.email };
	} catch (error) {
		if (error.code === 'ER_DUP_ENTRY') {
			const duplicateError = new Error('Email sudah digunakan');
			duplicateError.statusCode = 409;
			throw duplicateError;
		}

		throw error;
	}
}

async function findByEmail(email) {
	const [rows] = await pool.execute(
		'SELECT id, name, email, password_hash FROM users WHERE email = ? LIMIT 1',
		[email]
	);

	return rows[0] || null;
}

async function findById(id) {
	const [rows] = await pool.execute(
		'SELECT id, name, email FROM users WHERE id = ? LIMIT 1',
		[id]
	);

	return rows[0] || null;
}

module.exports = { create, findByEmail, findById };
