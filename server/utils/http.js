// ----- halaman ini utill untuk buat header JSON dan cek req dan ubah menjadi JSON -------
// Helper untuk setiap menggunakan send
//@param@ response
//@param@ status code
//@param@ data
//@note@ ini adalah template untuk send respone dalam bentuk JSON 
function sendJson(response, statusCode, data) {
	// Setelah client terputus, response bisa sudah dihancurkan.
	// Jangan mencoba menulis ke koneksi yang sudah tidak tersedia.
	if (response.destroyed || response.writableEnded) {
		return;
	}

	// memasukan hasil status code ke dalam json.
	response.statusCode = statusCode;

	// Set Header menjadi JSON.
	response.setHeader('Content-Type', 'application/json');

	// mengubah semua data yang berhasil dihasilkan menjadi JSON.
	response.end(JSON.stringify(data));
}

// Helper untuk membaca permintaan 
// semua permintaan harus berbentuk JSON
// @request@ hasil yang permintaan yang diterima server
function readJson(request) {
	return new Promise((resolve, reject) => {
		// buat kotak kosong
        // karena data terkirim ke server terkadang dalam bentuk potongan
        // maka siapkan var kosong, agar nanti bisa digabungkan
		let body = '';
		let settled = false;

		// Promise hanya boleh diselesaikan satu kali.
		// Ini penting karena koneksi putus dapat memicu lebih dari satu event,
		// misalnya `aborted`, lalu `error` atau `close`.
		function settle(callback, value) {
			if (settled) {
				return;
			}

			settled = true;
			cleanup();
			callback(value);
		}

		// Setelah request selesai atau gagal, listener tidak lagi diperlukan.
		function cleanup() {
			request.removeListener('data', handleData);
			request.removeListener('end', handleEnd);
			request.removeListener('aborted', handleAborted);
			request.removeListener('error', handleError);
			request.removeListener('close', handleClose);
		}

        // Setiap chunk digabungkan menjadi satu string JSON.
		function handleData(chunk) {
			body += chunk;
		}

        // Jika seluruh body sudah diterima, ubah JSON text menjadi object.
		function handleEnd() {
			try {
				// Body kosong dianggap sebagai object kosong.
				// Jika ada isi, JSON.parse mengubah teks menjadi object JavaScript.
				settle(resolve, body ? JSON.parse(body) : {});
			} catch {
				// JSON rusak tetap diteruskan ke catch pada controller.
				settle(reject, new Error('Body harus berupa JSON yang valid'));
			}
		}

        // Event ini terjadi ketika client membatalkan request sebelum selesai.
		function handleAborted() {
			settle(reject, new Error('Request dibatalkan sebelum body selesai diterima'));
		}

        // Error socket atau stream juga harus menghentikan Promise.
		function handleError(error) {
			settle(reject, error);
		}

        // `close` dapat terjadi tanpa `end` ketika koneksi terputus.
		function handleClose() {
			if (!request.complete) {
				handleAborted();
			}
		}

        // ketika req berjalan (on)
        // gabungkan semua pecahan ke dalam kotak kosong yang sudah disiapkan sebelumnya => var boady
		request.on('data', handleData);

        // ketika req selesai (end)
        // bagian ini untuk memastikan bahwa yang diterima adalah JSON
		request.once('end', handleEnd);

		// Tangani client yang memutus koneksi saat chunk belum lengkap.
		request.once('aborted', handleAborted);
		request.once('error', handleError);
		request.once('close', handleClose);
	});
}
// ----- fitur utilitas HTTP harus dikembangkan lagi -----

// Export membuat kedua helper dapat digunakan oleh controller dan router.
module.exports = { readJson, sendJson };