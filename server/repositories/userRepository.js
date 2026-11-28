const memoryUserRepository = require('./memoryUserRepository');
const mysqlUserRepository = require('./mysqlUserRepository');

const driver = process.env.DB_DRIVER || 'memory';
const repository = driver === 'mysql' ? mysqlUserRepository : memoryUserRepository;

module.exports = {
	create: (data) => repository.create(data),
	findByEmail: (email) => repository.findByEmail(email),
	findById: (id) => repository.findById(id)
};
