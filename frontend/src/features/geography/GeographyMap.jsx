import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useMemo } from 'react';
import { GeoJSON, MapContainer, TileLayer } from 'react-leaflet';
import styles from './GeographyMap.module.css';

const TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
const BOUNDARY_STYLE = { color: '#a8483a', weight: 2.5, fill: false };

export default function GeographyMap({ unit }) {
  const feature = useMemo(
    () => ({ type: 'Feature', properties: {}, geometry: unit.geometry }),
    [unit.geometry],
  );
  const bounds = useMemo(() => L.geoJSON(feature).getBounds(), [feature]);

  return (
    <div className={styles.frame} role="region" aria-label={`Map showing the outline of ${unit.geographyName}`}>
      <MapContainer
        className={styles.map}
        bounds={bounds}
        boundsOptions={{ padding: [24, 24] }}
        scrollWheelZoom={false}
      >
        <TileLayer
          url={TILE_URL}
          attribution={TILE_ATTRIBUTION}
          maxZoom={19}
          referrerPolicy="strict-origin-when-cross-origin"
        />
        <GeoJSON key={unit.boundaryVersion} data={feature} style={BOUNDARY_STYLE} interactive={false} />
      </MapContainer>
    </div>
  );
}
