// Small geometry helpers for GeoJSON in [longitude, latitude] order.
export const DELHI_CENTRE = { lat: 28.6139, lng: 77.209 };
export const DELHI_REGION_BOUNDS = [[28.2, 76.6], [29.1, 77.6]];

// The area the place-name service accepts. The map can show slightly more on small screens.
export const inDelhiRegion = ({ lat, lng }) => {
  const [[south, west], [north, east]] = DELHI_REGION_BOUNDS;
  return lat >= south && lat <= north && lng >= west && lng <= east;
};

function insideRing([x, y], ring) {
  let hit = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i, i += 1) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) hit = !hit;
  }
  return hit;
}

export function pointInGeometry({ lat, lng }, geometry) {
  if (!geometry) return null;
  const polygons = geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.type === 'MultiPolygon' ? geometry.coordinates : [];
  const point = [lng, lat];
  return polygons.some(([outer, ...holes]) => insideRing(point, outer) && !holes.some((hole) => insideRing(point, hole)));
}

export const formatCoordinate = (value, positive, negative) => `${Math.abs(value).toFixed(5)}° ${value >= 0 ? positive : negative}`;
