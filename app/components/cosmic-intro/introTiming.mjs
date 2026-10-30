// Shared by the CSS clock, lifecycle deadline and world-space camera.
export const COSMIC_INTRO_TIMING = Object.freeze({
  durationMs: 6000,
  reducedDurationMs: 1200,
  logoVisibleMs: 600,
  letterStartMs: 1000,
  letterStaggerMs: 75,
  letterDurationMs: 420,
  logoHoldMs: 2200,
  logoExitMs: 2600,
  bodiesStartMs: 1900,
  bodiesVisibleMs: 2400,
  flightStartMs: 2000,
  cruiseMs: 2500,
  revealMs: 5200,
  maxSpeed: 2300,
  planetPassMs: Object.freeze({ rocky: 2900, gas: 3350, atmosphere: 3850, ice: 4300, moon: 4750, distant: 5120 }),
  mobilePassMs: Object.freeze({ gas: 3850, atmosphere: 5050 }),
  constellationPassMs: Object.freeze({ north: 3650, south: 4700 }),
});

const at = (ms) => `${(100 * ms / COSMIC_INTRO_TIMING.durationMs).toFixed(6)}%`;
const timing = COSMIC_INTRO_TIMING;

// Emit the keyframe offsets from milliseconds so CSS and camera cannot drift.
export const COSMIC_INTRO_TIMELINE_CSS = `
html[data-cosmic-intro="true"] {
  --cosmic-entry-duration: ${timing.durationMs}ms;
  --cosmic-letter-start: ${timing.letterStartMs}ms;
  --cosmic-letter-stagger: ${timing.letterStaggerMs}ms;
  --cosmic-letter-duration: ${timing.letterDurationMs}ms;
}
html[data-cosmic-intro="true"][data-cosmic-intro-motion="reduced"] {
  --cosmic-entry-duration: ${timing.reducedDurationMs}ms;
}
@keyframes cosmic-entry-logo {
  0% { opacity: 0; transform: scale(0.97); }
  ${at(timing.logoVisibleMs)}, ${at(timing.logoHoldMs)} { opacity: 1; transform: scale(1); }
  ${at(timing.logoExitMs)}, 100% { opacity: 0; transform: scale(1.025); }
}
@keyframes cosmic-entry-veil {
  0%, ${at(timing.revealMs)} { opacity: 1; }
  100% { opacity: 0; }
}
@keyframes cosmic-entry-content {
  0%, ${at(timing.revealMs)} { opacity: 0; }
  100% { opacity: 1; }
}
@keyframes cosmic-entry-home-stars {
  0%, ${at(timing.revealMs)} { opacity: 0; }
  100% { opacity: var(--entry-opacity); }
}
@keyframes cosmic-body-arrival {
  0%, ${at(timing.bodiesStartMs)} { opacity: 0; }
  ${at(timing.bodiesVisibleMs)}, 100% { opacity: 1; }
}
@keyframes cosmic-space-reveal {
  0% { opacity: 0; }
  ${at(timing.logoVisibleMs)}, ${at(timing.revealMs)} { opacity: 1; }
  100% { opacity: 0; }
}
`;
