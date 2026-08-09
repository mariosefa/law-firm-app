type LogoProps = {
  size?: number;
  className?: string;
};

export default function Logo({ size = 32, className }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 96 96"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <rect width="96" height="96" rx="24" fill="#0C447C" />
      <rect
        x="28"
        y="20"
        width="40"
        height="56"
        rx="4"
        stroke="#7DD3FC"
        strokeWidth="4"
      />
      <line
        x1="36"
        y1="38"
        x2="60"
        y2="38"
        stroke="#7DD3FC"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <line
        x1="36"
        y1="48"
        x2="60"
        y2="48"
        stroke="#7DD3FC"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <line
        x1="36"
        y1="58"
        x2="60"
        y2="58"
        stroke="#7DD3FC"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );
}
