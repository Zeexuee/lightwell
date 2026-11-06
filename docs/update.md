Tahap 1: Perkuat Fondasi HTTP
Selesaikan issue yang sudah dicatat:

Batas ukuran body request
Timeout request
Error handling terpusat
Validasi method dan URL
Format response API yang konsisten
Ini penting sebelum aplikasi dikembangkan lebih jauh.


Tahap 2: Buat Frontend Vanilla JavaScript
Buat halaman sederhana untuk mengelola items:
client/
├── index.html
├── css/
│   └── style.css
└── js/
    ├── api.js
    └── items.js
Alurnya:
Form frontend
→ fetch()
→ API Node.js
→ controller
→ service
→ response JSON
→ tampilan diperbarui

Tahap 3: Pisahkan Repository Data
Saat ini service menyimpan data langsung di array:

controller → service → array

Nanti ubah menjadi:

controller → service → repository → database

Contoh:

server/
├── repositories/
│   └── itemRepository.js
└── database/
    └── connection.js

Dengan begitu, service tidak peduli apakah data berasal dari array, MySQL, atau database lain.

Tahap 4: Hubungkan Database
Karena kamu menggunakan Laragon, kita bisa memakai MySQL:

items
├── id
├── name
├── created_at
└── updated_at

Kemudian array sementara dihapus dan diganti query database.

Tahap 5: Tambahkan Fitur Template Umum
Setelah CRUD database berjalan, template bisa memiliki:

Konfigurasi .env
Validasi input
Error handler terpusat
Pagination
Search dan filter
Logging
Authentication
Role dan permission
Testing
Dokumentasi API
Urutan terdekat kita:

1. Batas ukuran body dan timeout
2. Frontend vanilla JavaScript
3. CRUD frontend lengkap
4. Repository layer
5. MySQL
6. Testing
7. Authentication

Jadi proses berikutnya yang paling tepat adalah menyelesaikan keamanan HTTP terlebih dahulu, lalu membuat frontend yang mengonsumsi API CRUD.

## Fondasi HTTP yang Sudah Diperkuat

Implementasi `readJson()` sekarang memiliki:

- Batas body maksimum 1 MB.
- Timeout pembacaan body selama 10 detik.
- Penanganan request yang dibatalkan atau koneksinya terputus.
- Pembersihan event listener dan timer setelah request selesai.
- Status `413` untuk body terlalu besar.
- Status `408` untuk request yang timeout.
- Status `400` untuk JSON tidak valid.

Dengan fondasi ini, server tidak membiarkan request besar atau request lambat menahan resource tanpa batas.




Client mengirim data
→ server membaca chunk
→ server menghitung ukuran
→ server memeriksa timeout
→ server parse JSON
→ controller memproses hasil

## Frontend Vanilla JavaScript

Frontend tahap pertama tersedia di folder `client/`:

```text
client/
├── index.html
├── css/
│   └── style.css
└── js/
    ├── api.js
    └── items.js
```

`api.js` menjadi satu tempat untuk komunikasi `fetch()` dengan backend. `items.js` mengatur form, menampilkan data, dan memanggil operasi CRUD. Server menyajikan file frontend melalui `server/utils/static.js`.

Alurnya sekarang:

```text
Browser membuka /
→ static file handler mengirim index.html
→ items.js memanggil GET /api/items
→ user mengisi form
→ items.js mengirim POST atau PUT
→ backend memproses controller dan service
→ frontend memuat ulang daftar item
```