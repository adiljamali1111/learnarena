interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function LearnArenaLogo({ className = '', size = 'md' }: LogoProps) {
  const dimensions = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-20 h-20',
  }[size];

  return (
    <div
      className={`relative flex items-center justify-center rounded-xl bg-slate-900/80 border border-cyan-500/30 p-1.5 shadow-[0_0_15px_rgba(6,182,212,0.25)] ${dimensions} ${className}`}
    >
      <svg
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-[0_0_6px_rgba(6,182,212,0.8)]"
      >
        {/* Neon Colosseum Base */}
        <g stroke="#00f0ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          {/* Base foundation */}
          <path d="M 10 52 L 54 52" />
          <path d="M 12 46 L 52 46" />
          {/* Lower Arcades */}
          <path d="M 14 46 V 52 M 22 46 V 52 M 30 46 V 52 M 38 46 V 52 M 46 46 V 52" />
          {/* Main Wall Outer Rim */}
          <path d="M 12 46 C 12 36, 52 36, 52 46" />
          {/* Mid Tier Arches */}
          <path d="M 18 42 C 18 38, 24 38, 24 42" />
          <path d="M 28 40 C 28 36, 36 36, 36 40" />
          <path d="M 40 42 C 40 38, 46 38, 46 42" />
        </g>
        {/* Hovering Neon Open Book */}
        <g
          stroke="#c084fc"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="drop-shadow-[0_0_8px_rgba(192,132,252,0.9)]"
        >
          {/* Glow backdrop */}
          <path d="M 32 16 L 16 22 V 32 L 32 26 L 48 32 V 22 Z" fill="#c084fc" fillOpacity="0.15" />
          {/* Left Page */}
          <path d="M 32 16 C 26 18, 18 18, 14 22 V 32 C 18 28, 26 28, 32 26 Z" />
          {/* Right Page */}
          <path d="M 32 16 C 38 18, 46 18, 50 22 V 32 C 46 28, 38 28, 32 26 Z" />
          {/* Center Spine */}
          <path d="M 32 16 V 26" />
        </g>
      </svg>
    </div>
  );
}