import type { CSSProperties } from "react";

export type ArchiveDocumentTitle = "SUPPORT" | "TERMS" | "PRIVACY";

export type ArchivePortalState = {
  documentTitle: ArchiveDocumentTitle;
  href: string;
  x: number;
  y: number;
};

type ArchivePortalTransitionProps = {
  reducedMotion: boolean;
  transition: ArchivePortalState | null;
};

const PORTAL_DUST = [
  { x: -32, y: -22, delay: 0 },
  { x: 28, y: -30, delay: 34 },
  { x: -44, y: 9, delay: 68 },
  { x: 39, y: 18, delay: 18 },
  { x: -21, y: 35, delay: 96 },
  { x: 17, y: 42, delay: 52 },
  { x: -56, y: -6, delay: 112 },
  { x: 54, y: -2, delay: 80 },
] as const;

export function ArchivePortalTransition({
  reducedMotion,
  transition,
}: ArchivePortalTransitionProps) {
  if (!transition) return null;

  const portalStyle = {
    "--archive-portal-x": `${transition.x}px`,
    "--archive-portal-y": `${transition.y}px`,
  } as CSSProperties;

  return (
    <div
      className={`archive-portal-transition${reducedMotion ? " is-reduced-motion" : ""}`}
      style={portalStyle}
      aria-hidden="true"
      data-archive-destination={transition.documentTitle.toLowerCase()}
    >
      <span className="archive-portal-backdrop" />
      <span className="archive-portal-surface" />
      <span className="archive-portal-glow" />
      <span className="archive-portal-ring archive-portal-ring-outer" />
      <span className="archive-portal-ring archive-portal-ring-inner" />
      <span className="archive-portal-noise" />
      <span className="archive-portal-orb" />
      <span className="archive-portal-spark archive-portal-spark-one" />
      <span className="archive-portal-spark archive-portal-spark-two" />
      <span className="archive-portal-spark archive-portal-spark-three" />
      <span className="archive-portal-dust-field">
        {PORTAL_DUST.map((dust, index) => (
          <i
            key={`${dust.x}-${dust.y}`}
            style={
              {
                "--portal-dust-x": `${dust.x}vmin`,
                "--portal-dust-y": `${dust.y}vmin`,
                "--portal-dust-delay": `${dust.delay}ms`,
              } as CSSProperties
            }
            data-portal-dust={index + 1}
          />
        ))}
      </span>
    </div>
  );
}
