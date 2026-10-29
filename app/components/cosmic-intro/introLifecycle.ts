export const COSMIC_INTRO_DURATION_MS = 2400;
export const COSMIC_INTRO_REDUCED_DURATION_MS = 1200;
export const COSMIC_INTRO_DEVELOPMENT = process.env.NODE_ENV === "development";

type IntroDecision = {
  mode: "full" | "reduced" | null;
  preview: boolean;
  reason: string;
  seen: boolean;
  reducedMotion: boolean;
};

// Self-contained so the head script and hydration use exactly the same policy.
export function getCosmicIntroDecision(
  view: Window,
  skip: boolean,
  development: boolean,
): IntroDecision {
  const root = view.document.documentElement;
  const request = development
    ? new URLSearchParams(view.location.search).get("intro")
    : null;
  const preview = request === "replay" || request === "full";
  let seen = root.dataset.cosmicIntroSeen === "true";
  try {
    seen = view.sessionStorage.getItem("same-studio-cosmic-intro-v2") === "1" || seen;
  } catch {
    // Internal navigation still has the document marker without storage access.
  }
  const reducedMotion = view.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const navigation = view.performance.getEntriesByType("navigation")[0] as
    | PerformanceNavigationTiming
    | undefined;
  const reason = view.location.pathname !== "/" ? "route"
    : skip ? "internal-navigation"
    : view.document.visibilityState !== "visible" ? "hidden"
    : view.location.hash || view.scrollY > 0 ? "restored-position"
    : !preview && navigation?.type === "back_forward" ? "history"
    : !preview && seen ? "seen"
    : "play";
  return {
    mode: reason !== "play" ? null : reducedMotion && request !== "full" ? "reduced" : "full",
    preview,
    reason,
    seen,
    reducedMotion,
  };
}

export function createCosmicIntroInitializationScript(development: boolean) {
  return `(() => {
    const decision = (${getCosmicIntroDecision.toString()})(window, false, ${JSON.stringify(development)});
    const root = document.documentElement;
    if (${JSON.stringify(development)}) {
      root.dataset.cosmicIntroState = decision.mode ? "prepared" : "skipped-" + decision.reason;
      root.dataset.cosmicIntroSession = decision.seen ? "seen" : "new";
      root.dataset.cosmicIntroPreference = decision.reducedMotion ? "reduce" : "no-preference";
    }
    if (!decision.mode) return;
    root.dataset.cosmicIntro = "true";
    root.dataset.cosmicIntroMotion = decision.mode;
    if (decision.preview) root.dataset.cosmicIntroPreview = "true";
  })();`;
}

// CSS starts with the rendered logo, rather than a clock started in <head>.
export const cosmicIntroInitializationScript =
  createCosmicIntroInitializationScript(COSMIC_INTRO_DEVELOPMENT);

export function claimCosmicIntro(view: Window, skip: boolean, development = false) {
  const decision = getCosmicIntroDecision(view, skip, development);
  const root = view.document.documentElement;
  if (development) {
    root.dataset.cosmicIntroState = decision.mode ? "prepared" : `skipped-${decision.reason}`;
    root.dataset.cosmicIntroSession = decision.seen ? "seen" : "new";
    root.dataset.cosmicIntroPreference = decision.reducedMotion ? "reduce" : "no-preference";
  }
  if (!decision.mode) return false;
  root.dataset.cosmicIntroMotion = decision.mode;
  if (decision.preview) root.dataset.cosmicIntroPreview = "true";
  return true;
}

export function playCosmicIntro(
  root: HTMLElement,
  view: Window,
  onFinish: () => void,
  development = false,
) {
  const motion = view.matchMedia("(prefers-reduced-motion: reduce)");
  const inputEvents = ["pointerdown", "keydown", "wheel", "touchstart"] as const;
  const duration = root.dataset.cosmicIntroMotion === "reduced"
    ? COSMIC_INTRO_REDUCED_DURATION_MS : COSMIC_INTRO_DURATION_MS;
  let disposed = false;

  const dispose = () => {
    if (disposed) return;
    disposed = true;
    view.clearTimeout(deadline);
    delete root.dataset.cosmicIntro;
    delete root.dataset.cosmicIntroMotion;
    delete root.dataset.cosmicIntroPreview;
    root.style.removeProperty("--cosmic-entry-duration");
    inputEvents.forEach((event) => view.removeEventListener(event, onInput, true));
    view.removeEventListener("pagehide", onPageHide);
    view.document.removeEventListener("visibilitychange", onVisibilityChange);
    motion.removeEventListener("change", onMotionChange);
    root.removeEventListener("animationend", onAnimationEnd);
  };
  const finish = (reason: string) => {
    if (disposed) return;
    dispose();
    if (development) root.dataset.cosmicIntroState = `finished-${reason}`;
    onFinish();
  };
  const onInput = (event: Event) => {
    if (event.isTrusted) finish("input");
  };
  const onPageHide = () => finish("pagehide");
  const onVisibilityChange = () => {
    if (view.document.visibilityState !== "visible") finish("hidden");
  };
  const onMotionChange = () => {
    if (motion.matches) finish("motion-change");
  };
  const onAnimationEnd = (event: AnimationEvent) => {
    if (event.animationName === "cosmic-entry-logo" || event.animationName === "cosmic-entry-logo-reduced") {
      finish("animation");
    }
  };

  root.style.setProperty("--cosmic-entry-duration", `${duration}ms`);
  root.dataset.cosmicIntro = "true";
  if (development) root.dataset.cosmicIntroState = "running";
  // Skipped mounts never consume a visit. Explicit dev previews preserve it too.
  if (root.dataset.cosmicIntroPreview !== "true") {
    root.dataset.cosmicIntroSeen = "true";
    try { view.sessionStorage.setItem("same-studio-cosmic-intro-v2", "1"); } catch {}
  }

  const logo = view.document.querySelector(".cosmic-intro");
  const animation = logo?.getAnimations?.().find((entry) =>
    "animationName" in entry && String(entry.animationName).startsWith("cosmic-entry-logo"),
  );
  const elapsed = typeof animation?.currentTime === "number" ? animation.currentTime : 0;
  // An absent CSS end event must never leave the page covered.
  const deadline = view.setTimeout(() => finish("deadline"), Math.max(0, duration + 200 - elapsed));
  inputEvents.forEach((event) =>
    view.addEventListener(event, onInput, { capture: true, passive: true }),
  );
  view.addEventListener("pagehide", onPageHide);
  view.document.addEventListener("visibilitychange", onVisibilityChange);
  motion.addEventListener("change", onMotionChange);
  root.addEventListener("animationend", onAnimationEnd);
  return dispose;
}
