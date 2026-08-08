import { useState, useEffect, useCallback } from 'react';
import { generateDenContent, OpenRouterError } from '../../services/openrouter';
import { useDashboard } from '../../context/DashboardContext';

const CACHE_PREFIX = 'learnarena_den_cache_';

interface UseDenToolResult<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  regenerate: () => void;
}

export function useDenTool<T>(toolKey: string): UseDenToolResult<T> {
  const { state } = useDashboard();
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const activeModule = state.modules.find(
    (m) => m.id === state.activeModuleId,
  );

  const load = useCallback(async () => {
    if (!activeModule || !state.apiKey) {
      setError('No module or API key');
      setIsLoading(false);
      return;
    }

    // Check cache
    const cacheKey = `${CACHE_PREFIX}${toolKey}_${activeModule.id}`;
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        setData(parsed);
        setIsLoading(false);
        return;
      }
    } catch {
      // ignore cache
    }

    setIsLoading(true);
    setError(null);

    try {
      const content = await generateDenContent<T>(
        state.apiKey,
        toolKey,
        activeModule.notes,
      );
      // Cache it
      try {
        localStorage.setItem(cacheKey, JSON.stringify(content));
      } catch {
        // cache may be full
      }
      setData(content);
    } catch (err) {
      const msg =
        err instanceof OpenRouterError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'Failed to generate content';

      // Retry once
      try {
        const content = await generateDenContent<T>(
          state.apiKey,
          toolKey,
          activeModule.notes,
        );
        try {
          localStorage.setItem(cacheKey, JSON.stringify(content));
        } catch {
          // ignore
        }
        setData(content);
        setError(null);
      } catch {
        setError(msg);
      }
    } finally {
      setIsLoading(false);
    }
  }, [activeModule, state.apiKey, toolKey]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, isLoading, error, regenerate: load };
}