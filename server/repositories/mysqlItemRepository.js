const pool = require('../config/database');

async function findAll() {
	const [rows] = await pool.query(
		'SELECT id, name FROM items ORDER BY id ASC'
	);
	return rows;
}

async function create(data) {
	const [result] = await pool.execute(
		'INSERT INTO items (name) VALUES (?)',
		[data.name]
	);

	return {
		id: result.insertId,
		name: data.name
	};
}

async function update(id, data) {
	const [result] = await pool.execute(
		'UPDATE items SET name = ? WHERE id = ?',
		[data.name, id]
	);

	if (result.affectedRows === 0) {
		return null;
	}

	return { id, name: data.name };
}

async function remove(id) {
	const [rows] = await pool.execute(
		'SELECT id, name FROM items WHERE id = ?',
		[id]
	);

	if (rows.length === 0) {
		return null;
	}

	await pool.execute('DELETE FROM items WHERE id = ?', [id]);
	return rows[0];
}

module.exports = { create, findAll, remove, update };
