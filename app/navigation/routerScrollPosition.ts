type RouterHistory = { state: unknown; replaceState: (data: unknown, unused: string) => void };

// Vinext 0.0.50 restores these coordinates from the destination history entry.
// Also record the latest entry, which may be left via Back rather than router.push.
export function persistRouterScroll(history: RouterHistory, x: number, y: number) {
  if (!Number.isFinite(x) || !Number.isFinite(y)) return;
  const state = history.state;
  if (state !== null && typeof state !== "object") return;
  const previous = (state ?? {}) as Record<string, unknown>;
  if (previous.__vinext_scrollX === x && previous.__vinext_scrollY === y) return;
  try {
    history.replaceState({ ...previous, __vinext_scrollX: x, __vinext_scrollY: y }, "");
  } catch {
    // History may be restricted. Navigation and content remain available.
  }
}

export function createScrollRecorder(options: {
  setTimer: (callback: () => void, delay: number) => number;
  clearTimer: (id: number) => void;
  save: () => void;
}) {
  let timer: number | null = null;
  const cancel = () => {
    if (timer !== null) options.clearTimer(timer);
    timer = null;
  };
  const flush = () => { cancel(); options.save(); };
  return {
    schedule() {
      cancel();
      timer = options.setTimer(flush, 150);
    },
    flush,
    cancel,
  };
}
