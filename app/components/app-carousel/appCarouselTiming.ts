export const APP_CAROUSEL_TIMING = {
  autoplayResumeDelayMs: 3000,
  playResumeDelayMs: 400,
  typeCharacterIntervalMs: 70,
  nameEmphasisMs: 300,
  platformRevealMs: 250,
  detailRevealMs: 300,
  completeHoldMs: 500,
} as const;

export type AppNameSequencePhase =
  | "typing"
  | "name-emphasis"
  | "platform-reveal"
  | "detail-reveal"
  | "hold"
  | "complete";

export const getAppNameCharacters = (appName: string) => Array.from(appName);

export const getAppNameSequenceDurationMs = (appName: string) =>
  getAppNameCharacters(appName).length *
    APP_CAROUSEL_TIMING.typeCharacterIntervalMs +
  APP_CAROUSEL_TIMING.nameEmphasisMs +
  APP_CAROUSEL_TIMING.platformRevealMs +
  APP_CAROUSEL_TIMING.detailRevealMs +
  APP_CAROUSEL_TIMING.completeHoldMs;

export const getAppNameSequenceSnapshot = (
  appName: string,
  elapsedMs: number,
): {
  phase: AppNameSequencePhase;
  visibleCharacterCount: number;
} => {
  const characterCount = getAppNameCharacters(appName).length;
  const elapsed = Math.max(0, elapsedMs);
  const typingEnd =
    characterCount * APP_CAROUSEL_TIMING.typeCharacterIntervalMs;
  const emphasisEnd = typingEnd + APP_CAROUSEL_TIMING.nameEmphasisMs;
  const platformEnd = emphasisEnd + APP_CAROUSEL_TIMING.platformRevealMs;
  const detailEnd = platformEnd + APP_CAROUSEL_TIMING.detailRevealMs;
  const completeAt = detailEnd + APP_CAROUSEL_TIMING.completeHoldMs;

  if (elapsed < typingEnd) {
    return {
      phase: "typing",
      visibleCharacterCount: Math.min(
        characterCount,
        Math.floor(elapsed / APP_CAROUSEL_TIMING.typeCharacterIntervalMs),
      ),
    };
  }

  const phase =
    elapsed < emphasisEnd
      ? "name-emphasis"
      : elapsed < platformEnd
        ? "platform-reveal"
        : elapsed < detailEnd
          ? "detail-reveal"
          : elapsed < completeAt
            ? "hold"
            : "complete";

  return { phase, visibleCharacterCount: characterCount };
};
