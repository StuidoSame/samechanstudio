import type { ReactNode } from "react";
import {
  TypeRevealGroup,
  TypeRevealLines,
} from "../type-reveal/TypeReveal";
import { SectionCosmos } from "../SectionCosmos";

type DeviceSectionProps = {
  index: string;
  label: string;
  titleLines: readonly string[];
  descriptionLines: readonly string[];
  device: ReactNode;
  reversed?: boolean;
  className?: string;
  cosmosVariant: "phone" | "tablet" | "watch";
  journeyId: "phone" | "tablet" | "watch";
  current: boolean;
};

const LABEL_REVEAL_DELAY = 190;
const TITLE_REVEAL_DELAY = 420;
const TITLE_LINE_STAGGER = 130;
const DESCRIPTION_LINE_STAGGER = 90;

export function DeviceSection({
  index,
  label,
  titleLines,
  descriptionLines,
  device,
  reversed = false,
  className = "",
  cosmosVariant,
  journeyId,
  current,
}: DeviceSectionProps) {
  const titleId = `device-showcase-title-${index}`;
  const descriptionDelay =
    TITLE_REVEAL_DELAY + titleLines.length * TITLE_LINE_STAGGER + 180;

  return (
    <TypeRevealGroup
      as="section"
      id={`device-${journeyId}`}
      className={`device-showcase-row${reversed ? " is-reversed" : ""}${className ? ` ${className}` : ""}`}
      aria-labelledby={titleId}
      aria-current={current ? "step" : undefined}
      data-device-journey-section={journeyId}
      threshold={0.2}
    >
      <SectionCosmos variant={cosmosVariant} />
      <div className="device-showcase-visual">
        <div className="cosmic-exhibit" data-parallax-section="">
          <div
            className="exhibit-depth"
            aria-hidden="true"
            data-parallax-item=""
            data-parallax-speed="0.08"
            data-parallax-max="32"
          >
            {journeyId === "phone" && (
              <>
                <span
                  className="exhibit-memory exhibit-memory--back"
                  data-parallax-item=""
                  data-parallax-speed="0.07"
                  data-parallax-max="14"
                  data-parallax-direction="-1"
                />
                <span
                  className="exhibit-memory exhibit-memory--note"
                  data-parallax-item=""
                  data-parallax-speed="0.15"
                  data-parallax-max="18"
                >
                  <svg viewBox="0 0 24 24" fill="none" focusable="false">
                    <path d="M12 20 4.4 12.7a4.6 4.6 0 0 1 6.5-6.5L12 7.3l1.1-1.1a4.6 4.6 0 0 1 6.5 6.5Z" />
                  </svg>
                </span>
              </>
            )}
            {journeyId === "tablet" && <span className="exhibit-grid" />}
            {journeyId === "watch" && (
              <svg className="exhibit-wave" viewBox="0 0 520 140" fill="none" focusable="false">
                <path d="M0 71h40l15-17 22 34 19-29 14 12h36l18-43 21 85 24-69 17 27h32l19-56 28 116 23-87 19 27h33l18-36 22 59 17-23h34l13-16 19 27 14-11h31" />
                <path d="M0 83h95l18-13 18 13h96l21-17 19 17h93l22-12 15 12h123" />
              </svg>
            )}
          </div>
          {journeyId === "tablet" && (
            <div className="exhibit-tablet-accents" aria-hidden="true">
              <span className="exhibit-cube exhibit-cube--near"><i /><i /><i /></span>
              <span className="exhibit-cube exhibit-cube--far"><i /><i /><i /></span>
            </div>
          )}
          <div className="exhibit-orbits" aria-hidden="true">
            <span />
          </div>
          <div
            className="exhibit-object"
            data-parallax-item=""
            data-parallax-speed="0.12"
            data-parallax-max="28"
            data-parallax-direction="-1"
          >
            <div className="exhibit-tilt">{device}</div>
          </div>
        </div>
      </div>
      <div className="device-showcase-copy localized-copy">
        <TypeRevealLines
          as="span"
          className="device-showcase-eyebrow"
          lines={[`${index} / ${label}`]}
          delay={LABEL_REVEAL_DELAY}
          stagger={0}
        />
        <TypeRevealLines
          as="h2"
          id={titleId}
          lines={titleLines}
          delay={TITLE_REVEAL_DELAY}
          stagger={TITLE_LINE_STAGGER}
        />
        <div className="device-showcase-body">
          <TypeRevealLines
            as="p"
            lines={descriptionLines}
            delay={descriptionDelay}
            stagger={DESCRIPTION_LINE_STAGGER}
          />
        </div>
      </div>
    </TypeRevealGroup>
  );
}
