// Repository adalah satu-satunya bagian yang mengetahui cara data disimpan.
// Saat ini penyimpanannya masih array agar kita dapat belajar tanpa database.
// Nanti fungsi yang sama dapat diubah menjadi query MySQL.
let items = [];
let nextId = 1;

// Mengembalikan salinan array agar caller tidak dapat mengubah penyimpanan
// secara langsung tanpa melalui fungsi repository.
function findAll() {
	return [...items];
}

// Membuat ID dan menyimpan record baru.
function create(data) {
	const item = { id: nextId++, ...data };
	items.push(item);
	return item;
}

// Mengubah record berdasarkan ID. Null berarti record tidak ditemukan.
function update(id, data) {
	const item = items.find((currentItem) => currentItem.id === id);

	if (!item) {
		return null;
	}

	Object.assign(item, data);
	return item;
}

// Menghapus record berdasarkan ID dan mengembalikan record yang dihapus.
function remove(id) {
	const itemIndex = items.findIndex((currentItem) => currentItem.id === id);

	if (itemIndex === -1) {
		return null;
	}

	return items.splice(itemIndex, 1)[0];
}

module.exports = { create, findAll, remove, update };