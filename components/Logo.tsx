import Link from "next/link";

export function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden>
      <defs>
        <linearGradient id="cs-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3b82f6" />
          <stop offset="1" stopColor="#6366f1" />
        </linearGradient>
      </defs>
      <path
        d="M25.500 9A11.500 11.500 0 1 0 25.500 23"
        fill="none"
        stroke="url(#cs-grad)"
        strokeWidth="5.500"
        strokeLinecap="round"
      />
      <circle cx="19.500" cy="16" r="3.300" fill="url(#cs-grad)" />
    </svg>
  );
}

export default function Logo({ size = 32 }: { size?: number }) {
  return (
    <Link
      href="/"
      aria-label="ConnectSphere home"
      className="flex items-center gap-2 font-bold tracking-tight text-ink"
    >
      <LogoMark size={size} />
      <span className="hidden text-base min-[360px]:inline sm:text-lg">ConnectSphere</span>
    </Link>
  );
}
