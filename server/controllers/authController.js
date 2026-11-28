const { readJson, sendJson } = require('../utils/http');
const authService = require('../services/authService');

async function register(request, response) {
	try {
		const body = await readJson(request);
		const result = await authService.register(body.name, body.email, body.password);
		sendJson(response, 201, { data: result });
	} catch (error) {
		sendJson(response, error.statusCode || 500, { error: error.message });
	}
}

async function login(request, response) {
	try {
		const body = await readJson(request);
		const result = await authService.login(body.email, body.password);
		sendJson(response, 200, { data: result });
	} catch (error) {
		sendJson(response, error.statusCode || 500, { error: error.message });
	}
}

async function me(request, response) {
	try {
		const user = await authService.getCurrentUser(request.user.sub);

		if (!user) {
			sendJson(response, 404, { error: 'User tidak ditemukan' });
			return;
		}

		sendJson(response, 200, { data: user });
	} catch (error) {
		sendJson(response, error.statusCode || 500, { error: error.message });
	}
}

module.exports = { login, me, register };
