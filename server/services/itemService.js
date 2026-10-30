// ------------- Halaman ini berisikan fungsi CRUD ------------ 
// ------------- contoh logika bisnis CRUD -------------

// Untuk sementara, data disimpan di array.
// Nanti array ini dapat diganti dengan query database tanpa mengubah controller.
let items = [];

// ID sederhana untuk latihan. Database biasanya menangani ID secara otomatis.
let nextId = 1;

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
	return items;
}

// CREATE: validasi nama, buat object baru, simpan ke array, lalu kembalikan object.
function createItem(name) {
	const item = { id: nextId++, name: validateName(name) };
	items.push(item);
	return item;
}

// UPDATE: cari item berdasarkan ID.
// null digunakan sebagai tanda bahwa item dengan ID tersebut tidak ada.
function updateItem(id, name) {
	const item = items.find((currentItem) => currentItem.id === id);

	if (!item) {
		return null;
	}

	// Object yang ditemukan diubah langsung di dalam array.
	item.name = validateName(name);
	return item;
}

// DELETE: cari posisi item agar dapat dihapus menggunakan splice().
function deleteItem(id) {
	const itemIndex = items.findIndex((currentItem) => currentItem.id === id);

	if (itemIndex === -1) {
		return null;
	}

	// splice menghapus item dari array dan mengembalikan array item yang dihapus.
	// [0] mengambil object item pertama dari hasil tersebut.
	return items.splice(itemIndex, 1)[0];
}

// Export membuat fungsi service tersedia untuk controller.
module.exports = { createItem, deleteItem, getItems, updateItem };