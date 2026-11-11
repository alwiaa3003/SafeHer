import { CircleMarker, Tooltip } from 'react-leaflet';
import { eligibleIncidents } from './incidents';

export const INCIDENT_STYLE = { color: '#ffffff', weight: 1.5, fillColor: '#b4483a', fillOpacity: 0.85 };

// Renders only records that pass every eligibility rule. Today that is none.
export function IncidentMarkers({ records = [] }) {
  return eligibleIncidents(records).map((record) => (
    <CircleMarker
      key={record.id}
      center={[record.location.coordinates[1], record.location.coordinates[0]]}
      radius={6}
      pathOptions={INCIDENT_STYLE}
    >
      <Tooltip>{record.categoryLabelOriginal}</Tooltip>
    </CircleMarker>
  ));
}
