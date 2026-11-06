const fs = require('node:fs/promises');
const path = require('node:path');

// Semua file yang boleh diakses browser berada di folder client.
const clientDirectory = path.resolve(__dirname, '../../client');

const contentTypes = {
	'.css': 'text/css; charset=utf-8',
	'.html': 'text/html; charset=utf-8',
	'.js': 'text/javascript; charset=utf-8',
	'.json': 'application/json; charset=utf-8'
};

// Mengirim file frontend berdasarkan URL yang diminta browser.
// Return true berarti request sudah ditangani; false berarti router API lanjut bekerja.
async function serveStatic(request, response) {
	if (request.method !== 'GET') {
		return false;
	}

	let pathname;

	try {
		pathname = new URL(request.url, `http://${request.headers.host}`).pathname;
	} catch {
		return false;
	}

	const relativePath = pathname === '/' ? 'index.html' : pathname.slice(1);
	const filePath = path.resolve(clientDirectory, relativePath);
	const clientPrefix = `${clientDirectory}${path.sep}`;

	// Pastikan URL tidak dapat keluar dari folder client, misalnya melalui ../.
	if (filePath !== clientDirectory && !filePath.startsWith(clientPrefix)) {
		return false;
	}

	try {
		const file = await fs.readFile(filePath);
		const extension = path.extname(filePath).toLowerCase();

		response.statusCode = 200;
		response.setHeader('Content-Type', contentTypes[extension] || 'application/octet-stream');
		response.end(file);
		return true;
	} catch (error) {
		if (error.code === 'ENOENT') {
			return false;
		}

		response.statusCode = 500;
		response.setHeader('Content-Type', 'text/plain; charset=utf-8');
		response.end('Gagal membaca file frontend');
		return true;
	}
}

module.exports = { serveStatic };