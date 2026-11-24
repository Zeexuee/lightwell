// Repository memory dipakai saat DB_DRIVER tidak disetel ke mysql.
// Data hilang saat server restart, tetapi alur sistem tetap sama.
let items = [];
let nextId = 1;

async function findAll() {
	return [...items];
}

async function create(data) {
	const item = { id: nextId++, ...data };
	items.push(item);
	return item;
}

async function update(id, data) {
	const item = items.find((currentItem) => currentItem.id === id);

	if (!item) {
		return null;
	}

	Object.assign(item, data);
	return item;
}

async function remove(id) {
	const itemIndex = items.findIndex((currentItem) => currentItem.id === id);

	if (itemIndex === -1) {
		return null;
	}

	return items.splice(itemIndex, 1)[0];
}

module.exports = { create, findAll, remove, update };
