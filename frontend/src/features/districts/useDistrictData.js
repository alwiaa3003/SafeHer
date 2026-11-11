import { useCallback, useEffect, useState } from 'react';
import { fetchDistrictBoundaries, fetchDistrictMeta, fetchDistrictStatistics } from '../../data';

const LOADING = { status: 'loading', data: null };

function useLoad(load, key) {
  const [state, setState] = useState({ ...LOADING, key });
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (key === null) return undefined;
    const controller = new AbortController();
    load(controller.signal)
      .then((data) => setState({ status: 'ready', data, key }))
      .catch((error) => {
        if (error.name !== 'AbortError') setState({ status: 'error', data: null, key });
      });
    return () => controller.abort();
  }, [load, key, attempt]);
  const retry = useCallback(() => {
    setState({ ...LOADING, key });
    setAttempt((value) => value + 1);
  }, [key]);
  // A result for an earlier key is never shown for the current one.
  return state.key === key ? { ...state, retry } : { ...LOADING, key, retry };
}

const loadMeta = (signal) => fetchDistrictMeta({ signal });
const loadBoundaries = (signal) => fetchDistrictBoundaries({ signal });

// Everything the district map needs. There is no fallback data: a failed request shows an
// error state, never invented figures.
export function useDistrictData(category) {
  const meta = useLoad(loadMeta, 'meta');
  const boundaries = useLoad(loadBoundaries, 'boundaries');
  const loadStatistics = useCallback((signal) => fetchDistrictStatistics(category, { signal }), [category]);
  const statistics = useLoad(loadStatistics, meta.status === 'ready' ? category : null);
  return { meta, boundaries, statistics };
}
