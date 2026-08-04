import client from './client';

export function getDashboard() {
  return client.get('/laporan/dashboard').then((res) => res.data.data);
}

export function getLabaPerUnit(params) {
  return client.get('/laporan/laba-per-unit', { params }).then((res) => res.data.data);
}

export function getBulanan(params) {
  return client.get('/laporan/bulanan', { params }).then((res) => res.data.data);
}

/**
 * Download file export (Excel/PDF). Endpoint export butuh header
 * Authorization, jadi tidak bisa pakai <a href> biasa — harus fetch lewat
 * axios (responseType 'blob') lalu trigger download manual.
 */
export async function downloadExport(path, params, filename) {
  const res = await client.get(path, { params, responseType: 'blob' });
  const url = window.URL.createObjectURL(new Blob([res.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}
