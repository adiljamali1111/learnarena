import { Zap } from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';

/**
 * "Try Demo Mode" trigger — loads the built-in demo universe so users can
 * explore LearnArena without entering an API key.
 */
export default function DemoModeButton({ size = 'md' }: { size?: 'md' | 'lg' }) {
  const { loadDemoData } = useDashboard();

  const isLarge = size === 'lg';

  return (
    <button
      onClick={loadDemoData}
      className={`btn-base w-full rounded-xl bg-gradient-to-r from-accent to-cyan-500 text-white font-semibold hover:shadow-glow-cyan transition-all cursor-pointer active:scale-[0.97] ${
        isLarge ? 'px-8 py-3.5' : 'px-4 py-3'
      }`}
    >
      <span className="flex items-center justify-center gap-2">
        <Zap size={isLarge ? 18 : 16} />
        <span>{isLarge ? 'Try Demo Mode (No API Key Required)' : 'Try Demo Mode (No API Key Required)'}</span>
      </span>
    </button>
  );
}