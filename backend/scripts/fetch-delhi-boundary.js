// Fetches the Delhi boundary from the OpenStreetMap API and checks its identity.
// Without --write this is a dry run and changes nothing.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  approximateAreaKm2,
  DELHI_RELATION,
  featureFromOsm,
} from '../src/geography/osmBoundary.js';

const SNAPSHOT = fileURLToPath(new URL('../data/geography/delhi-boundary.geojson', import.meta.url));
const MAX_AREA_CHANGE = 0.05;
const url = `https://api.openstreetmap.org/api/0.6/relation/${DELHI_RELATION.id}/full.json`;
const args = new Set(process.argv.slice(2));

const response = await fetch(url, { headers: { 'User-Agent': 'SafeHer-boundary-refresh/0.1' } });
if (!response.ok) throw new Error(`OSM API responded with ${response.status}`);

const feature = featureFromOsm(await response.json(), new Date().toISOString());
const area = approximateAreaKm2(feature.geometry);
const { osm } = feature.properties.provenance;
console.log(`Verified relation ${osm.elementId} version ${osm.version}, ${feature.geometry.type}, about ${area.toFixed(1)} km2`);

if (existsSync(SNAPSHOT)) {
  const current = JSON.parse(readFileSync(SNAPSHOT, 'utf8'));
  const currentArea = approximateAreaKm2(current.geometry);
  const change = Math.abs(area - currentArea) / currentArea;
  console.log(`Current snapshot: ${current.properties.boundaryVersion}. Area change: ${(change * 100).toFixed(2)}%`);
  if (change > MAX_AREA_CHANGE && !args.has('--accept-area-change')) {
    throw new Error('Area changed by more than 5%. Review the OSM edit history, then use --accept-area-change.');
  }
}

if (args.has('--write')) {
  mkdirSync(dirname(SNAPSHOT), { recursive: true });
  writeFileSync(SNAPSHOT, `${JSON.stringify(feature)}\n`);
  console.log('Snapshot written.');
} else {
  console.log('Dry run: snapshot not changed. Use --write to save it.');
}
