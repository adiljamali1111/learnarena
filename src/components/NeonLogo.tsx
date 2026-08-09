export default function NeonLogo({
  size = 32,
  className = '',
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <filter id="logo-glow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <linearGradient id="colosseum-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>

        <linearGradient id="book-grad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#00f0ff" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>

        <linearGradient id="book-glow" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#00f0ff" />
          <stop offset="100%" stopColor="#a855f7" />
        </linearGradient>
      </defs>

      {/* Book hovering above the colosseum */}
      <g filter="url(#logo-glow)">
        {/* Book glow aura */}
        <ellipse cx="20" cy="13" rx="8" ry="1.5" fill="url(#book-glow)" opacity="0.15" />

        {/* Book back cover */}
        <rect x="13" y="8.5" width="14" height="8" rx="1.5" fill="url(#book-grad)" opacity="0.6" />

        {/* Book spine */}
        <line x1="20" y1="8.5" x2="20" y2="16.5" stroke="url(#book-glow)" strokeWidth="1.2" strokeLinecap="round" />

        {/* Book left page */}
        <path
          d="M13.5 9.5v7M13.5 9.5C13.5 8.67 14.17 8 15 8h5v8.5h-5c-.83 0-1.5-.67-1.5-1.5v-1"
          stroke="url(#book-grad)"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          opacity="0.85"
        />

        {/* Book right page */}
        <path
          d="M26.5 9.5v7M26.5 9.5C26.5 8.67 25.83 8 25 8h-5v8.5h5c.83 0 1.5-.67 1.5-1.5v-1"
          stroke="url(#book-grad)"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          opacity="0.85"
        />

        {/* Book floating animation lines */}
        <line x1="14" y1="18" x2="16" y2="18" stroke="#a855f7" strokeWidth="0.5" opacity="0.4" />
        <line x1="24" y1="18" x2="26" y2="18" stroke="#a855f7" strokeWidth="0.5" opacity="0.4" />
      </g>

      {/* Colosseum */}
      <g filter="url(#logo-glow)">
        {/* Base platform */}
        <rect x="8" y="30" width="24" height="2.5" rx="1" fill="url(#colosseum-grad)" opacity="0.9" />
        <rect x="8" y="30" width="24" height="2.5" rx="1" fill="#a855f7" opacity="0.3" />

        {/* Second tier */}
        <rect x="10" y="26" width="20" height="4" rx="0.8" fill="url(#colosseum-grad)" opacity="0.7" />

        {/* Top tier */}
        <rect x="11.5" y="22.5" width="17" height="3.5" rx="0.8" fill="url(#colosseum-grad)" opacity="0.85" />

        {/* Columns/arches - bottom row */}
        <rect x="10.5" y="27" width="1.2" height="3" rx="0.3" fill="#c084fc" opacity="0.9" />
        <rect x="13.5" y="27" width="1.2" height="3" rx="0.3" fill="#c084fc" opacity="0.9" />
        <rect x="16.5" y="27" width="1.2" height="3" rx="0.3" fill="#c084fc" opacity="0.9" />
        <rect x="19.5" y="27" width="1.2" height="3" rx="0.3" fill="#c084fc" opacity="0.9" />
        <rect x="22.5" y="27" width="1.2" height="3" rx="0.3" fill="#c084fc" opacity="0.9" />
        <rect x="25.5" y="27" width="1.2" height="3" rx="0.3" fill="#c084fc" opacity="0.9" />
        <rect x="28.5" y="27" width="1.2" height="3" rx="0.3" fill="#c084fc" opacity="0.9" />

        {/* Arches - top row */}
        <rect x="12.5" y="23" width="1" height="3" rx="0.3" fill="#a78bfa" opacity="0.8" />
        <rect x="15.2" y="23" width="1" height="3" rx="0.3" fill="#a78bfa" opacity="0.8" />
        <rect x="18" y="23" width="1" height="3" rx="0.3" fill="#a78bfa" opacity="0.8" />
        <rect x="20.8" y="23" width="1" height="3" rx="0.3" fill="#a78bfa" opacity="0.8" />
        <rect x="23.5" y="23" width="1" height="3" rx="0.3" fill="#a78bfa" opacity="0.8" />
        <rect x="26.2" y="23" width="1" height="3" rx="0.3" fill="#a78bfa" opacity="0.8" />

        {/* Arch cutouts - bottom row */}
        <circle cx="12" cy="29" r="0.8" fill="#0d0221" opacity="0.7" />
        <circle cx="15" cy="29" r="0.8" fill="#0d0221" opacity="0.7" />
        <circle cx="18" cy="29" r="0.8" fill="#0d0221" opacity="0.7" />
        <circle cx="21" cy="29" r="0.8" fill="#0d0221" opacity="0.7" />
        <circle cx="24" cy="29" r="0.8" fill="#0d0221" opacity="0.7" />
        <circle cx="27" cy="29" r="0.8" fill="#0d0221" opacity="0.7" />

        {/* Neon glow line at base */}
        <line x1="8.5" y1="32" x2="31.5" y2="32" stroke="#a855f7" strokeWidth="0.8" opacity="0.5" />

        {/* Side glow accents */}
        <rect x="7.5" y="26" width="0.8" height="6.5" rx="0.4" fill="#00f0ff" opacity="0.3" />
        <rect x="31.7" y="26" width="0.8" height="6.5" rx="0.4" fill="#00f0ff" opacity="0.3" />
      </g>
    </svg>
  );
}