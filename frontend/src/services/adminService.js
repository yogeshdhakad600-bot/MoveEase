import api from './api';

export const getStats = () => api.get('/admin/stats').then((r) => r.data);
export const listAllBookings = () => api.get('/admin/bookings').then((r) => r.data);
export const deleteBooking = (bookingId) => api.delete(`/admin/bookings/${bookingId}`).then((r) => r.data);
export const assignDriver = (bookingId, payload) => api.patch(`/admin/bookings/${bookingId}/assign`, payload).then((r) => r.data);
export const unassignDriver = (bookingId) => api.patch(`/admin/bookings/${bookingId}/unassign`).then((r) => r.data);
export const listUsers = (role) => api.get('/admin/users', { params: { role } }).then((r) => r.data);
export const deleteUser = (userId) => api.delete(`/admin/users/${userId}`).then((r) => r.data);
export const createStaff = (payload) => api.post('/admin/staff', payload).then((r) => r.data);
export const listVehicles = () => api.get('/admin/vehicles').then((r) => r.data);
export const addVehicle = (payload) => api.post('/admin/vehicles', payload).then((r) => r.data);
export const allTickets = () => api.get('/support/all').then((r) => r.data);
export const respondTicket = (id, payload) => api.patch(`/support/${id}/respond`, payload).then((r) => r.data);
export const deleteSupportTicket = (id) => api.delete(`/support/${id}`).then((r) => r.data);
export const updateShipmentStatus = (bookingId, payload) => api.patch(`/tracking/${bookingId}`, payload).then((r) => r.data);

export const listReviews = () => api.get('/reviews/admin').then((r) => r.data);
