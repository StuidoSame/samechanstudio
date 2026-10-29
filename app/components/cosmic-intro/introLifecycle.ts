export const COSMIC_INTRO_DURATION_MS = 2100;
const SESSION_KEY = "same-studio-cosmic-intro-v1";

// Runs in <head> so the first server-rendered frame and hydrated frame agree.
// CSS completes the reveal even if React fails to initialize.
export const cosmicIntroInitializationScript = `
  (() => {
    const root = document.documentElement;
    let seen = false;
    try { seen = window.sessionStorage.getItem(${JSON.stringify(SESSION_KEY)}) === "1"; } catch {}
    const navigation = window.performance.getEntriesByType("navigation")[0];
    if (
      window.location.pathname !== "/" || seen || window.location.hash ||
      window.scrollY > 0 || document.visibilityState !== "visible" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      navigation?.type === "back_forward"
    ) return;
    root.dataset.cosmicIntro = "true";
    root.dataset.cosmicIntroStarted = String(window.performance.now());
  })();
`;

export function claimCosmicIntro(view: Window, skip: boolean) {
  const root = view.document.documentElement;
  let seen = root.dataset.cosmicIntroSeen === "true";
  try {
    seen = view.sessionStorage.getItem(SESSION_KEY) === "1" || seen;
    view.sessionStorage.setItem(SESSION_KEY, "1");
  } catch {
    // The document marker covers internal navigation when storage is blocked.
  }
  root.dataset.cosmicIntroSeen = "true";

  const navigation = view.performance.getEntriesByType("navigation")[0] as
    | PerformanceNavigationTiming
    | undefined;
  return (
    !seen &&
    !skip &&
    !view.matchMedia("(prefers-reduced-motion: reduce)").matches &&
    view.document.visibilityState === "visible" &&
    !view.location.hash &&
    view.scrollY < 1 &&
    navigation?.type !== "back_forward"
  );
}

export function playCosmicIntro(
  root: HTMLElement,
  view: Window,
  onFinish: () => void,
) {
  const motion = view.matchMedia("(prefers-reduced-motion: reduce)");
  const inputEvents = ["pointerdown", "keydown", "wheel", "touchstart", "focusin", "scroll"] as const;
  let disposed = false;

  const dispose = () => {
    if (disposed) return;
    disposed = true;
    view.clearTimeout(deadline);
    delete root.dataset.cosmicIntro;
    delete root.dataset.cosmicIntroStarted;
    root.style.removeProperty("--cosmic-entry-duration");
    inputEvents.forEach((event) => view.removeEventListener(event, finish, true));
    view.removeEventListener("pagehide", finish);
    view.document.removeEventListener("visibilitychange", onVisibilityChange);
    motion.removeEventListener("change", onMotionChange);
    root.removeEventListener("animationend", onAnimationEnd);
  };
  const finish = () => {
    if (disposed) return;
    dispose();
    onFinish();
  };
  const onVisibilityChange = () => {
    if (view.document.visibilityState !== "visible") finish();
  };
  const onMotionChange = () => {
    if (motion.matches) finish();
  };
  const onAnimationEnd = (event: AnimationEvent) => {
    if (event.animationName === "cosmic-entry-logo") finish();
  };

  // This is a cleanup deadline for a decorative animation, never an asset gate.
  const started = Number(root.dataset.cosmicIntroStarted);
  const elapsed = Number.isFinite(started) ? view.performance.now() - started : 0;
  const deadline = view.setTimeout(finish, Math.max(0, COSMIC_INTRO_DURATION_MS + 100 - elapsed));
  root.style.setProperty("--cosmic-entry-duration", `${COSMIC_INTRO_DURATION_MS}ms`);
  root.dataset.cosmicIntro = "true";
  inputEvents.forEach((event) =>
    view.addEventListener(event, finish, { capture: true, passive: true }),
  );
  view.addEventListener("pagehide", finish);
  view.document.addEventListener("visibilitychange", onVisibilityChange);
  motion.addEventListener("change", onMotionChange);
  root.addEventListener("animationend", onAnimationEnd);

  return dispose;
}
