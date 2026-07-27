import client from './client';

export function listPengeluaran(params) {
  return client.get('/pengeluaran', { params }).then((res) => res.data);
}

export function createPengeluaran(data) {
  return client.post('/pengeluaran', data).then((res) => res.data.data);
}

export function updatePengeluaran(id, data) {
  return client.put(`/pengeluaran/${id}`, data).then((res) => res.data.data);
}

export function deletePengeluaran(id) {
  return client.delete(`/pengeluaran/${id}`);
}
