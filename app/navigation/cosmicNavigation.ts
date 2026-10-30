export type WarpTiming = {
  duration: number;
  departure: number;
  arrival: number;
  reduced: boolean;
};

export type WarpState = {
  id: number;
  href: string;
  phase: "departing" | "travelling" | "arriving";
  timing: WarpTiming;
};

type LinkActivation = {
  button: number;
  metaKey: boolean;
  ctrlKey: boolean;
  shiftKey: boolean;
  altKey: boolean;
  target: string;
  download: boolean;
};

export const routePath = (pathname: string) => pathname.replace(/\/+$/, "") || "/";

export function warpPreviewEnabled(search: string, development: boolean, previous: boolean) {
  if (!development) return false;
  const preview = new URLSearchParams(search).get("warp");
  return preview === "full" || (preview !== "reduced" && previous);
}

export function navigationKind(current: URL, destination: URL, event: LinkActivation) {
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey
    || (event.target && event.target !== "_self") || event.download
    || !["http:", "https:"].includes(destination.protocol)
    || destination.origin !== current.origin) return "native";
  return routePath(current.pathname) === routePath(destination.pathname)
    && current.search === destination.search ? "anchor" : "route";
}

export function getWarpTiming(from: string, to: string, reduced: boolean, compact: boolean, introHandoff = false): WarpTiming {
  if (introHandoff) return { duration: 0, departure: 0, arrival: 0, reduced: true };
  if (reduced) return { duration: 120, departure: 0, arrival: 100, reduced: true };
  const home = routePath(from) === "/" || routePath(to) === "/";
  const support = routePath(from) === "/support" || routePath(to) === "/support";
  const duration = home ? support ? 740 : 560 : 460;
  return {
    duration: compact ? Math.round(duration * 0.84) : duration,
    departure: compact ? 120 : 160,
    arrival: compact ? 180 : 220,
    reduced: false,
  };
}

type WarpLifecycleOptions = {
  now: () => number;
  setTimer: (callback: () => void, delay: number) => number;
  clearTimer: (id: number) => void;
  isReady: (href: string) => boolean;
  onPhase: (state: WarpState) => void;
  onReady: (href: string) => void;
  onFinish: (reason: "complete" | "cancelled" | "timeout" | "error") => void;
};

// A single bounded clock owns each run. Superseded callbacks cannot settle a newer route.
export function createWarpLifecycle(options: WarpLifecycleOptions) {
  let sequence = 0;
  let current: WarpState | null = null;
  const timers = new Set<number>();
  const finish = (reason: Parameters<WarpLifecycleOptions["onFinish"]>[0]) => {
    if (!current) return;
    current = null;
    for (const timer of timers) options.clearTimer(timer);
    timers.clear();
    options.onFinish(reason);
  };
  const schedule = (id: number, callback: () => void, delay: number) => {
    const timer = options.setTimer(() => {
      timers.delete(timer);
      if (current?.id === id) callback();
    }, delay);
    timers.add(timer);
    return timer;
  };
  return {
    get active() { return current !== null; },
    cancel() { finish("cancelled"); },
    start(href: string, timing: WarpTiming, navigate: () => void) {
      finish("cancelled");
      const id = ++sequence;
      const started = options.now();
      let deadline: number | null = null;
      current = { id, href, timing, phase: "departing" };
      const phase = (value: WarpState["phase"]) => {
        if (current?.id !== id) return;
        current = { ...current, phase: value };
        options.onPhase(current);
      };
      const check = () => {
        try {
          if (!options.isReady(href)) {
            schedule(id, check, 30);
            return;
          }
          if (deadline !== null) {
            options.clearTimer(deadline);
            timers.delete(deadline);
          }
          options.onReady(href);
          const arrive = () => {
            phase("arriving");
            const remaining = Math.max(timing.arrival, timing.duration - (options.now() - started));
            if (remaining <= 0) finish("complete");
            else schedule(id, () => finish("complete"), remaining);
          };
          const departureRemaining = timing.departure - (options.now() - started);
          if (departureRemaining > 0) schedule(id, arrive, departureRemaining);
          else arrive();
        } catch {
          finish("error");
        }
      };
      try {
        phase("departing");
        navigate();
        schedule(id, () => {
          if (current?.phase === "departing") phase("travelling");
        }, timing.departure);
        deadline = schedule(id, () => finish("timeout"), 2500);
        schedule(id, check, 0);
      } catch {
        finish("error");
      }
    },
  };
}
