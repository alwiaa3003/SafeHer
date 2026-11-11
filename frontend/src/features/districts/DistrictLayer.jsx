import { useCallback, useEffect, useRef } from 'react';
import { GeoJSON } from 'react-leaflet';
import { fillFor, formatCount, MISSING_FILL } from './districtScale';

const BASE = { weight: 1.2, color: '#ffffff', opacity: 1, fillOpacity: 0.82, dashArray: null };
const MISSING = { color: '#8e857c', dashArray: '4 3' };
const HOVER = { weight: 3, color: '#26211c' };
const SELECTED = { weight: 3.5, color: '#26211c', dashArray: null };

const escapeHtml = (text) => String(text).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

export function districtStyle({ value, scale, selected }) {
  const fill = fillFor(scale, value);
  return { ...BASE, fillColor: fill, ...(fill === MISSING_FILL ? MISSING : {}), ...(selected ? SELECTED : {}) };
}

export function tooltipHtml(name, value) {
  const figure = Number.isInteger(value) ? `${formatCount(value)} registered cases` : 'No validated figure';
  return `<strong>${escapeHtml(name)}</strong><br>${figure}`;
}

// Police-district polygons filled by the selected view's registered-case counts.
// Districts without a validated figure are grey with a dashed edge, never shown as zero.
export function DistrictLayer({ boundaries, valuesByCode, scale, viewKey, selectedCode, onSelect }) {
  const style = useCallback(
    (feature) => districtStyle({
      value: valuesByCode.get(feature.properties.code) ?? null,
      scale,
      selected: feature.properties.code === selectedCode,
    }),
    [valuesByCode, scale, selectedCode],
  );

  // Hover handlers are bound once per view; they read the latest style and selection here.
  const latest = useRef({ style, selectedCode, onSelect });
  useEffect(() => {
    latest.current = { style, selectedCode, onSelect };
  }, [style, selectedCode, onSelect]);

  const onEachFeature = useCallback((feature, layer) => {
    const { code, name } = feature.properties;
    layer.bindTooltip(tooltipHtml(name, valuesByCode.get(code) ?? null), { sticky: true, direction: 'top', className: 'district-tooltip' });
    layer.on({
      mouseover: () => {
        if (code !== latest.current.selectedCode) layer.setStyle(HOVER);
      },
      mouseout: () => layer.setStyle(latest.current.style(feature)),
      click: (event) => latest.current.onSelect(code, event?.latlng),
    });
  }, [valuesByCode]);

  if (!boundaries?.features?.length) return null;
  // Re-created when the year or category changes, so tooltips always show the current figure.
  return <GeoJSON key={viewKey} data={boundaries} style={style} onEachFeature={onEachFeature} bubblingMouseEvents={false} />;
}
