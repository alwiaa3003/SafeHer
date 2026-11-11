import { useCallback, useEffect, useState } from 'react';

const LOADING = { status: 'loading', data: null };

// Loads one API resource. `load` receives an AbortSignal and must be stable.
// There is no fallback data: a failure shows an error state and no figures.
export function useApiResource(load) {
  const [state, setState] = useState(LOADING);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal)
      .then((data) => setState({ status: 'ready', data }))
      .catch((error) => {
        if (error.name !== 'AbortError') setState({ status: 'error', data: null });
      });
    return () => controller.abort();
  }, [load, attempt]);

  const retry = useCallback(() => {
    setState(LOADING);
    setAttempt((value) => value + 1);
  }, []);

  return { ...state, retry };
}
