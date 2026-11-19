import api from './api';

export const addFeedback = (payload) => api.post('/reviews', payload).then((r) => r.data);
export const myFeedback = () => api.get('/reviews/mine').then((r) => r.data);