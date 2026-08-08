import { useState, useRef, useCallback } from 'react';
import { Play, Pause, StopCircle, SkipBack, ChevronRight } from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';
import { useDenTool } from './useDenTool';
import { generateDenContent } from '../../services/openrouter';
import DenToolShell from './DenToolShell';
import type { AudioOverviewContent } from '../../types/dashboard';

interface Props {
  moduleTitle: string;
  sourceText: string;
  onBack: () => void;
}

export default function AudioOverviewTool({ moduleTitle, sourceText, onBack }: Props) {
  const { generateDenToolContent } = useDashboard();
  const [speed, setSpeed] = useState(1);
  const [currentSection, setCurrentSection] = useState(0);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const [speaking, setSpeaking] = useState(false);

  const { data, loading, error, generating, regenerate } = useDenTool<AudioOverviewContent>(
    () => generateDenContent('audio-overview', moduleTitle, sourceText, []) as Promise<AudioOverviewContent>,
    `audio-overview_${moduleTitle}`,
  );

  const speak = useCallback((text: string) => {
    if (!synthRef.current) synthRef.current = window.speechSynthesis;
    synthRef.current?.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = speed;
    utterance.onend = () => {
      setSpeaking(false);
      if (currentSection < (data?.sections.length ?? 1) - 1) {
        setCurrentSection((s) => s + 1);
      }
    };
    utterance.onstart = () => setSpeaking(true);
    synthRef.current?.speak(utterance);
  }, [speed, currentSection, data]);

  const stop = useCallback(() => {
    synthRef.current?.cancel();
    setSpeaking(false);
  }, []);

  const section = data?.sections[currentSection];

  return (
    <DenToolShell
      title="Audio Overview"
      loading={loading}
      error={error}
      generating={generating}
      onBack={onBack}
      onRegenerate={regenerate}
    >
      {data && (
        <>
          {/* Controls */}
          <div className="glass-card p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  stop();
                  setCurrentSection(0);
                }}
                className="p-2 rounded-lg hover:bg-dark-hover text-muted hover:text-foreground transition-colors cursor-pointer"
              >
                <SkipBack className="w-4 h-4" />
              </button>
              {speaking ? (
                <button
                  onClick={stop}
                  className="p-2 rounded-lg bg-destructive/20 text-destructive hover:bg-destructive/30 transition-colors cursor-pointer"
                >
                  <Pause className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => section && speak(section.text)}
                  className="p-2 rounded-lg bg-primary/20 text-primary hover:bg-primary/30 transition-colors cursor-pointer"
                >
                  <Play className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Speed */}
            <div className="flex items-center gap-1">
              {[0.75, 1, 1.25, 1.5].map((r) => (
                <button
                  key={r}
                  onClick={() => setSpeed(r)}
                  className={`px-2 py-1 rounded text-2xs font-medium transition-colors cursor-pointer ${
                    speed === r
                      ? 'bg-primary text-dark-base'
                      : 'text-muted hover:text-foreground'
                  }`}
                >
                  {r}x
                </button>
              ))}
            </div>
          </div>

          {/* Section indicator */}
          <div className="flex gap-2">
            {data.sections.map((_, i) => (
              <button
                key={i}
                onClick={() => { stop(); setCurrentSection(i); }}
                className={`flex-1 h-1.5 rounded-full transition-colors cursor-pointer ${
                  i === currentSection ? 'bg-primary' : i < currentSection ? 'bg-success' : 'bg-dark-hover'
                }`}
              />
            ))}
          </div>

          {/* Section content */}
          <div className="glass-card p-5">
            <h3 className="font-heading text-sm font-bold text-primary mb-3">{section?.heading}</h3>
            <p className="text-sm text-foreground/90 leading-relaxed">{section?.text}</p>
          </div>
        </>
      )}
    </DenToolShell>
  );
}