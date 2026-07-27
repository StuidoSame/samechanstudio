import type { ReactNode } from "react";
import {
  TypeReveal,
  TypeRevealGroup,
} from "../type-reveal/TypeReveal";
import { getTypeRevealDelay } from "../type-reveal/typeRevealTiming";
import { SectionCosmos } from "../SectionCosmos";

type DeviceSectionProps = {
  index: string;
  category: string;
  title: string;
  body: string;
  device: ReactNode;
  reversed?: boolean;
  className?: string;
  cosmosVariant: "phone" | "tablet" | "watch";
};

export function DeviceSection({
  index,
  category,
  title,
  body,
  device,
  reversed = false,
  className = "",
  cosmosVariant,
}: DeviceSectionProps) {
  const titleId = `device-showcase-title-${index}`;
  const revealSteps = [
    { text: `${index} / ${category}`, speed: 32 },
    { text: title, speed: 45 },
    { text: body, speed: 18 },
  ] as const;

  return (
    <TypeRevealGroup
      as="section"
      className={`device-showcase-row${reversed ? " is-reversed" : ""}${className ? ` ${className}` : ""}`}
      aria-labelledby={titleId}
    >
      <SectionCosmos variant={cosmosVariant} />
      <div className="device-showcase-visual">{device}</div>
      <div className="device-showcase-copy">
        <TypeReveal
          as="span"
          className="device-showcase-eyebrow"
          text={revealSteps[0].text}
          speed={revealSteps[0].speed}
          delay={getTypeRevealDelay(revealSteps, 0, 160, 190)}
        />
        <TypeReveal
          as="h2"
          id={titleId}
          text={revealSteps[1].text}
          speed={revealSteps[1].speed}
          delay={getTypeRevealDelay(revealSteps, 1, 160, 190)}
        />
        <div className="device-showcase-body">
          <TypeReveal
            as="p"
            text={revealSteps[2].text}
            speed={revealSteps[2].speed}
            delay={getTypeRevealDelay(revealSteps, 2, 160, 190)}
            preserveLineBreaks
          />
        </div>
      </div>
    </TypeRevealGroup>
  );
}
