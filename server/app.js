// menggunakan modul http bawaan Node.js untuk membuat server HTTP
const http = require('node:http');

// periksa variable port pada .env, apakah sudah di set, jika tidak maka gunakan port 3000 
const port = process.env.PORT || 3000;

let items = [];
let nextId = 1;

function sendJson(response, statusCode, data) {
	response.statusCode = statusCode;
	response.setHeader('Content-Type', 'application/json');
	response.end(JSON.stringify(data));
}

function readRequestBody(request) {
	return new Promise((resolve, reject) => {
		let body = '';

		request.on('data', (chunk) => {
			body += chunk;
		});

		request.on('end', () => {
			try {
				resolve(body ? JSON.parse(body) : {});
			} catch {
				reject(new Error('Body harus berupa JSON yang valid'));
			}
		});
	});
}

// bangun server HTTP dengan modul bawaan node js
// request: objek yang berisi informasi tentang permintaan HTTP yang diterima
// response: objek yang digunakan untuk mengirimkan respons HTTP kembali ke klien
// jangan mengubah parameter .createserver cuz ini template yang mesti diikuti dari node
const server = http.createServer(async (request, response) => {
	const requestUrl = new URL(request.url, `http://${request.headers.host}`);
	const pathParts = requestUrl.pathname.split('/').filter(Boolean);

	// route untuk root path
	if (request.method === 'GET' && requestUrl.pathname === '/') {
		sendJson(response, 200, {
			message: 'Server aplikasi aktif',
			next: 'Kita akan membangun fitur web secara bertahap.'
		});
		return;
	}

	// route untuk health check
	if (request.method === 'GET' && requestUrl.pathname === '/api/health') {
		sendJson(response, 200, {
			status: 'ok',
			service: 'web-template'
		});
		return;
	}

	// mengambil semua item
	if (request.method === 'GET' && requestUrl.pathname === '/api/items') {
		sendJson(response, 200, { data: items });
		return;
	}

	// menambah item baru
	if (request.method === 'POST' && requestUrl.pathname === '/api/items') {
		try {
			const body = await readRequestBody(request);

			if (typeof body.name !== 'string' || body.name.trim() === '') {
				sendJson(response, 400, { error: 'name wajib diisi' });
				return;
			}

			const item = {
				id: nextId++,
				name: body.name.trim()
			};

			items.push(item);
			sendJson(response, 201, { data: item });
		} catch (error) {
			sendJson(response, 400, { error: error.message });
		}
		return;
	}

	const itemId = Number(pathParts[2]);
	const itemIndex = items.findIndex((item) => item.id === itemId);

	// mengubah item berdasarkan id
	if (request.method === 'PUT' && pathParts[0] === 'api' && pathParts[1] === 'items') {
		if (itemIndex === -1) {
			sendJson(response, 404, { error: 'Item tidak ditemukan' });
			return;
		}

		try {
			const body = await readRequestBody(request);

			if (typeof body.name !== 'string' || body.name.trim() === '') {
				sendJson(response, 400, { error: 'name wajib diisi' });
				return;
			}

			items[itemIndex].name = body.name.trim();
			sendJson(response, 200, { data: items[itemIndex] });
		} catch (error) {
			sendJson(response, 400, { error: error.message });
		}
		return;
	}

	// menghapus item berdasarkan id
	if (request.method === 'DELETE' && pathParts[0] === 'api' && pathParts[1] === 'items') {
		if (itemIndex === -1) {
			sendJson(response, 404, { error: 'Item tidak ditemukan' });
			return;
		}

		const deletedItem = items.splice(itemIndex, 1)[0];
		sendJson(response, 200, { data: deletedItem });
		return;
	}

	// jika route tidak ditemukan, kembalikan response 404
	sendJson(response, 404, {
		error: 'Route tidak ditemukan'
	});
});

// jalankan server pada port yang telah ditentukan
server.listen(port, () => {
	console.log(`Server berjalan di http://localhost:${port}`);
});
