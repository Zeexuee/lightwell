// Menggunakan bawaan modul node = HTTP
const http = require('node:http');

// Router menangani pemeriksaan URL, HTTP method, dan pemilihan controller.
const { handleRequest } = require('./routes');

// Ambil nomor port dari environment variable PORT.
// Jika PORT belum tersedia,  gunakan port 3000.
const port = process.env.PORT || 3000 // ini bisa diubah sesuai dengan kebutuhan;

// Setiap request yang masuk akan diteruskan ke handleRequest.
// Create Server, ambil var dari handle request
const server = http.createServer(handleRequest);

// Mulai menerima request pada port yang sudah ditentukan.
// Callback dijalankan satu kali setelah server berhasil aktif (console log).
server.listen(port, () => {
	console.log(`Server berjalan di http://localhost:${port}`);
});
