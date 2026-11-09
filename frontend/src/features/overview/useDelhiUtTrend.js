import { useCallback, useEffect, useState } from 'react';
import { fetchDelhiUtAnnualSeries } from '../../data';

const LOADING = { status: 'loading', series: [] };

export function useDelhiUtTrend() {
  const [state, setState] = useState(LOADING);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    fetchDelhiUtAnnualSeries({ signal: controller.signal })
      .then((series) => {
        setState({ status: series.length > 0 ? 'ready' : 'empty', series });
      })
      .catch((error) => {
        if (error.name !== 'AbortError') setState({ status: 'error', series: [] });
      });
    return () => controller.abort();
  }, [attempt]);

  const retry = useCallback(() => {
    setState(LOADING);
    setAttempt((value) => value + 1);
  }, []);

  return { ...state, retry };
}
