import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useMemo } from 'react';
import { CircleMarker, GeoJSON, MapContainer, ScaleControl, TileLayer, useMap, useMapEvents, ZoomControl } from 'react-leaflet';
import { DistrictLayer } from '../districts/DistrictLayer';
import { IncidentMarkers } from '../map/IncidentMarkers';
import { DELHI_CENTRE, DELHI_REGION_BOUNDS } from '../map/geo';
import styles from './GeographyMap.module.css';
import { tileConfig } from './tiles';

const TILES = tileConfig();
const OUTLINE_STYLE = { color: '#a8483a', weight: 2, opacity: 0.85, fill: false, dashArray: '6 4' };
const SELECTED_STYLE = { color: '#26211c', weight: 2, fillColor: '#ffffff', fillOpacity: 1 };
const reducedMotion = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

function MapEvents({ onSelect, onReady }) {
  const map = useMapEvents({ click: (event) => onSelect({ lat: event.latlng.lat, lng: event.latlng.lng }) });
  useEffect(() => { onReady?.(map); }, [map, onReady]);
  return null;
}

// Fits the Delhi outline once, when it first loads.
function InitialFit({ bounds }) {
  const map = useMap();
  useEffect(() => {
    if (bounds) map.fitBounds(bounds, { padding: [24, 24], animate: false });
  }, [map, bounds]);
  return null;
}

function FlyTo({ target }) {
  const map = useMap();
  useEffect(() => {
    if (!target) return;
    const animate = !reducedMotion();
    if (target.boundingBox) {
      const { south, west, north, east } = target.boundingBox;
      map.flyToBounds([[south, west], [north, east]], { maxZoom: target.maxZoom ?? 17, animate, duration: 0.8, ...(target.padding ?? {}) });
    } else {
      map.flyTo([target.lat, target.lng], target.zoom ?? 16, { animate, duration: 0.8 });
    }
  }, [map, target]);
  return null;
}

// Keeps Leaflet's size in step with its container, for example while the pinned navigation
// slides in and the map narrows. The view centre is kept, so the map does not jump.
function ResizeWatcher() {
  const map = useMap();
  useEffect(() => {
    const container = map.getContainer?.();
    if (!container || typeof ResizeObserver === 'undefined') return undefined;
    let frame = 0;
    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => map.invalidateSize({ pan: true, animate: false }));
    });
    observer.observe(container);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [map]);
  return null;
}

// The map canvas. It draws only verified context, published district figures and eligible
// records; it never invents data.
export default function GeographyMap({ outline, showOutline, baseStyle, incidents, selected, flyTarget, onSelect, onReady, districts }) {
  const feature = useMemo(() => (outline ? { type: 'Feature', properties: {}, geometry: outline.geometry } : null), [outline]);
  const bounds = useMemo(() => (feature ? L.geoJSON(feature).getBounds() : null), [feature]);

  return (
    <div className={`${styles.frame} ${baseStyle === 'muted' ? styles.muted : ''}`} data-base-style={baseStyle}>
      <MapContainer
        className={styles.map}
        center={[DELHI_CENTRE.lat, DELHI_CENTRE.lng]}
        zoom={11}
        minZoom={9}
        maxBounds={DELHI_REGION_BOUNDS}
        maxBoundsViscosity={0.8}
        zoomControl={false}
        keyboard
      >
        <TileLayer url={TILES.url} attribution={TILES.attribution} maxZoom={TILES.maxZoom} referrerPolicy="strict-origin-when-cross-origin" />
        <ZoomControl position="bottomright" />
        <ScaleControl position="bottomleft" imperial={false} />
        {districts && <DistrictLayer {...districts} />}
        {feature && showOutline && <GeoJSON key={outline.boundaryVersion} data={feature} style={OUTLINE_STYLE} interactive={false} />}
        <IncidentMarkers records={incidents} />
        {selected && <CircleMarker center={[selected.lat, selected.lng]} radius={7} pathOptions={SELECTED_STYLE} interactive={false} />}
        <MapEvents onSelect={onSelect} onReady={onReady} />
        <InitialFit bounds={bounds} />
        <ResizeWatcher />
        <FlyTo target={flyTarget} />
      </MapContainer>
    </div>
  );
}
