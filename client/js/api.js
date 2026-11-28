// Semua komunikasi dengan backend ditempatkan di sini.
// File lain cukup memanggil requestApi() tanpa mengulang kode fetch.
export async function requestApi(path, options = {}) {
	const token = localStorage.getItem('lightwell_token');

	const headers = {
		'Content-Type': 'application/json',
		...options.headers
	};

	if (token) {
		headers.Authorization = `Bearer ${token}`;
	}

	const response = await fetch(path, {
		...options,
		headers
	});

	const result = await response.json();

	if (response.status === 401 && !path.startsWith('/api/auth/login')) {
		localStorage.removeItem('lightwell_token');
		window.location.href = '/login.html';
		throw new Error(result.error || 'Sesi telah berakhir');
	}

	if (!response.ok) {
		throw new Error(result.error || 'Request gagal diproses');
	}

	return result;
}