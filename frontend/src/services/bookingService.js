import api from './api';

export const getVehicles = () => api.get('/vehicles').then((r) => r.data);
export const getQuote = (payload) => api.post('/quote', payload).then((r) => r.data);
export const createBooking = (payload) => api.post('/bookings', payload).then((r) => r.data);
export const myBookings = () => api.get('/bookings/mine').then((r) => r.data);
export const getBooking = (bookingId) => api.get(`/bookings/${bookingId}`).then((r) => r.data);
export const cancelBooking = (bookingId) => api.patch(`/bookings/${bookingId}/cancel`).then((r) => r.data);
export const trackBooking = (bookingId) => api.get(`/tracking/${bookingId}`).then((r) => r.data);
export const payForBooking = (payload) => api.post('/payments', payload).then((r) => r.data);
export const myPayments = () => api.get('/payments/mine').then((r) => r.data);
export const listReviews = () => api.get('/reviews').then((r) => r.data);
export const addReview = (payload) => api.post('/reviews', payload).then((r) => r.data);
export const createTicket = (payload) => api.post('/support', payload).then((r) => r.data);
export const myTickets = () => api.get('/support/mine').then((r) => r.data);
export const deleteSupportTicket = (id) => api.delete(`/support/${id}`).then((r) => r.data);
