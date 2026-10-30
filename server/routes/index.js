// Controller berisi proses untuk setiap fitur.
const itemController = require('../controllers/itemController');

// ambil Utilitis dari http.js
// ult = readJson, sendJson
const { sendJson } = require('../utils/http');


// Tugas router hanya memilih proses yang tepat berdasarkan method dan URL.
async function handleRequest(request, response) {
	
    // mengambil URL nya saja = var URL
	const requestUrl = new URL(request.url, `http://${request.headers.host}`);

	// mengambil part URL nya saja = var pathURL
	const pathParts = requestUrl.pathname.split('/').filter(Boolean);

	// jika dalam request method nya adalah get atau dan dan path dari url nya dalah "/"
	if (request.method === 'GET' && requestUrl.pathname === '/') {
        // maka gunakan ult sendJSON
        // param sendJson (response, status, data)
		sendJson(response, 200, {
            // param data untuk sendJson
            // JSON GET
			message: 'Server aplikasi aktif',
			next: 'Kita akan membangun fitur web secara bertahap.'
		});
		return;
	}

	// Health check biasanya dipakai untuk memastikan service masih aktif.
    // sama seperti sebelum nya 
	if (request.method === 'GET' && requestUrl.pathname === '/api/health') {
		sendJson(response, 200, {
            //JSON HEALTH
			status: 'ok',
			service: 'web-template'
		});
		return;
	}

	// Semua route item harus dimulai dengan /api/items.
	if (pathParts[0] === 'api' && pathParts[1] === 'items') {
		// Number('1') menghasilkan 1, sedangkan Number('abc') menghasilkan NaN.
		// Nilai ini hanya digunakan oleh route yang membutuhkan ID.
		const itemId = Number(pathParts[2]);

		// GET /api/items berarti mengambil semua item.
		if (request.method === 'GET' && pathParts.length === 2) {
			itemController.listItems(request, response);
			return;
		}

		// POST /api/items berarti membuat item baru.
		if (request.method === 'POST' && pathParts.length === 2) {
			await itemController.createItem(request, response);
			return;
		}

		// PUT /api/items/:id berarti mengubah item tertentu.
		// await diperlukan karena controller membaca body request secara asynchronous.
		if (request.method === 'PUT' && pathParts.length === 3 && Number.isInteger(itemId)) {
			await itemController.updateItem(request, response, itemId);
			return;
		}

		// DELETE /api/items/:id berarti menghapus item tertentu.
		if (request.method === 'DELETE' && pathParts.length === 3 && Number.isInteger(itemId)) {
			itemController.removeItem(request, response, itemId);
			return;
		}
	}

	// Jika tidak ada kombinasi method dan URL yang cocok, response-nya 404.
	sendJson(response, 404, { error: 'Route tidak ditemukan' });
}

// File lain, terutama app.js, dapat memakai handleRequest melalui require().
module.exports = { handleRequest };