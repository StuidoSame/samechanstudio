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
      data-device-journey-section={journeyId}
    >
      <SectionCosmos variant={cosmosVariant} />
      <div className="device-showcase-visual">{device}</div>
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
