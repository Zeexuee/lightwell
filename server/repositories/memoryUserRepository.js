const users = [];
let nextId = 1;

async function create(data) {
	const existingUser = users.find((user) => user.email === data.email);

	if (existingUser) {
		const error = new Error('Email sudah digunakan');
		error.statusCode = 409;
		throw error;
	}

	const user = {
		id: nextId++,
		name: data.name,
		email: data.email,
		password_hash: data.passwordHash
	};

	users.push(user);
	return toPublicUser(user);
}

async function findByEmail(email) {
	return users.find((user) => user.email === email) || null;
}

async function findById(id) {
	const user = users.find((currentUser) => currentUser.id === id);
	return user ? toPublicUser(user) : null;
}

function toPublicUser(user) {
	return { id: user.id, name: user.name, email: user.email };
}

module.exports = { create, findByEmail, findById };
