const jwt = require('jsonwebtoken');
const { sendJson } = require('../utils/http');

// Middleware membaca token, memverifikasi tanda tangan, lalu menyimpan user.
// Route yang memanggil middleware hanya boleh melanjutkan setelah user ada.
function requireAuth(request, response) {
	const authorization = request.headers.authorization;

	if (!authorization || !authorization.startsWith('Bearer ')) {
		sendJson(response, 401, { error: 'Login diperlukan' });
		return null;
	}

	const token = authorization.slice('Bearer '.length).trim();

	try {
		const secret = process.env.JWT_SECRET;

		if (!secret) {
			throw new Error('JWT_SECRET belum dikonfigurasi');
		}

		const user = jwt.verify(token, secret);
		request.user = user;
		return user;
	} catch (error) {
		sendJson(response, 401, { error: 'Sesi tidak valid atau sudah kedaluwarsa' });
		return null;
	}
}

module.exports = { requireAuth };
