type LogoProps = {
  size?: number;
  className?: string;
};

export default function Logo({ size = 20, className = "" }: LogoProps) {
  return (
    <span
      className={`font-serif-brand font-semibold tracking-[-0.01em] text-brand dark:text-[#7DD3FC] ${className}`}
      style={{ fontSize: size }}
    >
      Casefile
    </span>
  );
}
