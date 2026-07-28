"use client";

import { useState } from "react";

const MAX_IMAGE_RETRIES = 1;

type ResilientScreenshotImageProps = {
  alt: string;
  className: string;
  errorLabel: string;
  loading?: "eager" | "lazy";
  onLoad?: () => void;
  src: string;
};

function retrySource(src: string, attempt: number) {
  if (attempt === 0) return src;
  const separator = src.includes("?") ? "&" : "?";
  return `${src}${separator}same-studio-retry=${attempt}`;
}

export function ResilientScreenshotImage({
  alt,
  className,
  errorLabel,
  loading = "lazy",
  onLoad,
  src,
}: ResilientScreenshotImageProps) {
  const [attempt, setAttempt] = useState(0);
  const [status, setStatus] = useState<"loading" | "loaded" | "error">(
    "loading",
  );

  return (
    <>
      {status === "loading" ? (
        <span className="app-screenshot-loading" aria-hidden="true" />
      ) : null}
      {/* Native loading avoids a second visibility observer inside the horizontally clipped modal. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        key={retrySource(src, attempt)}
        className={`${className}${status === "loaded" ? " is-loaded" : ""}`}
        src={retrySource(src, attempt)}
        alt={alt}
        loading={loading}
        decoding="async"
        draggable={false}
        onLoad={() => {
          setStatus("loaded");
          onLoad?.();
        }}
        onError={() => {
          if (attempt < MAX_IMAGE_RETRIES) {
            setStatus("loading");
            setAttempt((current) => current + 1);
            return;
          }

          setStatus("error");
          console.error(`[SAME STUDIO] Screenshot failed to load: ${src}`);
        }}
      />
      {status === "error" ? (
        <span className="app-screenshot-error" role="status">
          {errorLabel}
        </span>
      ) : null}
    </>
  );
}
