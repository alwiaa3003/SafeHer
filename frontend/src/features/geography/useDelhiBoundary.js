import { useCallback, useEffect, useState } from 'react';
import { fetchDelhiBoundary } from '../../data';

const LOADING = { status: 'loading', unit: null };

export function useDelhiBoundary() {
  const [state, setState] = useState(LOADING);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    fetchDelhiBoundary({ signal: controller.signal })
      .then((unit) => {
        setState({ status: unit?.geometry ? 'ready' : 'empty', unit });
      })
      .catch((error) => {
        if (error.name !== 'AbortError') setState({ status: 'error', unit: null });
      });
    return () => controller.abort();
  }, [attempt]);

  const retry = useCallback(() => {
    setState(LOADING);
    setAttempt((value) => value + 1);
  }, []);

  return { ...state, retry };
}
