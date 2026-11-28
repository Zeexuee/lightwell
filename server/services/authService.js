const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/userRepository');

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateText(value, fieldName, minimumLength) {
	if (typeof value !== 'string' || value.trim().length < minimumLength) {
		const error = new Error(`${fieldName} minimal ${minimumLength} karakter`);
		error.statusCode = 400;
		throw error;
	}

	return value.trim();
}

async function register(name, email, password) {
	const cleanName = validateText(name, 'Nama', 2);
	const cleanEmail = validateText(email, 'Email', 5).toLowerCase();

	if (!emailPattern.test(cleanEmail)) {
		const error = new Error('Format email tidak valid');
		error.statusCode = 400;
		throw error;
	}

	validateText(password, 'Password', 8);
	const passwordHash = await bcrypt.hash(password, 12);

	const user = await userRepository.create({
		name: cleanName,
		email: cleanEmail,
		passwordHash
	});

	return createLoginResult(user);
}

async function login(email, password) {
	const cleanEmail = validateText(email, 'Email', 5).toLowerCase();
	validateText(password, 'Password', 1);

	const user = await userRepository.findByEmail(cleanEmail);

	if (!user) {
		const error = new Error('Email atau password salah');
		error.statusCode = 401;
		throw error;
	}

	const passwordMatches = await bcrypt.compare(password, user.password_hash);

	if (!passwordMatches) {
		const error = new Error('Email atau password salah');
		error.statusCode = 401;
		throw error;
	}

	return createLoginResult({ id: user.id, name: user.name, email: user.email });
}

function createLoginResult(user) {
	if (!process.env.JWT_SECRET) {
		const error = new Error('JWT_SECRET belum dikonfigurasi');
		error.statusCode = 500;
		throw error;
	}

	const token = jwt.sign(
		{ sub: user.id, name: user.name, email: user.email },
		process.env.JWT_SECRET,
		{ expiresIn: '2h' }
	);

	return { token, user };
}

async function getCurrentUser(userId) {
	return userRepository.findById(userId);
}

module.exports = { getCurrentUser, login, register };
