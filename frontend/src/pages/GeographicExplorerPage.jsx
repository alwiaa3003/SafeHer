import { Crosshair, Layers, ListFilter } from 'lucide-react';
import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DistrictLegend } from '../features/districts/DistrictLegend';
import { DistrictPanel } from '../features/districts/DistrictPanel';
import { buildScale, formatCount, valueFor } from '../features/districts/districtScale';
import { DistrictTable } from '../features/districts/DistrictTable';
import districtStyles from '../features/districts/Districts.module.css';
import { useDistrictData } from '../features/districts/useDistrictData';
import { useDelhiBoundary } from '../features/geography/useDelhiBoundary';
import { CategoryPanel } from '../features/map/CategoryPanel';
import { formatCoordinate, pointInGeometry } from '../features/map/geo';
import { eligibleIncidents, useIncidentRecords } from '../features/map/incidents';
import { LayerPanel } from '../features/map/LayerPanel';
import { LocationPanel } from '../features/map/LocationPanel';
import { MapPopover } from '../features/map/MapPopover';
import { SearchBox } from '../features/map/SearchBox';
import styles from '../features/map/MapExplorer.module.css';

// Leaflet is only downloaded when this page is opened.
const GeographyMap = lazy(() => import('../features/geography/GeographyMap'));

const MOBILE_QUERY = '(max-width: 800px)';
const isMobile = () => Boolean(window.matchMedia?.(MOBILE_QUERY).matches);
const reducedMotion = () => Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);
const EMPTY = new Map();

// Map padding that keeps a point or district clear of the floating search bar and tools and of
// the details panel. On phones the top is measured from the tools, which wrap below search.
function viewPadding(map) {
  const size = map.getSize?.();
  if (!size) return null;
  if (isMobile()) {
    const tools = document.querySelector('[data-map-top-row]')?.getBoundingClientRect();
    const mapTop = map.getContainer?.().getBoundingClientRect().top ?? 0;
    const top = tools ? Math.max(132, Math.round(tools.bottom - mapTop + 16)) : 132;
    return { paddingTopLeft: [16, top], paddingBottomRight: [16, Math.round(size.y * 0.6) + 16] };
  }
  return { paddingTopLeft: [Math.min(440, size.x * 0.45), 96], paddingBottomRight: [72, 48] };
}

function boundsOf(geometry) {
  const polygons = geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates;
  let south = 90; let west = 180; let north = -90; let east = -180;
  for (const polygon of polygons) {
    for (const [lng, lat] of polygon[0]) {
      south = Math.min(south, lat); north = Math.max(north, lat);
      west = Math.min(west, lng); east = Math.max(east, lng);
    }
  }
  return { south, west, north, east };
}

function YearControl({ years, value, onChange }) {
  if (!years?.length) return null;
  return (
    <div className={districtStyles.years} role="group" aria-label="Year">
      {years.map((y) => (
        <button key={y} type="button" className={districtStyles.yearButton} aria-pressed={y === value} onClick={() => onChange(y)}>{y}</button>
      ))}
    </div>
  );
}

