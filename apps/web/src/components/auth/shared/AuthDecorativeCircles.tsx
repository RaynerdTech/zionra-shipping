/**
 * Responsibility:
 * Renders the shared top-right Zionra decorative circles while allowing each
 * authentication screen to preserve its approved responsive positioning.
 */

type AuthDecorativeCirclesProps = {
  className: string;
};

export default function AuthDecorativeCircles({
  className,
}: AuthDecorativeCirclesProps) {
  return (
    <div aria-hidden="true" className={className}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="absolute right-[-20px] top-0 h-[136px] w-[136px] md:h-[240px] md:w-[240px]"
        viewBox="0 0 220 160"
        fill="none"
      >
        <circle
          cx="120"
          cy="40"
          r="120"
          fill="#286BDC"
          fillOpacity="0.05"
        />
      </svg>

      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="absolute right-[-6px] top-[-6px] h-[95.2px] w-[95.2px] md:right-0 md:top-0 md:h-[150px] md:w-[150px]"
        viewBox="0 0 150 150"
        fill="none"
      >
        <circle
          cx="75"
          cy="75"
          r="75"
          fill="#286BDC"
          fillOpacity="0.04"
        />
      </svg>
    </div>
  );
}
