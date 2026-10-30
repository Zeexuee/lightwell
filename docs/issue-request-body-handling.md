# Issue: Request Body Tidak Memiliki Batas Ukuran dan Timeout

## Ringkasan

Fungsi `readJson()` membaca body HTTP secara bertahap melalui event `data`, kemudian menggabungkan seluruh chunk ke dalam satu string. Saat ini belum ada batas ukuran body dan belum ada timeout khusus untuk request yang berjalan terlalu lama.

Kondisi tersebut dapat menyebabkan resource server tertahan atau memory server habis ketika client mengirim data sangat besar, mengirim data sangat lambat, atau berhenti mengirim data sebelum request selesai.

## Komponen Terdampak

- File: `server/utils/http.js`
- Fungsi: `readJson(request)`
- Dampak utama: ketersediaan server dan penggunaan memory
- Kategori: Resource exhaustion / Denial of Service
- Status: Penanganan koneksi terputus sudah ditambahkan; batas ukuran body dan timeout masih perlu ditambahkan

## Perilaku Saat Ini

Alur pembacaan body saat ini:

```text
request data chunk
  -> chunk digabungkan ke variable body
  -> event end diterima
  -> JSON.parse(body)
```

Penanganan `aborted`, `error`, dan `close` sudah tersedia. Dengan begitu, request yang terputus tidak lagi menunggu event `end` tanpa batas.

Namun, setiap chunk masih selalu ditambahkan ke `body` tanpa pemeriksaan ukuran:

```js
request.on('data', (chunk) => {
    body += chunk;
});
```

## Masalah

### 1. Ukuran body tidak dibatasi

Client dapat mengirim body yang sangat besar. Karena setiap chunk disimpan di memory, penggunaan memory akan terus meningkat sampai body selesai atau proses server kehabisan memory.

### 2. Request dapat berjalan terlalu lama

Client yang mengirim data sangat lambat dapat mempertahankan koneksi dan object request dalam waktu lama. Jika tidak ada timeout, banyak koneksi lambat dapat menghabiskan resource server.

### 3. Request terputus di tengah proses

Pada implementasi awal, kode hanya menunggu event `end`. Jika koneksi terputus sebelum `end`, Promise dapat menggantung selama object request masih hidup.

Masalah ini sudah ditangani dengan event:

- `aborted`: client membatalkan request.
- `error`: stream atau socket mengalami error.
- `close`: koneksi tertutup sebelum body lengkap.

## Dampak

Jika dieksploitasi atau terjadi secara tidak sengaja, dampaknya dapat berupa:

- Memory usage server meningkat.
- Request lain menjadi lambat karena resource terbatas.
- Banyak koneksi aktif menumpuk.
- Proses Node.js dapat crash karena kehabisan memory.
- Server tidak dapat melayani request normal.

Issue ini terutama berdampak pada **availability**, bukan kebocoran data secara langsung.

## Langkah Reproduksi Konseptual

1. Jalankan server dengan `npm start`.
2. Kirim request `POST /api/items` dengan body yang sangat besar.
3. Alternatif lain, kirim body secara perlahan dalam banyak chunk.
4. Amati penggunaan memory dan jumlah koneksi aktif proses Node.js.
5. Putuskan koneksi sebelum seluruh body selesai dikirim.
6. Amati apakah server tetap responsif dan request ditutup dengan benar.

Contoh endpoint yang terdampak:

```text
POST http://localhost:3000/api/items
Content-Type: application/json
```

## Perilaku yang Diharapkan

Server harus:

1. Menolak body yang melebihi ukuran maksimum.
2. Menghentikan pembacaan saat batas ukuran terlampaui.
3. Menutup request yang terlalu lama.
4. Membersihkan listener dan resource request.
5. Tidak mencoba mengirim response melalui koneksi yang sudah terputus.
6. Mengembalikan status yang sesuai jika koneksi masih tersedia.
7. Tetap dapat melayani request normal setelah request bermasalah dihentikan.

## Rencana Perbaikan

### Batas ukuran body

Tetapkan batas maksimum, misalnya 1 MB untuk endpoint JSON umum.

```js
const maxBodySize = 1_000_000;

request.on('data', (chunk) => {
    body += chunk;

    if (Buffer.byteLength(body) > maxBodySize) {
        request.destroy();
    }
});
```

Implementasi final sebaiknya menolak request secara eksplisit dan menggunakan error khusus agar controller dapat membedakan body terlalu besar dari JSON yang tidak valid.

### Timeout request

Tetapkan waktu maksimum untuk menerima seluruh body. Request yang tidak selesai dalam waktu tersebut harus dihentikan.

### Pengujian

Tambahkan test untuk:

- Body JSON normal.
- Body kosong.
- JSON tidak valid.
- Body melebihi batas ukuran.
- Request yang terputus setelah sebagian chunk.
- Request yang mengirim data terlalu lambat.
- Beberapa request bermasalah secara bersamaan.

## Acceptance Criteria

Issue dianggap selesai jika:

- Body di atas batas maksimum ditolak.
- Request lambat melewati timeout dihentikan.
- Request yang memicu `aborted`, `error`, atau `close` tidak membuat Promise menggantung.
- Listener dibersihkan setelah request selesai atau gagal.
- Response tidak ditulis ke koneksi yang sudah dihancurkan.
- Endpoint CRUD tetap berjalan normal setelah pengujian error.
- Pengujian menunjukkan memory tidak terus meningkat setelah request bermasalah selesai.

## Catatan Implementasi Saat Ini

Penanganan berikut sudah tersedia di `server/utils/http.js`:

- Promise hanya dapat diselesaikan satu kali melalui `settle()`.
- Listener dibersihkan melalui `cleanup()`.
- Event `aborted`, `error`, dan `close` ditangani.
- `sendJson()` memeriksa `response.destroyed` dan `response.writableEnded`.

Pekerjaan yang tersisa adalah menambahkan batas ukuran body dan timeout request.
