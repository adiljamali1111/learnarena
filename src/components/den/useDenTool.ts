import { useState, useEffect, useCallback } from 'react';
import {
  generateDenContent,
  AIServiceError,
} from '../../services/aiService';
import { useDashboard } from '../../context/DashboardContext';

const CACHE_PREFIX = 'learnarena_den_cache_';

interface UseDenToolResult<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  regenerate: () => void;
}

export function useDenTool<T>(toolKey: string): UseDenToolResult<T> {
  const { state, setModal, setApiKeyError } = useDashboard();
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const activeModule = state.modules.find(
    (m) => m.id === state.activeModuleId,
  );

  const load = useCallback(
    async (forceFresh = false) => {
      if (!activeModule || !state.apiKey) {
        setError('No module or API key');
        setIsLoading(false);
        return;
      }

      const cacheKey = `${CACHE_PREFIX}${toolKey}_${activeModule.id}`;

      // Check cache unless forced fresh
      if (!forceFresh) {
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
      }

      setIsLoading(true);
      setError(null);

      try {
        const content = await generateDenContent<T>(
          state.apiKey,
          state.provider,
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
          err instanceof AIServiceError
            ? err.message
            : err instanceof Error
              ? err.message
              : 'Failed to generate content';

        // A rejected key can't be fixed by retrying — surface the modal instead
        if (err instanceof AIServiceError && err.code === 'invalid_key') {
          setError('Your API key was rejected. Re-enter it in settings.');
          setModal('apiKey');
          setApiKeyError(
            'Your API key was rejected (401). Check the key and try again.',
          );
          return;
        }

        // Retry once
        try {
          const content = await generateDenContent<T>(
            state.apiKey,
            state.provider,
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
    },
    [activeModule, state.apiKey, state.provider, toolKey, setModal, setApiKeyError],
  );

  useEffect(() => {
    load(false);
  }, [load]);

  const regenerate = useCallback(() => {
    if (!activeModule) return;
    const cacheKey = `${CACHE_PREFIX}${toolKey}_${activeModule.id}`;
    // Clear the cached data so fresh content is fetched
    try {
      localStorage.removeItem(cacheKey);
    } catch {
      // ignore
    }
    load(true);
  }, [activeModule, toolKey, load]);

  return { data, isLoading, error, regenerate };
}