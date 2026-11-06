// Semua komunikasi dengan backend ditempatkan di sini.
// File lain cukup memanggil requestApi() tanpa mengulang kode fetch.
export async function requestApi(path, options = {}) {
	const response = await fetch(path, {
		headers: {
			'Content-Type': 'application/json',
			...options.headers
		},
		...options
	});

	const result = await response.json();

	if (!response.ok) {
		throw new Error(result.error || 'Request gagal diproses');
	}

	return result;
}