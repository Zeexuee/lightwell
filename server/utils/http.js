// Mengirim object JavaScript sebagai JSON response HTTP.
// Semua controller memakai helper ini agar format response konsisten.
function sendJson(response, statusCode, data) {
	// Status code menjelaskan hasil request, misalnya 200 berhasil atau 404 tidak ditemukan.
	response.statusCode = statusCode;

	// Header memberi tahu client bahwa isi response adalah JSON.
	response.setHeader('Content-Type', 'application/json');

	// JSON.stringify mengubah object JavaScript menjadi teks JSON.
	response.end(JSON.stringify(data));
}

// Membaca body request dan mengubah teks JSON menjadi object JavaScript.
function readJson(request) {
	return new Promise((resolve, reject) => {
		// Body dapat datang dalam beberapa potongan data, sehingga kita gabungkan dulu.
		let body = '';

		request.on('data', (chunk) => {
			body += chunk;
		});

		request.on('end', () => {
			try {
				// Body kosong dianggap sebagai object kosong.
				// Jika ada isi, JSON.parse mengubah teks menjadi object JavaScript.
				resolve(body ? JSON.parse(body) : {});
			} catch {
				// reject membuat await readJson() masuk ke blok catch controller.
				reject(new Error('Body harus berupa JSON yang valid'));
			}
		});
	});
}

// Export membuat kedua helper dapat digunakan oleh controller dan router.
module.exports = { readJson, sendJson };