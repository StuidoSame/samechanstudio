import type { CSSProperties } from "react";
import type { WarpState } from "../../navigation/cosmicNavigation";

export type ArchiveDocumentTitle =
  | "SUPPORT"
  | "TERMS"
  | "PRIVACY"
  | "DELETE ACCOUNT";

export type PageTransitionDestination =
  | ArchiveDocumentTitle
  | "HOME"
  | "ABOUT"
  | "APPS"
  | "CONTACT";

export type PageTransitionState = WarpState & {
  destination: PageTransitionDestination;
};

type ArchivePortalTransitionProps = {
  transition: PageTransitionState | null;
};

// The intro's pale lavender stars become radial streaks around one vanishing point.
const WARP_RAYS = Array.from({ length: 40 }, (_, index) => ({
  angle: index * 137.508,
  depth: 100 + (index * 67) % 260,
  delay: (index % 8) * 9,
}));

export function ArchivePortalTransition({
  transition,
}: ArchivePortalTransitionProps) {
  if (!transition || transition.timing.duration === 0) return null;

  return (
    <div
      key={transition.id}
      className="cosmic-warp"
      aria-hidden="true"
      data-page-destination={transition.destination.toLowerCase()}
      data-warp-phase={transition.phase}
    >
      <span className="cosmic-warp-veil" />
      {!transition.timing.reduced && (
        <svg className="cosmic-warp-field" viewBox="-700 -450 1400 900" preserveAspectRatio="xMidYMid slice" focusable="false">
          <defs>
            <linearGradient id="cosmic-warp-ray-light" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="32" y2="0">
              <stop stopColor="#ac82eb" stopOpacity="0" />
              <stop offset=".72" stopColor="#d5bdf8" stopOpacity=".65" />
              <stop offset="1" stopColor="#f0e8ff" />
            </linearGradient>
          </defs>
          <g className="cosmic-warp-waves" fill="none" stroke="#bb98ef">
            <ellipse className="cosmic-warp-wave" rx="96" ry="62" />
            <ellipse className="cosmic-warp-wave cosmic-warp-wave--outer" rx="130" ry="88" />
          </g>
          <g className="cosmic-warp-rays">{WARP_RAYS.map((ray, index) => (
            <g key={index} transform={"rotate(" + ray.angle + ")"} className="cosmic-warp-ray-orbit">
              <g className="cosmic-warp-ray" style={{ "--ray-depth": ray.depth + "px", "--ray-delay": ray.delay + "ms" } as CSSProperties}>
                <path d="M0 0H32" stroke="url(#cosmic-warp-ray-light)" strokeWidth={index % 3 === 0 ? 1.8 : 1} />
                <path d="M30 -2v4m-2-2h4" stroke="#eee3ff" strokeWidth=".8" />
              </g>
            </g>
          ))}</g>
        </svg>
      )}
    </div>
  );
}
