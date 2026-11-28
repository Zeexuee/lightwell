import { requestApi } from './api.js';

const form = document.querySelector('#auth-form');
const title = document.querySelector('#auth-title');
const nameField = document.querySelector('#name-field');
const nameInput = document.querySelector('#name');
const emailInput = document.querySelector('#email');
const passwordInput = document.querySelector('#password');
const submitButton = document.querySelector('#auth-submit');
const loginTab = document.querySelector('#login-tab');
const registerTab = document.querySelector('#register-tab');
const feedback = document.querySelector('#auth-feedback');

let mode = 'login';

function setMode(nextMode) {
	mode = nextMode;
	const isRegister = mode === 'register';

	title.textContent = isRegister ? 'Daftar akun' : 'Masuk';
	submitButton.textContent = isRegister ? 'Buat akun' : 'Masuk';
	nameField.classList.toggle('hidden', !isRegister);
	nameInput.required = isRegister;
	passwordInput.autocomplete = isRegister ? 'new-password' : 'current-password';
	loginTab.classList.toggle('active', !isRegister);
	registerTab.classList.toggle('active', isRegister);
	feedback.textContent = '';
}

loginTab.addEventListener('click', () => setMode('login'));
registerTab.addEventListener('click', () => setMode('register'));

form.addEventListener('submit', async (event) => {
	event.preventDefault();
	submitButton.disabled = true;
	feedback.classList.remove('error');
	feedback.textContent = 'Memproses...';

	const body = {
		email: emailInput.value.trim(),
		password: passwordInput.value
	};

	if (mode === 'register') {
		body.name = nameInput.value.trim();
	}

	try {
		const path = mode === 'register' ? '/api/auth/register' : '/api/auth/login';
		const result = await requestApi(path, {
			method: 'POST',
			body: JSON.stringify(body)
		});

		localStorage.setItem('lightwell_token', result.data.token);
		window.location.href = '/';
	} catch (error) {
		feedback.textContent = error.message;
		feedback.classList.add('error');
	} finally {
		submitButton.disabled = false;
	}
});

if (localStorage.getItem('lightwell_token')) {
	window.location.href = '/';
}
