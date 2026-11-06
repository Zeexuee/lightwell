// halaman ini akan berisikan alat bantu ketika menggunakan http
//berisikan : sendJSON, createRequestError dan readJSON



// utiliti : merubah bentuk respone ke dalam bentuk JSON
function sendJson(response, statusCode, data) {

	// Setelah client terputus, response bisa sudah dihancurkan.
	// Memastikan untuk Jangan mencoba menulis ke koneksi yang sudah tidak tersedia.
	if (response.destroyed || response.writableEnded) {
		return;
	}

	// Status code menjelaskan hasil request kepada client.
	response.statusCode = statusCode;
	response.setHeader('Content-Type', 'application/json');
	response.end(JSON.stringify(data));
}

// Membuat Error yang membawa HTTP status code.
// Controller dapat memakai statusCode ini tanpa menebak jenis error.
function createRequestError(message, statusCode) {
	const error = new Error(message);
	error.statusCode = statusCode;
	return error;
}

// Membaca body request JSON dengan batas ukuran dan batas waktu.
// Batas ini mencegah client menahan koneksi terlalu lama atau memenuhi memory.
function readJson(request, options = {}) {
	
	// default batasan besar adalah 1jt bytes
	// default batasan waktu adalah 10 detik
	const maxBytes = options.maxBytes || 1_000_000;
	const timeoutMs = options.timeoutMs || 10_000;



	return new Promise((resolve, reject) => {
		// Data request datang dalam beberapa chunk Buffer.
		// Array ini menampung chunk tanpa menggabungkan string berulang kali.
		const chunks = [];
		let receivedBytes = 0;
		let settled = false;
		let timeoutId;

		// Promise hanya boleh diselesaikan satu kali.
		// Koneksi putus dapat memicu beberapa event sekaligus.
		function settle(callback, value) {
			if (settled) {
				return;
			}

			settled = true;
			cleanup();
			callback(value);
		}

		// Setelah request selesai atau gagal, listener dan timer tidak diperlukan.
		function cleanup() {
			clearTimeout(timeoutId);
			request.removeListener('data', handleData);
			request.removeListener('end', handleEnd);
			request.removeListener('aborted', handleAborted);
			request.removeListener('error', handleError);
			request.removeListener('close', handleClose);
		}

		// Setiap chunk dihitung dan disimpan sampai body selesai diterima.
		function handleData(chunk) {
			receivedBytes += chunk.length;

			if (receivedBytes > maxBytes) {
				settle(reject, createRequestError('Ukuran body terlalu besar', 413));
				request.destroy();
				return;
			}

			chunks.push(chunk);
		}

		// Jika seluruh body sudah diterima, gabungkan Buffer lalu parse sebagai JSON.
		function handleEnd() {
			try {
				const body = Buffer.concat(chunks).toString('utf8');
				settle(resolve, body ? JSON.parse(body) : {});
			} catch {
				settle(reject, createRequestError('Body harus berupa JSON yang valid', 400));
			}
		}

		// Event ini terjadi ketika client membatalkan request sebelum selesai.
		function handleAborted() {
			settle(reject, createRequestError('Request dibatalkan sebelum body selesai diterima', 400));
		}

		// Error socket atau stream juga harus menghentikan Promise.
		function handleError(error) {
			settle(reject, createRequestError(error.message, 400));
		}

		// `close` dapat terjadi tanpa `end` ketika koneksi terputus.
		function handleClose() {
			if (!request.complete) {
				handleAborted();
			}
		}

		// Timeout menghentikan request yang mengirim data terlalu lambat.
		function handleTimeout() {
			settle(reject, createRequestError('Request timeout saat membaca body', 408));
			request.destroy();
		}

		request.on('data', handleData);
		request.once('end', handleEnd);
		request.once('aborted', handleAborted);
		request.once('error', handleError);
		request.once('close', handleClose);
		timeoutId = setTimeout(handleTimeout, timeoutMs);
	});
}

module.exports = { readJson, sendJson };