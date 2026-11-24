// Repository adalah satu-satunya bagian yang mengetahui cara data disimpan.
// DB_DRIVER=memory digunakan untuk latihan tanpa database.
// DB_DRIVER=mysql akan memakai MySQL setelah server Laragon tersedia.
const memoryRepository = require('./memoryItemRepository');
const mysqlRepository = require('./mysqlItemRepository');

const driver = process.env.DB_DRIVER || 'memory';

// Service hanya memakai kontrak findAll/create/update/remove.
// Bentuk penyimpanan dapat ditukar tanpa mengubah controller atau service.
const repository = driver === 'mysql' ? mysqlRepository : memoryRepository;

module.exports = {
	create: (data) => repository.create(data),
	findAll: () => repository.findAll(),
	remove: (id) => repository.remove(id),
	update: (id, data) => repository.update(id, data)
};