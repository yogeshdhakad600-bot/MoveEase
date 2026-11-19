const USER_AGENT = process.env.GEOCODER_USER_AGENT || 'MoveEase/3.1';

async function geocode(query) {
  const searchQuery = /\bindia\b/i.test(query) ? query : `${query}, India`;
  const url = `https://photon.komoot.io/api/?limit=5&lang=en&q=${encodeURIComponent(searchQuery)}`;
  const response = await fetch(url, { headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' } });
  if (!response.ok) throw new Error('Geocoding service unavailable');
  const data = await response.json();
  const feature = data.features?.find((item) => item.properties?.countrycode?.toLowerCase() === 'in');
  if (!feature) throw new Error(`Location not found in India: ${query}`);

  const [lon, lat] = feature.geometry?.coordinates || [];
  if (!Number.isFinite(lon) || !Number.isFinite(lat)) throw new Error(`Invalid location coordinates: ${query}`);

  const { name, city, state, country } = feature.properties;
  const displayName = [...new Set([name, city, state, country].filter(Boolean))].join(', ');
  return { lat, lon, displayName };
}

exports.getRouteDistance = async (req, res, next) => {
  try {
    const { from, to } = req.query;
    if (!from || !to) return res.status(400).json({ message: 'Pickup and destination are required' });

    const [origin, destination] = await Promise.all([geocode(from), geocode(to)]);
    const routeUrl = `https://router.project-osrm.org/route/v1/driving/${origin.lon},${origin.lat};${destination.lon},${destination.lat}?overview=false`;
    const routeResponse = await fetch(routeUrl, { headers: { 'User-Agent': USER_AGENT } });
    if (!routeResponse.ok) throw new Error('Routing service unavailable');
    const routeData = await routeResponse.json();
    if (routeData.code !== 'Ok' || !routeData.routes?.[0]) throw new Error('No driving route found');

    res.json({
      distanceKm: Math.max(1, Math.round(routeData.routes[0].distance / 1000)),
      durationMinutes: Math.round(routeData.routes[0].duration / 60),
      origin,
      destination,
      provider: 'OpenStreetMap Nominatim + OSRM',
    });
  } catch (err) {
    next(err);
  }
};
