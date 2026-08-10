/* ===========================
   Speechmatics TTS — via Supabase Edge Function proxy
   The SPEECHMATICS_API_KEY lives only in Supabase secrets, so the
   browser never sees it. If the proxy is unreachable, callers fall
   back to the native Web Speech API (window.speechSynthesis).
   =========================== */

const SUPABASE_URL = 'https://sqzmazwloxfuvlfjysli.supabase.co';
const PUBLISHABLE_KEY = 'sb_publishable_RxI6BYNR_EgcWj5V7mWRoQ_jnx_aj_1';
const TTS_FUNCTION_URL = `${SUPABASE_URL}/functions/v1/speechmatics-tts`;

export const TTS_VOICES = [
  { id: 'sarah', label: 'Sarah', detail: 'English (UK) · female (default)', emoji: '🇬🇧' },
  { id: 'megan', label: 'Megan', detail: 'English (US) · female', emoji: '🇺🇸' },
] as const;

export type TTSVoiceId = (typeof TTS_VOICES)[number]['id'];

export class TTSServiceError extends Error {
  statusCode: number;
  constructor(message: string, statusCode = 0) {
    super(message);
    this.name = 'TTSServiceError';
    this.statusCode = statusCode;
  }
}

export interface TTSSynthesisResult {
  url: string; // object URL of the audio blob (WAV)
  format: 'wav';
}

/**
 * Synthesize text using Speechmatics via the Supabase Edge Function proxy.
 * Throws TTSServiceError if the proxy or upstream fails.
 */
export async function synthesizeSpeech(
  text: string,
  voice: TTSVoiceId,
): Promise<TTSSynthesisResult> {
  const response = await fetch(TTS_FUNCTION_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: PUBLISHABLE_KEY,
    },
    body: JSON.stringify({ text, voice }),
  });

  if (!response.ok) {
    let message = `Speech service error (${response.status})`;
    try {
      const data = await response.json();
      if (data?.error) message = data.error;
    } catch {
      // non-JSON error body
    }
    throw new TTSServiceError(message, response.status);
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  return { url, format: 'wav' };
}