export function GeographicExplorerPage() {
  const outline = useDelhiBoundary();
  const incidents = useIncidentRecords();
  const eligible = eligibleIncidents(incidents.records);
  const [category, setCategory] = useState('total');
  const { meta, boundaries, statistics } = useDistrictData(category);
  const [chosenYear, setChosenYear] = useState(null);
  const [baseStyle, setBaseStyle] = useState('muted');
  const [showOutline, setShowOutline] = useState(true);
  const [showDistricts, setShowDistricts] = useState(true);
  const [selection, setSelection] = useState(null);
  const [flyTarget, setFlyTarget] = useState(null);
  const [panel, setPanel] = useState(null);
  const [sheetExpanded, setSheetExpanded] = useState(true);
  const [legendCollapsed, setLegendCollapsed] = useState(isMobile);
  const mapRef = useRef(null);
  const layersButton = useRef(null);
  const categoriesButton = useRef(null);
  const centreButton = useRef(null);
  const tableButton = useRef(null);

  useEffect(() => {
    document.title = 'Crime Map · SafeHer';
  }, []);

  const info = meta.status === 'ready' ? meta.data : null;
  const years = info?.years ?? [];
  const year = chosenYear ?? years[years.length - 1] ?? null;
  const currentCategory = info?.categories.find((c) => c.key === category) ?? null;
  const boundary = boundaries.status === 'ready' ? boundaries.data.meta.boundary : info?.boundary ?? null;
  const features = useMemo(() => (boundaries.status === 'ready' ? boundaries.data : null), [boundaries.status, boundaries.data]);
  const hasPolygons = Boolean(features?.features.length);
  const stats = statistics.status === 'ready' ? statistics.data : null;

  const valuesByCode = useMemo(() => {
    if (!stats || year === null) return EMPTY;
    return new Map(stats.districts.map((d) => [d.code, valueFor(d, year)?.registeredCases ?? null]));
  }, [stats, year]);
  const scale = useMemo(() => {
    const codes = info?.districts.map((d) => d.code) ?? [];
    return buildScale(codes.map((code) => valuesByCode.get(code) ?? null));
  }, [info, valuesByCode]);

  const onReady = useCallback((map) => { mapRef.current = map; }, []);
  const closePanel = useCallback(() => setPanel(null), []);
  const toggle = (name) => setPanel((open) => (open === name ? null : name));

  const districtAt = (point) => {
    if (!hasPolygons || !showDistricts) return null;
    return features.features.find((f) => pointInGeometry(point, f.geometry))?.properties.code ?? null;
  };

  function select(next) {
    setSelection(next);
    if (next) setSheetExpanded(true);
  }

  function flyToDistrict(code) {
    const feature = features?.features.find((f) => f.properties.code === code);
    if (!feature) return;
    const padding = mapRef.current ? viewPadding(mapRef.current) : null;
    setFlyTarget({ boundingBox: boundsOf(feature.geometry), padding, maxZoom: 13 });
  }

  const selectDistrict = useCallback((code, extra = {}) => {
    setSelection({ kind: 'district', code, ...extra });
    setSheetExpanded(true);
  }, []);

  // A clicked point that would end up behind the panel or sheet is brought into view.
  function selectOnMap(point) {
    select({ kind: 'point', ...point });
    const map = mapRef.current;
    const padding = map && viewPadding(map);
    if (!padding || !map.panInside) return;
    const mobile = isMobile();
    map.panInside([point.lat, point.lng], { ...padding, animate: !mobile && !reducedMotion() });
    if (!mobile || !map.latLngToContainerPoint) return;
    const { y } = map.latLngToContainerPoint([point.lat, point.lng]);
    if (y > map.getSize().y * 0.42 - 12) setSheetExpanded(false);
  }

  function chooseResult(result) {
    const point = { lat: result.latitude, lng: result.longitude };
    const code = districtAt(point);
    if (code) selectDistrict(code, { point, note: `${result.name} lies in this police district. The figure is for the whole district, not this place.` });
    else select({ kind: 'point', ...point });
    const padding = mapRef.current ? viewPadding(mapRef.current) : null;
    setFlyTarget(result.boundingBox ? { boundingBox: result.boundingBox, padding } : { lat: result.latitude, lng: result.longitude });
  }

  // On phones the details sheet covers the lower part of the map. As for a tapped point, the
  // tapped place is panned clear of the sheet; where the map cannot pan that far (it is kept
  // within the Delhi region), the sheet opens collapsed. Wide screens keep the user's view.
  function selectDistrictOnMap(code, latlng) {
    selectDistrict(code);
    const map = mapRef.current;
    if (!isMobile() || !latlng || !map?.panInside) return;
    const padding = viewPadding(map);
    map.panInside([latlng.lat, latlng.lng], { ...padding, animate: false });
    if (!map.latLngToContainerPoint) return;
    const { y } = map.latLngToContainerPoint([latlng.lat, latlng.lng]);
    if (y > map.getSize().y * 0.42 - 12) setSheetExpanded(false);
  }

  function chooseDistrict(code) {
    selectDistrict(code);
    flyToDistrict(code);
  }

  function chooseFromTable(code) {
    setPanel(null);
    selectDistrict(code);
    flyToDistrict(code);
  }

  function useCentre() {
    const centre = mapRef.current?.getCenter();
    if (!centre) return;
    const point = { lat: centre.lat, lng: centre.lng };
    const code = districtAt(point);
    if (code) selectDistrict(code, { point });
    else select({ kind: 'point', ...point });
  }

  function closeSelection() {
    select(null);
    centreButton.current?.focus();
  }

  const selectedUnit = selection?.kind === 'district' ? info?.districts.find((d) => d.code === selection.code) : null;
  const selectedStats = selectedUnit ? stats?.districts.find((d) => d.code === selectedUnit.code) ?? { code: selectedUnit.code, values: [] } : null;
  const markerPoint = selection?.kind === 'point' ? selection : selection?.point ?? null;
  const pointDistrict = selection?.kind === 'point' ? districtAt(selection) : null;

  let announcement = '';
  if (selectedUnit && year !== null) {
    const value = valuesByCode.get(selectedUnit.code);
    announcement = `${selectedUnit.label} police district selected. ${Number.isInteger(value) ? `${formatCount(value)} registered cases` : 'No validated figure'} in ${year}.`;
  } else if (selection?.kind === 'point') {
    announcement = `Location selected at ${formatCoordinate(selection.lat, 'N', 'S')}, ${formatCoordinate(selection.lng, 'E', 'W')}. Details are shown in the location panel.`;
  }

  const showBoundaryNotice = info && boundaries.status === 'ready' && !hasPolygons && !selection && panel !== 'table';

  // The floating controls come first in the document so keyboard users reach search
  // before the map; the map is drawn beneath them.
  return (
    <div className={styles.page} data-selected={selection ? 'true' : 'false'} data-sheet={sheetExpanded ? 'expanded' : 'collapsed'}>
      <h1 className={styles.visuallyHidden}>Crime Map</h1>
      <div className={styles.overlay}>
        <div className={styles.topRow} data-map-top-row="">
          <div className={styles.searchSlot}>
            <SearchBox onChoose={chooseResult} districts={info?.districts ?? []} onChooseDistrict={chooseDistrict} />
          </div>
          <div className={styles.toolbar} role="toolbar" aria-label="Map tools">
            <YearControl years={years} value={year} onChange={setChosenYear} />
            <button ref={categoriesButton} type="button" className={styles.toolbarButton} aria-expanded={panel === 'categories'} aria-controls="categories-panel" onClick={() => toggle('categories')}>
              <ListFilter size={16} aria-hidden="true" /> <span className={styles.toolbarLabel}>Categories</span>
            </button>
            <button ref={layersButton} type="button" className={styles.toolbarButton} aria-expanded={panel === 'layers'} aria-controls="layers-panel" onClick={() => toggle('layers')}>
              <Layers size={16} aria-hidden="true" /> <span className={styles.toolbarLabel}>Layers</span>
            </button>
            <button ref={centreButton} type="button" className={`${styles.toolbarButton} ${styles.toolbarIcon}`} onClick={useCentre} aria-label="Select map centre" title="Select map centre">
              <Crosshair size={16} aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className={styles.stage}>
          <MapPopover id="layers-panel" title="Map layers" open={panel === 'layers'} onClose={closePanel} returnFocusTo={layersButton}>
            <LayerPanel
              baseStyle={baseStyle}
              onBaseStyle={setBaseStyle}
              showOutline={showOutline}
              onShowOutline={setShowOutline}
              outlineStatus={outline.status}
              showDistricts={showDistricts}
              onShowDistricts={setShowDistricts}
              boundary={boundary}
              hasPolygons={hasPolygons}
              eligibleCount={eligible.length}
            />
          </MapPopover>
          <MapPopover id="categories-panel" title="Crime category" open={panel === 'categories'} onClose={closePanel} returnFocusTo={categoriesButton}>
            <CategoryPanel categories={info?.categories} value={category} onChange={setCategory} />
          </MapPopover>
          <MapPopover id="table-panel" title="District figures" open={panel === 'table'} onClose={closePanel} returnFocusTo={tableButton}>
            {stats && year !== null ? (
              <DistrictTable statistics={stats} year={year} category={currentCategory} onSelect={chooseFromTable} />
            ) : (
              <p className={styles.hint}>Loading figures…</p>
            )}
          </MapPopover>

          {showBoundaryNotice && (
            <section className={districtStyles.boundaryNotice} aria-labelledby="boundary-notice-title">
              <h2 id="boundary-notice-title">District boundaries cannot be shown yet</h2>
              <p>{boundary?.reason}</p>
              <p>The NCRB figures for all 16 police districts are available as a table.</p>
              <button type="button" className={districtStyles.tableButton} onClick={() => setPanel('table')}>View district figures</button>
            </section>
          )}

          {selectedUnit && year !== null && (
            <DistrictPanel
              unit={selectedUnit}
              statistics={selectedStats}
              year={year}
              category={currentCategory}
              sources={info.sources}
              locationNote={selection.note}
              onClose={closeSelection}
              expanded={sheetExpanded}
              onToggle={() => setSheetExpanded((v) => !v)}
            />
          )}
          {selection?.kind === 'point' && (
            <LocationPanel
              selected={selection}
              outline={outline}
              eligibleCount={eligible.length}
              district={pointDistrict ? info?.districts.find((d) => d.code === pointDistrict) : null}
              districtsDrawn={hasPolygons}
              onClose={closeSelection}
              expanded={sheetExpanded}
              onToggle={() => setSheetExpanded((v) => !v)}
            />
          )}

          {info && year !== null && (
            <DistrictLegend
              scale={scale}
              year={year}
              category={currentCategory}
              boundary={boundary}
              drawn={hasPolygons && showDistricts}
              collapsed={legendCollapsed}
              onToggle={() => setLegendCollapsed((v) => !v)}
              onOpenTable={() => setPanel('table')}
              onShowYear={setChosenYear}
              tableButtonRef={tableButton}
            />
          )}
        </div>

        <p className={styles.visuallyHidden} aria-live="polite">{announcement}</p>
        {outline.status === 'loading' && <p className={styles.status} role="status">Loading the Delhi outline…</p>}
        {outline.status === 'error' && (
          <p className={styles.status} role="alert">
            The Delhi outline could not be loaded. <button type="button" className={styles.linkButton} onClick={outline.retry}>Try again</button>
          </p>
        )}
        {(meta.status === 'error' || statistics.status === 'error' || boundaries.status === 'error') && (
          <p className={styles.status} role="alert">
            District figures could not be loaded, so none are shown.{' '}
            <button type="button" className={styles.linkButton} onClick={() => { if (meta.status === 'error') meta.retry(); if (statistics.status === 'error') statistics.retry(); if (boundaries.status === 'error') boundaries.retry(); }}>Try again</button>
          </p>
        )}
      </div>

      <Suspense fallback={<p className={styles.status} role="status">Loading the map…</p>}>
        <GeographyMap
          outline={outline.status === 'ready' ? outline.unit : null}
          showOutline={showOutline}
          baseStyle={baseStyle}
          incidents={eligible}
          selected={markerPoint}
          flyTarget={flyTarget}
          onSelect={selectOnMap}
          onReady={onReady}
          districts={showDistricts && hasPolygons && stats ? {
            boundaries: features,
            valuesByCode,
            scale,
            viewKey: `${boundary?.boundaryVersion}|${year}|${category}`,
            selectedCode: selectedUnit?.code ?? null,
            onSelect: selectDistrictOnMap,
          } : null}
        />
      </Suspense>
    </div>
  );
}
