/**
 * Shared fetch-with-retry utility for AI API calls.
 * Handles transient errors (429 rate limits, 503 service unavailable,
 * connection errors) with exponential backoff + jitter.
 */

interface RetryConfig {
  maxRetries?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
  /** Status codes that should trigger a retry */
  retryableStatuses?: number[];
}

const DEFAULT_RETRYABLE_STATUSES = [429, 502, 503, 504];

/**
 * Returns true if the error message looks like a transient connection/routing error.
 */
function isTransientError(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes('too many connections') ||
    lower.includes('maxconnectionserror') ||
    lower.includes('econnrefused') ||
    lower.includes('enotfound') ||
    lower.includes('econnreset') ||
    lower.includes('etimedout') ||
    lower.includes('network error') ||
    lower.includes('failed to fetch') ||
    lower.includes('service unavailable') ||
    lower.includes('internal server error')
  );
}

/**
 * Returns jittered delay: base * 2^attempt ± random(0..base)
 */
function jitteredBackoff(baseMs: number, attempt: number, maxMs: number): number {
  const exponential = baseMs * Math.pow(2, attempt);
  const jitter = Math.random() * baseMs;
  return Math.min(exponential + jitter, maxMs);
}

/**
 * Wraps a fetch call with retry logic for transient failures.
 * Retries on:
 *  - Matching HTTP status codes (429, 502, 503, 504)
 *  - Network/connection errors whose message matches transient patterns
 *
 * Does NOT retry on auth errors (401, 403) or client errors (400, 404, 422).
 */
export async function fetchWithRetry(
  url: string,
  init: RequestInit,
  config: RetryConfig = {}
): Promise<Response> {
  const {
    maxRetries = 3,
    baseDelayMs = 1500,
    maxDelayMs = 15000,
    retryableStatuses = DEFAULT_RETRYABLE_STATUSES,
  } = config;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, init);

      // Success — return immediately
      if (response.ok) return response;

      // Check if the status is retryable
      if (retryableStatuses.includes(response.status)) {
        // Read body to include in error message
        let bodyText = '';
        try {
          bodyText = await response.text();
        } catch {}

        // Don't retry 429 on the last attempt — let the caller handle it
        if (attempt < maxRetries) {
          const delay = jitteredBackoff(baseDelayMs, attempt, maxDelayMs);
          console.warn(
            `[fetchWithRetry] ${response.status} from ${url}, retrying in ${Math.round(delay)}ms (attempt ${attempt + 1}/${maxRetries})`
          );
          await new Promise((r) => setTimeout(r, delay));
          continue;
        }

        // Last attempt — throw with the body for the caller to parse
        const error = new Error(`API Error (${response.status})`);
        (error as any).responseBody = bodyText;
        throw error;
      }

      // Non-retryable status — throw immediately
      const errBody = await response.text();
      const error = new Error(`API Error (${response.status})`);
      (error as any).responseBody = errBody;
      throw error;
    } catch (err: any) {
      // Don't retry if it's an API error we already decided is non-retryable
      if (err.message?.startsWith('API Error') && !retryableStatuses.some(
        (s) => err.message.includes(String(s))
      )) {
        throw err;
      }

      // Check if it's a transient network error
      const message = err.message || String(err);
      if (isTransientError(message) && attempt < maxRetries) {
        const delay = jitteredBackoff(baseDelayMs, attempt, maxDelayMs);
        console.warn(
          `[fetchWithRetry] Transient error (${message.slice(0, 80)}), retrying in ${Math.round(delay)}ms (attempt ${attempt + 1}/${maxRetries})`
        );
        lastError = err;
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }

      throw err;
    }
  }

  throw lastError || new Error('Request failed after maximum retries');
}
