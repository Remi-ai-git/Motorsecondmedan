import client from './client';

export function listMotors(params) {
  return client.get('/motors', { params }).then((res) => res.data);
}

export function getMotor(id) {
  return client.get(`/motors/${id}`).then((res) => res.data.data);
}

export function createMotor(data) {
  return client.post('/motors', data).then((res) => res.data.data);
}

export function updateMotor(id, data) {
  return client.put(`/motors/${id}`, data).then((res) => res.data.data);
}

export function deleteMotor(id) {
  return client.delete(`/motors/${id}`);
}

export function addBiayaPerbaikan(motorId, data) {
  return client.post(`/motors/${motorId}/biaya-perbaikan`, data).then((res) => res.data.data);
}

export function deleteBiayaPerbaikan(motorId, biayaId) {
  return client.delete(`/motors/${motorId}/biaya-perbaikan/${biayaId}`);
}
