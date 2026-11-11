import { ATTRIBUTION } from '../geocoding/nominatim.js';

export async function searchPlaces(req, res) {
  const { value, cached } = await req.app.locals.geocoder.search(req.validatedQuery.q);
  res.json({ data: value, meta: { ...ATTRIBUTION, cached } });
}

export async function reversePlace(req, res) {
  const { lat, lon } = req.validatedQuery;
  const { value, cached } = await req.app.locals.geocoder.reverse(lat, lon);
  res.json({ data: value, meta: { ...ATTRIBUTION, cached } });
}
