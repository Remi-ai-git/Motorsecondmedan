import client from './client';

export function listPenjualan(params) {
  return client.get('/penjualan', { params }).then((res) => res.data);
}

export function getPenjualan(id) {
  return client.get(`/penjualan/${id}`).then((res) => res.data.data);
}

export function createPenjualan(data) {
  return client.post('/penjualan', data).then((res) => res.data.data);
}

export function updatePenjualan(id, data) {
  return client.put(`/penjualan/${id}`, data).then((res) => res.data.data);
}

export function deletePenjualan(id) {
  return client.delete(`/penjualan/${id}`);
}
