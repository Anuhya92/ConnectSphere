/** Decorative mountain landscape (inline SVG, no image files needed). */
export default function MountainArt({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 300"
      preserveAspectRatio="xMidYMid slice"
      className={className}
      role="img"
      aria-label="Mountain landscape"
    >
      <defs>
        <linearGradient id="ma-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#60a5fa" />
          <stop offset="0.7" stopColor="#dbeafe" />
          <stop offset="1" stopColor="#eff6ff" />
        </linearGradient>
        <linearGradient id="ma-far" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#93a8d8" />
          <stop offset="1" stopColor="#c7d6f2" />
        </linearGradient>
        <linearGradient id="ma-near" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4a6fa5" />
          <stop offset="1" stopColor="#2f4a7d" />
        </linearGradient>
      </defs>
      <rect width="400" height="300" fill="url(#ma-sky)" />
      <circle cx="310" cy="70" r="26" fill="#fff" opacity="0.85" />
      <ellipse cx="90" cy="60" rx="46" ry="9" fill="#fff" opacity="0.7" />
      <ellipse cx="150" cy="78" rx="34" ry="7" fill="#fff" opacity="0.55" />
      <path d="M0 190 L70 110 L120 160 L190 80 L260 170 L320 120 L400 185 L400 300 L0 300Z" fill="url(#ma-far)" />
      <path d="M0 230 L90 130 L150 200 L215 100 L300 210 L350 160 L400 215 L400 300 L0 300Z" fill="url(#ma-near)" />
      <path d="M215 100 L195 128 L206 124 L215 136 L226 122 L238 130Z" fill="#f1f5ff" />
      <path d="M90 130 L74 152 L84 149 L92 160 L102 148 L110 154Z" fill="#f1f5ff" />
      <path d="M0 262 Q80 232 170 256 T400 244 L400 300 L0 300Z" fill="#2f6b4f" />
      <path d="M0 282 Q110 258 220 278 T400 270 L400 300 L0 300Z" fill="#245a40" />
    </svg>
  );
}
