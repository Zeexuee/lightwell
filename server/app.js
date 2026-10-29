// Modul `http` adalah modul bawaan Node.js untuk membuat server HTTP.
// Karena ini modul bawaan, kita tidak perlu menginstal package tambahan.
const http = require('node:http');

// Router menangani pemeriksaan URL, HTTP method, dan pemilihan controller.
const { handleRequest } = require('./routes');

// Ambil nomor port dari environment variable PORT.
// Jika PORT belum tersedia, server menggunakan port 3000.
const port = process.env.PORT || 3000;

// Setiap request yang masuk akan diteruskan ke handleRequest.
// app.js sengaja dibuat tipis: tugasnya hanya menyiapkan dan menyalakan server.
const server = http.createServer(handleRequest);

// Mulai menerima request pada port yang sudah ditentukan.
// Callback dijalankan satu kali setelah server berhasil aktif.
server.listen(port, () => {
	console.log(`Server berjalan di http://localhost:${port}`);
});
