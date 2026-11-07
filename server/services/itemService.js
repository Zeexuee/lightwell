// ------------- Halaman ini berisikan fungsi CRUD ------------ 
// ------------- contoh logika bisnis CRUD -------------

// Service berisi aturan bisnis, sedangkan penyimpanan data berada di repository.
// Pemisahan ini memudahkan kita mengganti array dengan database nanti.
const itemRepository = require('../repositories/itemRepository');

// Validasi dan normalisasi dilakukan sebelum data disimpan.
// trim() menghapus spasi di awal dan akhir string.
function validateName(name) {
	if (typeof name !== 'string' || name.trim() === '') {
		throw new Error('name wajib diisi');
	}

	return name.trim();
}

// READ: kembalikan seluruh item yang tersimpan.
function getItems() {
	return itemRepository.findAll();
}

// CREATE: validasi nama, buat object baru, simpan ke array, lalu kembalikan object.
function createItem(name) {
	return itemRepository.create({ name: validateName(name) });
}

// UPDATE: cari item berdasarkan ID.
// null digunakan sebagai tanda bahwa item dengan ID tersebut tidak ada.
function updateItem(id, name) {
	return itemRepository.update(id, { name: validateName(name) });
}

// DELETE: cari posisi item agar dapat dihapus menggunakan splice().
function deleteItem(id) {
	return itemRepository.remove(id);
}

// Export membuat fungsi service tersedia untuk controller.
module.exports = { createItem, deleteItem, getItems, updateItem };