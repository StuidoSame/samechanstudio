import type { ReactNode } from "react";
import type { Locale } from "../../i18n/types";
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
  journeyId: "phone" | "tablet" | "watch";
  locale: Locale;
};

const CJK_LOCALES = new Set<Locale>(["ja", "zh-CN", "zh-TW"]);
const CJK_LINE_REVEAL_SPEED = 140;

function getDeviceRevealDelay(
  steps: readonly { text: string; speed: number }[],
  index: number,
  locale: Locale,
) {
  if (!CJK_LOCALES.has(locale)) {
    return getTypeRevealDelay(steps, index, 160, 190);
  }

  return steps.slice(0, index).reduce(
    (delay, step) =>
      delay + step.text.split("\n").length * CJK_LINE_REVEAL_SPEED + 160,
    190,
  );
}

export function DeviceSection({
  index,
  category,
  title,
  body,
  device,
  reversed = false,
  className = "",
  cosmosVariant,
  journeyId,
  locale,
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
      id={`device-${journeyId}`}
      className={`device-showcase-row${reversed ? " is-reversed" : ""}${className ? ` ${className}` : ""}`}
      aria-labelledby={titleId}
      data-device-journey-section={journeyId}
    >
      <SectionCosmos variant={cosmosVariant} />
      <div className="device-showcase-visual">{device}</div>
      <div className="device-showcase-copy">
        <TypeReveal
          as="span"
          className="device-showcase-eyebrow"
          text={revealSteps[0].text}
          speed={revealSteps[0].speed}
          delay={getDeviceRevealDelay(revealSteps, 0, locale)}
        />
        <TypeReveal
          as="h2"
          id={titleId}
          text={revealSteps[1].text}
          speed={revealSteps[1].speed}
          delay={getDeviceRevealDelay(revealSteps, 1, locale)}
          preserveLineBreaks
        />
        <div className="device-showcase-body">
          <TypeReveal
            as="p"
            text={revealSteps[2].text}
            speed={revealSteps[2].speed}
            delay={getDeviceRevealDelay(revealSteps, 2, locale)}
            preserveLineBreaks
          />
        </div>
      </div>
    </TypeRevealGroup>
  );
}
