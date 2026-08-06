/* ──────────────────────────────────────────
   LearnArena — Retry Fetch Wrapper
   ────────────────────────────────────────── */

interface RetryConfig {
  maxRetries: number;
  baseDelayMs: number;
  maxDelayMs: number;
  onRetry?: (attempt: number, error: Error) => void;
}

const DEFAULT_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelayMs: 1000,
  maxDelayMs: 10000,
};

/**
 * Fetch wrapper with exponential backoff retry logic.
 */
export async function retryFetch(
  url: string,
  init: RequestInit,
  config: Partial<RetryConfig> = {},
): Promise<Response> {
  const cfg = { ...DEFAULT_CONFIG, ...config };

  for (let attempt = 0; attempt <= cfg.maxRetries; attempt++) {
    try {
      const response = await fetch(url, init);

      // Retry on 429 (rate limit) or 5xx errors
      if (attempt < cfg.maxRetries && (response.status === 429 || response.status >= 500)) {
        const delay = Math.min(cfg.baseDelayMs * 2 ** attempt, cfg.maxDelayMs);
        cfg.onRetry?.(attempt + 1, new Error(`HTTP ${response.status}`));
        await sleep(delay);
        continue;
      }

      return response;
    } catch (err) {
      if (attempt === cfg.maxRetries) throw err;
      const delay = Math.min(cfg.baseDelayMs * 2 ** attempt, cfg.maxDelayMs);
      cfg.onRetry?.(attempt + 1, err instanceof Error ? err : new Error(String(err)));
      await sleep(delay);
    }
  }

  throw new Error('Unreachable');
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
