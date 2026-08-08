import { useState, useCallback, useEffect } from 'react';

export function useDenTool<T>(
  generator: () => Promise<T>,
  cacheKey: string,
): {
  data: T | null;
  loading: boolean;
  error: string | null;
  generating: boolean;
  regenerate: () => Promise<void>;
} {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await generator();
      setData(result);
      // Cache in localStorage
      try {
        localStorage.setItem(`learnarena_den_${cacheKey}`, JSON.stringify(result));
      } catch { /* storage full — ignore */ }
    } catch (err: any) {
      setError(err.message ?? 'Failed to load');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [generator, cacheKey]);

  const regenerate = useCallback(async () => {
    setGenerating(true);
    setError(null);
    try {
      const result = await generator();
      setData(result);
      try {
        localStorage.setItem(`learnarena_den_${cacheKey}`, JSON.stringify(result));
      } catch { /* ignore */ }
    } catch (err: any) {
      setError(err.message ?? 'Failed to regenerate');
    } finally {
      setGenerating(false);
    }
  }, [generator, cacheKey]);

  // Check local cache first
  useEffect(() => {
    try {
      const cached = localStorage.getItem(`learnarena_den_${cacheKey}`);
      if (cached) {
        setData(JSON.parse(cached));
        setLoading(false);
        return;
      }
    } catch { /* ignore */ }
    load();
  }, [cacheKey]); // eslint-disable-line react-hooks/exhaustive-deps

  return { data, loading, error, generating, regenerate };
}