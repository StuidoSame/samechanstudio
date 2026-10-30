export const COSMIC_INTRO_DURATION_MS = 8000;
export const COSMIC_INTRO_REDUCED_DURATION_MS = 1200;
export const COSMIC_INTRO_DEVELOPMENT = process.env.NODE_ENV === "development";

type IntroDecision = {
  mode: "full" | "reduced" | null;
  preview: boolean;
  reason: string;
  seen: boolean;
  reducedMotion: boolean;
  session: "new" | "started" | "complete" | "skipped" | "interrupted";
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
  const readSession = (value: string | null | undefined): IntroDecision["session"] =>
    value === "1" || value === "complete" ? "complete"
      : value === "started" || value === "skipped" || value === "interrupted" ? value : "new";
  let session = readSession(root.dataset.cosmicIntroStatus);
  if (root.dataset.cosmicIntroSeen === "true") session = "complete";
  let storageAvailable = true;
  try {
    const stored = readSession(view.sessionStorage.getItem("same-studio-cosmic-intro-v2"));
    if (stored !== "new") session = stored;
  } catch {
    storageAvailable = false;
  }
  const seen = session !== "new";
  let reducedMotion = false;
  let navigation: PerformanceNavigationTiming | undefined;
  try {
    reducedMotion = view.matchMedia("(prefers-reduced-motion: reduce)").matches;
    navigation = view.performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
  } catch {
    return { mode: null, preview, reason: "initialization", seen, session, reducedMotion };
  }
  const reason = view.location.pathname !== "/" ? "route"
    : skip ? "internal-navigation"
    : view.document.visibilityState !== "visible" ? "hidden"
    : !preview && !storageAvailable ? "storage"
    : view.location.hash || view.scrollY > 0 ? "restored-position"
    : !preview && navigation?.type === "back_forward" ? "history"
    : !preview && seen ? "seen"
    : "play";
  return {
    mode: reason !== "play" ? null : reducedMotion && request !== "full" ? "reduced" : "full",
    preview,
    reason,
    seen,
    session,
    reducedMotion,
  };
}

export function createCosmicIntroInitializationScript(development: boolean) {
  return `(() => { try {
    const decision = (${getCosmicIntroDecision.toString()})(window, false, ${JSON.stringify(development)});
    const root = document.documentElement;
    if (${JSON.stringify(development)}) {
      root.dataset.cosmicIntroState = decision.mode ? "prepared" : "skipped-" + decision.reason;
      root.dataset.cosmicIntroSession = decision.session;
      root.dataset.cosmicIntroPreference = decision.reducedMotion ? "reduce" : "no-preference";
    }
    if (!decision.mode) return;
    root.dataset.cosmicIntro = "true";
    root.dataset.cosmicIntroMotion = decision.mode;
    if (decision.preview) root.dataset.cosmicIntroPreview = "true";
  } catch {
    delete document.documentElement.dataset.cosmicIntro;
    delete document.documentElement.dataset.cosmicIntroMotion;
    delete document.documentElement.dataset.cosmicIntroPreview;
  } })();`;
}

// CSS starts with the rendered logo, rather than a clock started in <head>.
export const cosmicIntroInitializationScript =
  createCosmicIntroInitializationScript(COSMIC_INTRO_DEVELOPMENT);

export function claimCosmicIntro(view: Window, skip: boolean, development = false) {
  const decision = getCosmicIntroDecision(view, skip, development);
  const root = view.document.documentElement;
  if (development) {
    root.dataset.cosmicIntroState = decision.mode ? "prepared" : `skipped-${decision.reason}`;
    root.dataset.cosmicIntroSession = decision.session;
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
  let started = false;
  let settled = false;
  let deadline: number | null = null;
  const preview = root.dataset.cosmicIntroPreview === "true";
  const record = (status: Exclude<IntroDecision["session"], "new">) => {
    if (preview) return true;
    root.dataset.cosmicIntroStatus = status;
    if (status === "started") root.dataset.cosmicIntroStarted = "true";
    else delete root.dataset.cosmicIntroStarted;
    if (status === "complete") root.dataset.cosmicIntroSeen = "true";
    if (development) root.dataset.cosmicIntroSession = status;
    try {
      view.sessionStorage.setItem("same-studio-cosmic-intro-v2", status === "complete" ? "1" : status);
      return true;
    } catch { return false; }
  };

  const dispose = () => {
    if (disposed) return;
    if (started && !settled) record("interrupted");
    disposed = true;
    if (deadline !== null) view.clearTimeout(deadline);
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
    settled = true;
    if (started) record(reason === "animation" ? "complete" : reason === "input" ? "skipped" : "interrupted");
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
  let animation: Animation | undefined;
  try {
    animation = view.document.querySelector(".cosmic-intro")?.getAnimations?.().find((entry) =>
      "animationName" in entry && String(entry.animationName).startsWith("cosmic-entry-logo"),
    );
  } catch {
    // Missing/failed animation APIs must release content before recording a visit.
  }
  if (!animation || animation.playState === "paused" || animation.playState === "idle") {
    finish("unavailable");
    return dispose;
  }
  started = true;
  // Starting prevents a reload loop, but is distinct from normal completion.
  if (!record("started")) {
    finish("storage");
    return dispose;
  }
  const elapsed = typeof animation?.currentTime === "number" ? animation.currentTime : 0;
  // An absent CSS end event must never leave the page covered.
  deadline = view.setTimeout(() => finish("deadline"), Math.max(0, duration + 200 - elapsed));
  inputEvents.forEach((event) =>
    view.addEventListener(event, onInput, { capture: true, passive: true }),
  );
  view.addEventListener("pagehide", onPageHide);
  view.document.addEventListener("visibilitychange", onVisibilityChange);
  motion.addEventListener("change", onMotionChange);
  root.addEventListener("animationend", onAnimationEnd);
  return dispose;
}
