// readJson membaca body request, sedangkan sendJson mengirim response.
const { readJson, sendJson } = require('../utils/http');

// Service menyimpan logika data item.
const itemService = require('../services/itemService');

// Controller READ tidak mengolah data sendiri.
// Ia meminta data kepada service, lalu membungkusnya dalam response API.
async function listItems(request, response) {
	try {
		const items = await itemService.getItems();
		sendJson(response, 200, { data: items });
	} catch (error) {
		sendJson(response, error.statusCode || 500, { error: error.message });
	}
}

// Controller CREATE menerima data dari client, meneruskannya ke service,
// lalu mengembalikan item baru dengan status HTTP 201 (Created).
async function createItem(request, response) {
	try {
		// Body request dibaca secara asynchronous karena data dapat datang bertahap.
		const body = await readJson(request);

		// Controller tidak membuat ID atau memanipulasi array.
		// Tanggung jawab tersebut berada di itemService.
		const item = await itemService.createItem(body.name);
		sendJson(response, 201, { data: item });
	} catch (error) {
		sendJson(response, error.statusCode || 400, { error: error.message });
	}
}

// Controller UPDATE membaca ID dari router dan data baru dari body request.
async function updateItem(request, response, itemId) {
	try {
		const body = await readJson(request);
		const item = await itemService.updateItem(itemId, body.name);

		// Service mengembalikan null jika ID tidak ditemukan.
		if (!item) {
			sendJson(response, 404, { error: 'Item tidak ditemukan' });
			return;
		}

		// Jika berhasil, kirim item yang sudah diperbarui.
		sendJson(response, 200, { data: item });
	} catch (error) {
		sendJson(response, error.statusCode || 400, { error: error.message });
	}
}

// Controller DELETE tidak membutuhkan body request.
// Ia hanya meneruskan ID ke service dan mengembalikan item yang dihapus.
async function removeItem(request, response, itemId) {
	try {
		const item = await itemService.deleteItem(itemId);

		if (!item) {
			sendJson(response, 404, { error: 'Item tidak ditemukan' });
			return;
		}

		sendJson(response, 200, { data: item });
	} catch (error) {
		sendJson(response, error.statusCode || 500, { error: error.message });
	}
}

// Export membuat fungsi controller dapat dipanggil oleh router.
module.exports = { createItem, listItems, removeItem, updateItem };