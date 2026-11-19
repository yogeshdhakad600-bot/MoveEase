import api from './api';

export const getRouteDistance = (from, to) =>
  api.get('/maps/route', { params: { from, to } }).then((r) => r.data);
