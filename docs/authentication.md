# Authentication

## Tujuan

Authentication memastikan hanya user yang login dapat mengakses data items. Password tidak disimpan sebagai teks biasa dan setiap sesi menggunakan JWT.

## Alur Register

```text
Browser mengisi nama, email, password
  -> POST /api/auth/register
  -> authController membaca body
  -> authService memvalidasi input
  -> password diubah menjadi password_hash oleh bcrypt
  -> userRepository menyimpan user
  -> authService membuat JWT
  -> browser menyimpan token dan membuka aplikasi
```

## Alur Login

```text
Browser mengirim email dan password
  -> POST /api/auth/login
  -> authService mencari user berdasarkan email
  -> bcrypt membandingkan password dengan password_hash
  -> authService membuat JWT dengan masa berlaku 2 jam
  -> browser menyimpan token
```

## Alur Protected Route

```text
Browser membaca token dari localStorage
  -> mengirim Authorization: Bearer <token>
  -> authMiddleware memverifikasi JWT
  -> request.user diset dari payload token
  -> route items dapat diproses
```

Jika token tidak tersedia, tidak valid, atau sudah kedaluwarsa, server mengembalikan status `401`.

## Endpoint

```text
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
GET  /api/items
POST /api/items
PUT  /api/items/:id
DELETE /api/items/:id
```

## Keamanan

- Password di-hash dengan bcrypt sebelum disimpan.
- Password tidak pernah dikembalikan melalui API.
- JWT hanya berisi data identitas yang dibutuhkan, bukan password.
- JWT menggunakan `JWT_SECRET` dari `.env`.
- `.env` tidak boleh dikomit ke Git.
- Untuk produksi, ganti secret dengan nilai acak yang panjang dan aktifkan HTTPS.

## Frontend

- `login.html` menampilkan mode login dan register.
- `login.js` mengirim data auth dan menyimpan token.
- `api.js` otomatis menambahkan header `Authorization`.
- `items.js` mengarahkan ke login jika token tidak tersedia atau ditolak.
- Tombol logout menghapus token dari browser.
