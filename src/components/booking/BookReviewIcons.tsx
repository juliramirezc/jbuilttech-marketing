import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

export function BrandVisibilityIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <rect
        x="8"
        y="10"
        width="32"
        height="22"
        rx="3"
        stroke="currentColor"
        strokeWidth="1.75"
      />
      <path
        d="M16 36h16"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <circle cx="24" cy="21" r="5" stroke="currentColor" strokeWidth="1.75" />
      <path
        d="M14 21c2.8-4 6.4-6 10-6s7.2 2 10 6c-2.8 4-6.4 6-10 6s-7.2-2-10-6Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function MarketingIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <path
        d="M10 34V18l12-8 12 8v16"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path
        d="M18 34v-8h8v8"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path
        d="M30 14l6-3v10l-6 3"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <circle cx="36" cy="11" r="2.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function NextStepsIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <path
        d="M12 14h24M12 24h16M12 34h20"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <path
        d="M34 28l4 4 6-8"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ClockIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <circle cx="12" cy="12" r="8.25" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M12 8v4.5l3 1.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function MeetIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <rect
        x="3"
        y="6"
        width="12"
        height="12"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M15 10.5 20 7.5v9l-5-3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function GiftIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <path
        d="M4 11h16v9a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-9Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path d="M3 7h18v4H3V7Z" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M12 7V21M12 7c0-2-1.5-3.5-3.25-3.5S5.5 5 7 7M12 7c0-2 1.5-3.5 3.25-3.5S18.5 5 17 7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function CircuitPattern() {
  return (
    <svg
      className="book-review-circuit"
      viewBox="0 0 800 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      preserveAspectRatio="xMidYMid slice"
    >
      <g stroke="currentColor" strokeWidth="1" opacity="0.55">
        <path d="M40 80h120l40 40h80" />
        <path d="M200 120v80l40 40h100" />
        <path d="M480 60h140l30 30v80" />
        <path d="M620 170h90l40 40" />
        <path d="M80 260h90l50-50h70" />
        <path d="M340 280v-70l60-60h120" />
        <path d="M560 300h140" />
        <path d="M100 160h40v40" />
        <rect x="280" y="150" width="48" height="32" rx="3" />
        <rect x="520" y="200" width="56" height="28" rx="3" />
        <rect x="150" y="290" width="36" height="24" rx="2" />
        <circle cx="160" cy="80" r="3.5" fill="currentColor" />
        <circle cx="340" cy="160" r="3.5" fill="currentColor" />
        <circle cx="520" cy="90" r="3.5" fill="currentColor" />
        <circle cx="660" cy="210" r="3.5" fill="currentColor" />
        <circle cx="290" cy="280" r="3.5" fill="currentColor" />
      </g>
    </svg>
  );
}

export function MicrochipAccent({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect
        x="16"
        y="16"
        width="32"
        height="32"
        rx="4"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <rect
        x="24"
        y="24"
        width="16"
        height="16"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.25"
      />
      <path
        d="M22 8v8M32 8v8M42 8v8M22 48v8M32 48v8M42 48v8M8 22h8M8 32h8M8 42h8M48 22h8M48 32h8M48 42h8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
