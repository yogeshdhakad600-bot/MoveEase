import api from './api';

export const myDeliveries = () => api.get('/driver/deliveries').then((r) => r.data);
export const updateStatus = (bookingId, payload) => api.patch(`/tracking/${bookingId}`, payload).then((r) => r.data);
export const uploadProof = (bookingId, payload) => api.patch(`/driver/deliveries/${bookingId}/proof`, payload).then((r) => r.data);
