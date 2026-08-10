import { Play, Pause, Square, Loader2, Wifi, WifiOff, Mic } from 'lucide-react';
import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import DenToolShell from './DenToolShell';
import { useDenTool } from './useDenTool';
import type { AudioOverviewData } from '../../types/dashboard';
import {
  synthesizeSpeech,
  TTS_VOICES,
  TTSServiceError,
  type TTSVoiceId,
} from '../../services/speechmatics';

/* ===========================
   AudioOverviewTool
   Plays segment-by-segment using Speechmatics TTS via Supabase Edge
   Function. Falls back to the browser's native speechSynthesis API
   when the proxy is unreachable or returns an error.
   =========================== */

type PlayEngine = 'speechmatics' | 'browser' | null;

const RATE_OPTIONS = [0.75, 1, 1.25, 1.5] as const;

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function AudioOverviewTool() {
  const { data, isLoading, error, regenerate } = useDenTool<AudioOverviewData>('audio');

  /* ---- Voice ---- */
  const [voice, setVoice] = useState<TTSVoiceId>('sarah');

  /* ---- Playback state ---- */
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPreparing, setIsPreparing] = useState(false);
  const [currentSegment, setCurrentSegment] = useState(-1);
  const [engine, setEngine] = useState<PlayEngine>(null);
  const [lastFallback, setLastFallback] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  /* ---- Refs ---- */
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const cacheRef = useRef<Map<string, string>>(new Map());
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const segmentsRef = useRef<{ heading: string; text: string }[]>([]);
  const isMountedRef = useRef(true);

  /* Keep current data in ref so callbacks stay fresh without re-creating them. */
  const voiceRef = useRef(voice);
  voiceRef.current = voice;

  const rateRef = useRef(playbackRate);
  rateRef.current = playbackRate;

  /* ---- Init speechSynthesis ---- */
  useEffect(() => {
    synthRef.current = window.speechSynthesis;
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      synthRef.current?.cancel();
      /* Revoke all cached blob URLs */
      cacheRef.current.forEach((url) => URL.revokeObjectURL(url));
      cacheRef.current.clear();
    };
  }, []);

  /* Keep segments ref in sync */
  segmentsRef.current = data?.segments ?? [];

  /* ---- Helpers ---- */
  const stopPlayback = useCallback(() => {
    /* Stop audio element */
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    /* Stop speechSynthesis */
    if (synthRef.current) synthRef.current.cancel();
    setIsPlaying(false);
    setIsPreparing(false);
    setCurrentSegment(-1);
    setCurrentTime(0);
    setEngine(null);
  }, []);

  const speakWithBrowser = useCallback(
    (segments: { heading: string; text: string }[], idx: number) => {
      if (!synthRef.current || !isMountedRef.current) return;
      synthRef.current.cancel();

      if (idx >= segments.length) {
        setIsPlaying(false);
        setCurrentSegment(-1);
        setEngine(null);
        setLastFallback(false);
        return;
      }

      const seg = segments[idx];
      const utterance = new SpeechSynthesisUtterance(
        `${seg.heading}: ${seg.text}`,
      );
      utterance.rate = rateRef.current;
      utterance.pitch = 1.05;
      utterance.volume = 1;

      utterance.onend = () => {
        if (!isMountedRef.current) return;
        const next = idx + 1;
        if (next < segments.length) {
          setCurrentSegment(next);
          speakWithBrowser(segments, next);
        } else {
          setIsPlaying(false);
          setCurrentSegment(-1);
          setEngine(null);
          setLastFallback(false);
        }
      };

      utterance.onerror = () => {
        if (!isMountedRef.current) return;
        /* Continue to next segment on error */
        const next = idx + 1;
        if (next < segments.length) {
          setCurrentSegment(next);
          speakWithBrowser(segments, next);
        } else {
          setIsPlaying(false);
          setCurrentSegment(-1);
          setEngine(null);
          setLastFallback(false);
        }
      };

      utteranceRef.current = utterance;
      setCurrentSegment(idx);
      setIsPlaying(true);
      setEngine('browser');
      setLastFallback(true);
      synthRef.current.speak(utterance);
    },
    [],
  );

  const playSegment = useCallback(
    async (segments: { heading: string; text: string }[], idx: number) => {
      if (!isMountedRef.current) return;
      /* Cancel any existing playback */
      if (synthRef.current) synthRef.current.cancel();
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }

      if (idx >= segments.length) {
        setIsPlaying(false);
        setCurrentSegment(-1);
        setEngine(null);
        setLastFallback(false);
        return;
      }

      const seg = segments[idx];
      const fullText = `${seg.heading}: ${seg.text}`;
      const cacheKey = `${voiceRef.current}:${idx}`;
      const cached = cacheRef.current.get(cacheKey);

      if (cached) {
        /* Play cached audio */
        setCurrentSegment(idx);
        setCurrentTime(0);
        setDuration(0);
        setIsPlaying(true);
        setIsPreparing(false);
        setEngine('speechmatics');
        setLastFallback(false);
        if (audioRef.current) {
          audioRef.current.src = cached;
          audioRef.current.playbackRate = rateRef.current;
          await audioRef.current.play().catch(() => {
            /* If play fails, fall back to browser */
            speakWithBrowser(segments, idx);
          });
        }
        return;
      }

      /* Not cached — synthesize */
      setIsPreparing(true);
      try {
        const result = await synthesizeSpeech(fullText, voiceRef.current);
        if (!isMountedRef.current) {
          URL.revokeObjectURL(result.url);
          return;
        }
        cacheRef.current.set(cacheKey, result.url);
        setCurrentSegment(idx);
        setCurrentTime(0);
        setDuration(0);
        setIsPlaying(true);
        setIsPreparing(false);
        setEngine('speechmatics');
        setLastFallback(false);
        if (audioRef.current) {
          audioRef.current.src = result.url;
          audioRef.current.playbackRate = rateRef.current;
          await audioRef.current.play().catch(() => {
            speakWithBrowser(segments, idx);
          });
        }
      } catch {
        /* Speechmatics unavailable — fall back to browser */
        if (!isMountedRef.current) return;
        setIsPreparing(false);
        speakWithBrowser(segments, idx);
      }
    },
    [speakWithBrowser],
  );

  /* ---- Audio element event handlers ---- */
  const handleAudioEnded = useCallback(() => {
    if (!isMountedRef.current) return;
    const segments = segmentsRef.current;
    const idx = currentSegment;
    if (idx < 0) return;
    const next = idx + 1;
    if (next < segments.length) {
      setCurrentSegment(next);
      playSegment(segments, next);
    } else {
      setIsPlaying(false);
      setCurrentSegment(-1);
      setEngine(null);
      setLastFallback(false);
    }
  }, [currentSegment, playSegment]);

  const handleAudioError = useCallback(() => {
    if (!isMountedRef.current) return;
    const segments = segmentsRef.current;
    const idx = currentSegment;
    if (idx < 0) return;
    /* Fall back to browser speechSynthesis for this segment */
    speakWithBrowser(segments, idx);
  }, [currentSegment, speakWithBrowser]);

  /* ---- UI Handlers ---- */
  const handlePlayPause = () => {
    const segments = segmentsRef.current;
    if (!segments.length) return;

    if (isPlaying) {
      if (engine === 'speechmatics' && audioRef.current) {
        audioRef.current.pause();
      } else if (engine === 'browser' && synthRef.current) {
        synthRef.current.pause();
      }
      setIsPlaying(false);
    } else if (currentSegment >= 0) {
      /* Resume */
      if (engine === 'speechmatics' && audioRef.current) {
        audioRef.current.play().catch(() => speakWithBrowser(segments, currentSegment));
      } else if (engine === 'browser' && synthRef.current) {
        synthRef.current.resume();
      }
      setIsPlaying(true);
    } else {
      /* Start from beginning */
      playSegment(segments, 0);
    }
  };

  const handleStop = stopPlayback;

  const handleSegmentClick = (idx: number) => {
    const segments = segmentsRef.current;
    if (!segments.length) return;
    stopPlayback();
    playSegment(segments, idx);
  };

  const handleVoiceChange = (newVoice: TTSVoiceId) => {
    /* Clear cache (keyed by voice) and restart from current or start */
    stopPlayback();
    cacheRef.current.forEach((url) => URL.revokeObjectURL(url));
    cacheRef.current.clear();
    setVoice(newVoice);
  };

  const handleRateChange = (rate: number) => {
    setPlaybackRate(rate);
    if (audioRef.current) audioRef.current.playbackRate = rate;
  };

  const handleSeek = (value: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = value;
    setCurrentTime(value);
  };

  /* ---- Memoised voice options ---- */
  const voiceOptions = useMemo(() => TTS_VOICES, []);

  /* ---- Render ---- */
  return (
    <DenToolShell
      toolKey="audio"
      isLoading={isLoading}
      error={error}
      onRegenerate={regenerate}
    >
      {data && (
        <div className="space-y-4">
          {/* Hidden audio element for Speechmatics playback */}
          <audio
            ref={audioRef}
            onEnded={handleAudioEnded}
            onError={handleAudioError}
            onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
            onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
            className="hidden"
            preload="none"
          />

          {/* Narration card */}
          <div className="glass-card p-6">
            <p className="text-sm text-foreground/80 leading-relaxed mb-4">
              {data.script}
            </p>
          </div>

          {/* Audio player controls */}
          <div className="glass-card p-4 space-y-3">
            {/* Top row: voice picker + speed + engine badge */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
              {/* Voice selector */}
              <div className="flex items-center gap-2">
                <Mic size={14} className="text-muted-lighter shrink-0" />
                <select
                  value={voice}
                  onChange={(e) => handleVoiceChange(e.target.value as TTSVoiceId)}
                  className="appearance-none bg-white/10 text-foreground text-xs rounded-xl px-3 py-1.5 border border-glass-border focus:outline-none focus:border-accent/50 cursor-pointer transition-all"
                  aria-label="Select voice"
                >
                  {voiceOptions.map((v) => (
                    <option key={v.id} value={v.id} className="bg-dark-surface text-foreground">
                      {v.label} {v.emoji} — {v.detail}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2.5">
                {/* Speed selector */}
                <div className="flex items-center gap-1.5">
                  <span id="speed-label" className="text-[10px] text-muted-lighter">
                    Speed
                  </span>
                  <select
                    value={playbackRate}
                    onChange={(e) => handleRateChange(Number(e.target.value))}
                    aria-labelledby="speed-label"
                    className="appearance-none bg-white/10 text-foreground text-xs rounded-xl px-2.5 py-1.5 border border-glass-border focus:outline-none focus:border-accent/50 cursor-pointer transition-all"
                  >
                    {RATE_OPTIONS.map((r) => (
                      <option key={r} value={r} className="bg-dark-surface text-foreground">
                        {r}×
                      </option>
                    ))}
                  </select>
                </div>

                {/* Engine badge */}
                {engine && (
                  <div
                    className={`flex items-center gap-1 text-[10px] px-2 py-1 rounded-full transition-all ${
                      engine === 'speechmatics'
                        ? 'bg-accent/10 text-accent border border-accent/20'
                        : 'bg-warning/10 text-warning border border-warning/20'
                    }`}
                  >
                    {engine === 'speechmatics' ? (
                      <Wifi size={10} aria-hidden="true" />
                    ) : (
                      <WifiOff size={10} aria-hidden="true" />
                    )}
                    <span>
                      {engine === 'speechmatics' ? 'Speechmatics' : 'Browser voice'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Scrub bar */}
            <div className="flex items-center gap-3">
              <span className="text-[10px] text-muted-lighter tabular-nums w-8 shrink-0 text-right">
                {formatTime(currentTime)}
              </span>
              <input
                type="range"
                min={0}
                max={Math.max(duration, 1)}
                step={0.1}
                value={Math.min(currentTime, duration || 0)}
                onChange={(e) => handleSeek(Number(e.target.value))}
                disabled={engine !== 'speechmatics' || duration <= 0}
                aria-label="Seek playback position"
                className="flex-1 min-w-0 accent-primary cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              />
              <span className="text-[10px] text-muted-lighter tabular-nums w-8 shrink-0">
                {formatTime(duration)}
              </span>
            </div>

            {/* Bottom row: transport controls + progress */}
            <div className="flex items-center gap-3">
              {/* Play / Pause */}
              <button
                onClick={handlePlayPause}
                disabled={isPreparing}
                className="w-10 h-10 rounded-full bg-primary flex items-center justify-center hover:shadow-glow-purple transition-all disabled:opacity-50 cursor-pointer shrink-0"
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isPreparing ? (
                  <Loader2 size={18} className="text-white animate-spin" />
                ) : isPlaying ? (
                  <Pause size={18} className="text-white" aria-hidden="true" />
                ) : (
                  <Play size={18} className="text-white" aria-hidden="true" />
                )}
              </button>

              {/* Stop */}
              <button
                onClick={handleStop}
                disabled={currentSegment < 0}
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 disabled:opacity-30 transition-all cursor-pointer shrink-0"
                aria-label="Stop"
              >
                <Square size={14} className="text-muted" aria-hidden="true" />
              </button>

              {/* Progress bars */}
              <div className="flex-1 flex gap-1.5">
                {data.segments.map((_, i) => (
                  <div
                    key={i}
                    className={`flex-1 h-1.5 rounded-full transition-all ${
                      i < currentSegment
                        ? 'bg-accent'
                        : i === currentSegment
                          ? 'bg-primary animate-pulse'
                          : 'bg-white/10'
                    }`}
                  />
                ))}
              </div>

              {/* Counter */}
              <span className="text-xs text-muted-lighter shrink-0">
                {currentSegment >= 0
                  ? `${currentSegment + 1}/${data.segments.length}`
                  : `${data.segments.length} segments`}
              </span>
            </div>

            {/* Fallback hint */}
            {lastFallback && (
              <p className="text-[10px] text-warning/70 text-center">
                Using browser speech as fallback — Speechmatics may be
                temporarily unavailable.
              </p>
            )}
          </div>

          {/* Segment list */}
          <div className="space-y-2">
            {data.segments.map((seg, i) => (
              <button
                key={i}
                onClick={() => handleSegmentClick(i)}
                disabled={isPreparing}
                className={`w-full text-left glass-card p-4 transition-all cursor-pointer disabled:cursor-not-allowed ${
                  i === currentSegment && isPlaying
                    ? 'border-accent/40 bg-accent/5'
                    : ''
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      i === currentSegment && isPlaying
                        ? 'bg-accent text-dark-base'
                        : 'bg-primary/20 text-primary'
                    }`}
                  >
                    {i + 1}
                  </span>
                  <h4 className="text-sm font-semibold text-foreground">
                    {seg.heading}
                  </h4>
                </div>
                <p className="text-xs text-muted line-clamp-2">{seg.text}</p>
              </button>
            ))}
          </div>
        </div>
      )}
    </DenToolShell>
  );
}