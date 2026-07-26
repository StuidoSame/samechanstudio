import type { ReactNode } from "react";

type DeviceSectionProps = {
  index: string;
  category: string;
  title: string;
  body: ReactNode;
  device: ReactNode;
  reversed?: boolean;
  className?: string;
};

export function DeviceSection({
  index,
  category,
  title,
  body,
  device,
  reversed = false,
  className = "",
}: DeviceSectionProps) {
  const titleId = `device-showcase-title-${index}`;

  return (
    <section
      className={`device-showcase-row${reversed ? " is-reversed" : ""}${className ? ` ${className}` : ""}`}
      aria-labelledby={titleId}
    >
      <div className="device-showcase-visual">{device}</div>
      <div className="device-showcase-copy">
        <span className="device-showcase-eyebrow">
          {index} / {category}
        </span>
        <h2 id={titleId}>{title}</h2>
        <div className="device-showcase-body">{body}</div>
      </div>
    </section>
  );
}
