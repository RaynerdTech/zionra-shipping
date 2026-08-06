/**
 * Responsibility:
 * Renders the shared Zionra delivery-route illustration used on authentication panels.
 * The route geometry, location labels, and design artwork remain centralized here.
 */

export default function AuthDeliveryNetwork({
  className = "h-[190px] w-[370px] max-w-full overflow-visible",
  londonTone = "primary",
}: {
  className?: string;
  londonTone?: "primary" | "light";
}) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 370 190"
      fill="none"
    >
      <path
        d="M28 50 130 135 248 32 340 77"
        stroke="#286BDC"
        strokeOpacity=".45"
      />
      <path d="M28 50 248 32" stroke="#286BDC" strokeOpacity=".28" />

      <circle cx="28" cy="50" r="16" fill="#286BDC" fillOpacity=".18" />
      <circle
        cx="28"
        cy="50"
        r="8"
        fill={londonTone === "light" ? "#72A7EC" : "#286BDC"}
      />

      <circle cx="130" cy="135" r="16" fill="#286BDC" fillOpacity=".18" />
      <circle cx="130" cy="135" r="8" fill="#286BDC" />

      <circle cx="248" cy="32" r="16" fill="#FFA630" fillOpacity=".18" />
      <circle cx="248" cy="32" r="8" fill="#FFA630" />

      <circle cx="340" cy="77" r="16" fill="#2EC4B6" fillOpacity=".18" />
      <circle cx="340" cy="77" r="8" fill="#2EC4B6" />

      <g fill="#0F2C58">
        <rect x="3" y="64" width="50" height="17" rx="8.5" />
        <rect x="95" y="150" width="70" height="17" rx="8.5" />
        <rect x="224" y="46" width="48" height="17" rx="8.5" />
        <rect x="314" y="91" width="52" height="17" rx="8.5" />
      </g>

      <g
        fill="#C4CEDE"
        fontFamily="DM Sans, sans-serif"
        fontSize="8"
        textAnchor="middle"
      >
        <text x="28" y="76">London</text>
        <text x="130" y="162">Manchester</text>
        <text x="248" y="58">Lagos</text>
        <text x="340" y="103">Abuja</text>
      </g>
    </svg>
  );
}
