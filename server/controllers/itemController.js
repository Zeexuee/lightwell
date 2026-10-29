// readJson membaca body request, sedangkan sendJson mengirim response.
const { readJson, sendJson } = require('../utils/http');

// Service menyimpan logika data item.
const itemService = require('../services/itemService');

// Controller READ tidak mengolah data sendiri.
// Ia meminta data kepada service, lalu membungkusnya dalam response API.
function listItems(request, response) {
	sendJson(response, 200, { data: itemService.getItems() });
}

// Controller CREATE menerima data dari client, meneruskannya ke service,
// lalu mengembalikan item baru dengan status HTTP 201 (Created).
async function createItem(request, response) {
	try {
		// Body request dibaca secara asynchronous karena data dapat datang bertahap.
		const body = await readJson(request);

		// Controller tidak membuat ID atau memanipulasi array.
		// Tanggung jawab tersebut berada di itemService.
		const item = itemService.createItem(body.name);
		sendJson(response, 201, { data: item });
	} catch (error) {
		sendJson(response, 400, { error: error.message });
	}
}

// Controller UPDATE membaca ID dari router dan data baru dari body request.
async function updateItem(request, response, itemId) {
	try {
		const body = await readJson(request);
		const item = itemService.updateItem(itemId, body.name);

		// Service mengembalikan null jika ID tidak ditemukan.
		if (!item) {
			sendJson(response, 404, { error: 'Item tidak ditemukan' });
			return;
		}

		// Jika berhasil, kirim item yang sudah diperbarui.
		sendJson(response, 200, { data: item });
	} catch (error) {
		sendJson(response, 400, { error: error.message });
	}
}

// Controller DELETE tidak membutuhkan body request.
// Ia hanya meneruskan ID ke service dan mengembalikan item yang dihapus.
function removeItem(request, response, itemId) {
	const item = itemService.deleteItem(itemId);

	if (!item) {
		sendJson(response, 404, { error: 'Item tidak ditemukan' });
		return;
	}

	sendJson(response, 200, { data: item });
}

// Export membuat fungsi controller dapat dipanggil oleh router.
module.exports = { createItem, listItems, removeItem, updateItem };