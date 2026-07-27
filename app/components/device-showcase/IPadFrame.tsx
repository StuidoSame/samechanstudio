"use client";

import { useState, type PointerEvent, type ReactNode } from "react";

const IDEA_CARDS = [
  {
    title: "A small idea",
    body: "Make room for what feels gentle.",
    className: "idea-board-card--one",
  },
  {
    title: "Keep this thought",
    body: "Tiny steps still move things forward.",
    className: "idea-board-card--two",
  },
  {
    title: "For later",
    body: "Notice the quiet parts, too.",
    className: "idea-board-card--three",
  },
] as const;

type IPadFrameProps = {
  children?: ReactNode;
};

export function IPadFrame({ children }: IPadFrameProps) {
  const [activeCard, setActiveCard] = useState(0);

  const updateBoardTilt = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "touch") return;

    const bounds = event.currentTarget.getBoundingClientRect();
    const pointerX = (event.clientX - bounds.left) / bounds.width - 0.5;
    const pointerY = (event.clientY - bounds.top) / bounds.height - 0.5;
    event.currentTarget.style.setProperty("--board-tilt-x", `${pointerX * 2.4}deg`);
    event.currentTarget.style.setProperty("--board-tilt-y", `${pointerY * -2}deg`);
  };

  const resetBoardTilt = (event: PointerEvent<HTMLDivElement>) => {
    event.currentTarget.style.setProperty("--board-tilt-x", "0deg");
    event.currentTarget.style.setProperty("--board-tilt-y", "0deg");
  };

  return (
    <div className="device-tablet-stage" aria-label="Interactive iPad idea board">
      <div className="device-tablet-frame">
        <div className="device-screen device-tablet-screen">
          {children ?? (
            <div
              className="idea-board"
              onPointerMove={updateBoardTilt}
              onPointerLeave={resetBoardTilt}
            >
              <div className="idea-board-heading">
                <span>IDEA SPACE</span>
                <small>A little more room for ideas.</small>
              </div>
              <div className="idea-board-canvas">
                <span className="idea-board-path" aria-hidden="true" />
                {IDEA_CARDS.map((card, index) => (
                  <button
                    key={card.title}
                    type="button"
                    className={`idea-board-card ${card.className}${activeCard === index ? " is-active" : ""}`}
                    aria-pressed={activeCard === index}
                    onClick={() => setActiveCard(index)}
                  >
                    <span>{card.title}</span>
                    <p>{card.body}</p>
                    <i aria-hidden="true" />
                  </button>
                ))}
                <span className="idea-board-sticker" aria-hidden="true">✦</span>
                <span className="idea-board-dot idea-board-dot--one" aria-hidden="true" />
                <span className="idea-board-dot idea-board-dot--two" aria-hidden="true" />
              </div>
            </div>
          )}
        </div>
        <span className="device-tablet-camera" aria-hidden="true" />
        <span className="device-tablet-button" aria-hidden="true" />
        <span className="device-frame-highlight" aria-hidden="true" />
      </div>
    </div>
  );
}
