import { requestApi } from './api.js';

const form = document.querySelector('#item-form');
const nameInput = document.querySelector('#item-name');
const submitButton = document.querySelector('#submit-button');
const cancelButton = document.querySelector('#cancel-button');
const feedback = document.querySelector('#form-feedback');
const itemList = document.querySelector('#item-list');
const itemCount = document.querySelector('#item-count');
const emptyState = document.querySelector('#empty-state');
const apiStatus = document.querySelector('#api-status');

let editingId = null;
let items = [];

function showFeedback(message, isError = false) {
	feedback.textContent = message;
	feedback.classList.toggle('error', isError);
}

function setFormMode(id = null) {
	editingId = id;
	const isEditing = id !== null;

	submitButton.textContent = isEditing ? 'Simpan perubahan' : 'Simpan item';
	cancelButton.classList.toggle('hidden', !isEditing);
}

function renderItems() {
	itemList.replaceChildren();
	itemCount.textContent = `${items.length} item${items.length === 1 ? '' : 's'}`;
	emptyState.classList.toggle('hidden', items.length > 0);

	for (const item of items) {
		const row = document.createElement('li');
		row.className = 'item-row';

		const details = document.createElement('div');
		const name = document.createElement('p');
		name.className = 'item-name';
		name.textContent = item.name;
		const id = document.createElement('span');
		id.className = 'item-id';
		id.textContent = `ID ${item.id}`;
		details.append(name, id);

		const actions = document.createElement('div');
		actions.className = 'item-actions';
		actions.append(createActionButton('Edit', 'edit', item.id));
		actions.append(createActionButton('Hapus', 'delete', item.id));

		row.append(details, actions);
		itemList.append(row);
	}
}

function createActionButton(label, action, id) {
	const button = document.createElement('button');
	button.className = `text-button ${action}`;
	button.type = 'button';
	button.dataset.action = action;
	button.dataset.id = id;
	button.textContent = label;
	return button;
}

async function loadItems() {
	try {
		const result = await requestApi('/api/items');
		items = result.data;
		renderItems();
		apiStatus.textContent = 'API terhubung';
	} catch (error) {
		apiStatus.textContent = 'API bermasalah';
		showFeedback(error.message, true);
	}
}

async function saveItem(event) {
	event.preventDefault();
	const name = nameInput.value.trim();

	if (!name) {
		showFeedback('Nama item wajib diisi.', true);
		return;
	}

	const isEditing = editingId !== null;
	const path = isEditing ? `/api/items/${editingId}` : '/api/items';
	const method = isEditing ? 'PUT' : 'POST';

	submitButton.disabled = true;
	showFeedback('Menyimpan data...');

	try {
		await requestApi(path, {
			method,
			body: JSON.stringify({ name })
		});

		form.reset();
		setFormMode();
		showFeedback(isEditing ? 'Item berhasil diperbarui.' : 'Item berhasil ditambahkan.');
		await loadItems();
	} catch (error) {
		showFeedback(error.message, true);
	} finally {
		submitButton.disabled = false;
	}
}

function startEditing(id) {
	const item = items.find((currentItem) => currentItem.id === id);

	if (!item) {
		return;
	}

	nameInput.value = item.name;
	setFormMode(id);
	nameInput.focus();
	showFeedback(`Sedang mengedit item ID ${id}.`);
}

async function deleteItem(id) {
	const item = items.find((currentItem) => currentItem.id === id);

	if (!item || !window.confirm(`Hapus item "${item.name}"?`)) {
		return;
	}

	try {
		await requestApi(`/api/items/${id}`, { method: 'DELETE' });
		showFeedback('Item berhasil dihapus.');
		await loadItems();
	} catch (error) {
		showFeedback(error.message, true);
	}
}

form.addEventListener('submit', saveItem);
cancelButton.addEventListener('click', () => {
	form.reset();
	setFormMode();
	showFeedback('Mode edit dibatalkan.');
});

itemList.addEventListener('click', (event) => {
	const button = event.target.closest('button[data-action]');

	if (!button) {
		return;
	}

	const id = Number(button.dataset.id);

	if (button.dataset.action === 'edit') {
		startEditing(id);
	} else if (button.dataset.action === 'delete') {
		deleteItem(id);
	}
});

loadItems();