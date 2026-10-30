"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from "react";
import {
  ArchivePortalTransition,
  type PageTransitionDestination,
  type PageTransitionState,
} from "../components/archive/ArchivePortalTransition";
import { getCosmicIntroDecision } from "../components/cosmic-intro/introLifecycle";
import { createWarpLifecycle, getWarpTiming, navigationKind, routePath, warpPreviewEnabled } from "./cosmicNavigation";
import { createScrollRecorder, persistRouterScroll } from "./routerScrollPosition";
import { PageTransitionContext } from "./PageTransitionContext";
import "./cosmic-navigation.css";

const HEADER_SCROLL_GAP_PX = 24;
const INTERNAL_HOME_NAVIGATION_KEY = "same-studio-internal-home-navigation-v1";
const PENDING_DESTINATION_KEY = "same-studio-pending-destination-v1";

function getDestination(href: string): PageTransitionDestination {
  const url = new URL(href, window.location.href);
  const pathname = url.pathname.length > 1 ? url.pathname.replace(/\/+$/, "") : url.pathname;
  if (url.hash === "#about") return "ABOUT";
  if (url.hash === "#apps") return "APPS";
  if (url.hash === "#contact") return "CONTACT";
  if (pathname === "/support") return "SUPPORT";
  if (pathname === "/terms") return "TERMS";
  if (pathname === "/privacy") return "PRIVACY";
  if (pathname === "/delete-account") return "DELETE ACCOUNT";
  return "HOME";
}

function focusWithoutScrolling(element: HTMLElement | null) {
  if (!element) return;
  if (!element.hasAttribute("tabindex")) element.setAttribute("tabindex", "-1");
  element.focus({ preventScroll: true });
}

function scrollImmediately(top: number) {
  const root = document.documentElement;
  const previousScrollBehavior = root.style.scrollBehavior;
  root.style.scrollBehavior = "auto";
  window.scrollTo({ top, behavior: "auto" });
  root.style.scrollBehavior = previousScrollBehavior;
}

function settleDestination(href: string) {
  const url = new URL(href, window.location.href);
  if (url.hash) {
    const section = document.getElementById(decodeURIComponent(url.hash.slice(1)));
    if (section) {
      const headerHeight =
        document.querySelector<HTMLElement>(".site-header")?.offsetHeight ?? 0;
      const root = document.documentElement;
      const previousScrollBehavior = root.style.scrollBehavior;
      root.style.scrollBehavior = "auto";
      section.scrollIntoView({ block: "start", behavior: "auto" });
      const minimumTop = headerHeight + HEADER_SCROLL_GAP_PX;
      const sectionTop = section.getBoundingClientRect().top;
      if (sectionTop < minimumTop) {
        window.scrollBy({ top: sectionTop - minimumTop, behavior: "auto" });
      }
      root.style.scrollBehavior = previousScrollBehavior;
      focusWithoutScrolling(
        section.querySelector<HTMLElement>("h1, h2, [data-focus-target]") ??
          section,
      );
      return true;
    }
    return false;
  }

  scrollImmediately(0);
  focusWithoutScrolling(
    document.querySelector<HTMLElement>("main h1, main [data-focus-target]")
      ?? document.querySelector<HTMLElement>("main"),
  );
  return true;
}

function destinationIsReady(href: string) {
  const url = new URL(href, window.location.href);
  const routeMatches =
    routePath(window.location.pathname) === routePath(url.pathname) &&
    window.location.search === url.search;
  if (!routeMatches) return false;
  if (routePath(url.pathname) === "/" && !document.querySelector(".site-shell")) return false;
  const archivePage = routePath(url.pathname).slice(1);
  if (["support", "privacy", "terms", "delete-account"].includes(archivePage)
    && document.body.dataset.archiveDocument !== archivePage) return false;
  if (!document.querySelector("main")) return false;
  return !url.hash || Boolean(
    document.getElementById(decodeURIComponent(url.hash.slice(1))),
  );
}

export function consumeInternalHomeNavigation() {
  if (typeof window === "undefined") return false;
  const documentMarker =
    document.documentElement.dataset.internalHomeNavigation === "true";
  let storedMarker = false;
  try {
    storedMarker =
      window.sessionStorage.getItem(INTERNAL_HOME_NAVIGATION_KEY) === "1";
    window.sessionStorage.removeItem(INTERNAL_HOME_NAVIGATION_KEY);
  } catch {
    // The document marker covers storage-restricted browser contexts.
  }
  return documentMarker || storedMarker;
}

// Route commits keep this provider; one lifecycle owns all transient visual work.
export function PageTransitionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [transition, setTransition] = useState<PageTransitionState | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const previewRef = useRef(false);
  const lastPathRef = useRef(pathname);
  const [lifecycle] = useState(() => createWarpLifecycle({
    now: () => window.performance.now(),
    setTimer: (callback, delay) => window.setTimeout(callback, delay),
    clearTimer: (timer) => window.clearTimeout(timer),
    isReady: destinationIsReady,
    onPhase: (state) => {
      document.body.classList.add("is-page-transitioning");
      document.body.setAttribute("aria-busy", "true");
      document.body.dataset.warpPhase = state.phase;
      document.body.dataset.warpMotion = state.timing.duration === 0 ? "handoff" : state.timing.reduced ? "reduced" : "full";
      document.body.style.setProperty("--warp-duration", state.timing.duration + "ms");
      document.body.style.setProperty("--warp-departure", state.timing.departure + "ms");
      document.body.style.setProperty("--warp-arrival", state.timing.arrival + "ms");
      setTransition({ ...state, destination: getDestination(state.href) });
    },
    onReady: (href) => {
      settleDestination(href);
      persistRouterScroll(window.history, window.scrollX, window.scrollY);
      setAnnouncement(document.title);
    },
    onFinish: (reason) => {
      document.body.classList.remove("is-page-transitioning");
      document.body.removeAttribute("aria-busy");
      delete document.body.dataset.warpPhase;
      delete document.body.dataset.warpMotion;
      for (const property of ["--warp-duration", "--warp-departure", "--warp-arrival"]) document.body.style.removeProperty(property);
      setTransition(null);
      if (reason === "timeout" || reason === "error") console.warn("[CosmicNavigation] Visual transition cleared safely.");
    },
  }));

  useEffect(() => {
    // Accept a pending destination from the previous provider without replaying departure.
    try {
      const pending = window.sessionStorage.getItem(PENDING_DESTINATION_KEY);
      window.sessionStorage.removeItem(PENDING_DESTINATION_KEY);
      if (pending && destinationIsReady(pending)) settleDestination(pending);
    } catch { /* Navigation also works when storage is restricted. */ }
    const scrollRecorder = createScrollRecorder({
      setTimer: (callback, delay) => window.setTimeout(callback, delay),
      clearTimer: (timer) => window.clearTimeout(timer),
      save: () => persistRouterScroll(window.history, window.scrollX, window.scrollY),
    });
    const cancel = () => {
      scrollRecorder.cancel();
      lifecycle.cancel();
    };
    const onPageHide = () => { scrollRecorder.flush(); cancel(); };
    const onHistoryKey = (event: KeyboardEvent) => {
      if ((event.altKey && ["ArrowLeft", "ArrowRight"].includes(event.key))
        || (event.metaKey && ["[", "]"].includes(event.key))) scrollRecorder.flush();
    };
    const onVisibility = () => { if (document.visibilityState === "hidden") cancel(); };
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onMotion = () => { if (motion.matches) cancel(); };
    window.addEventListener("popstate", cancel);
    window.addEventListener("pagehide", onPageHide);
    window.addEventListener("error", cancel);
    window.addEventListener("unhandledrejection", cancel);
    window.addEventListener("scroll", scrollRecorder.schedule, { passive: true });
    window.addEventListener("blur", scrollRecorder.flush);
    window.addEventListener("keydown", onHistoryKey);
    document.addEventListener("visibilitychange", onVisibility);
    motion.addEventListener("change", onMotion);
    scrollRecorder.flush();
    return () => {
      cancel();
      window.removeEventListener("popstate", cancel);
      window.removeEventListener("pagehide", onPageHide);
      window.removeEventListener("error", cancel);
      window.removeEventListener("unhandledrejection", cancel);
      window.removeEventListener("scroll", scrollRecorder.schedule);
      window.removeEventListener("blur", scrollRecorder.flush);
      window.removeEventListener("keydown", onHistoryKey);
      document.removeEventListener("visibilitychange", onVisibility);
      motion.removeEventListener("change", onMotion);
    };
  }, [lifecycle]);

  useEffect(() => {
    if (lastPathRef.current === pathname) return;
    lastPathRef.current = pathname;
    if (lifecycle.active) return;
    // History keeps browser scroll restoration; focus must not reset that position.
    const frame = window.requestAnimationFrame(() => {
      focusWithoutScrolling(document.querySelector<HTMLElement>("main h1, main [data-focus-target]")
        ?? document.querySelector<HTMLElement>("main"));
      setAnnouncement(document.title);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [pathname, lifecycle]);

  const navigateWithTransition = useCallback((event: ReactMouseEvent<HTMLAnchorElement>, href: string) => {
    const current = new URL(window.location.href);
    const destination = new URL(href, current);
    const kind = navigationKind(current, destination, {
      button: event.button, metaKey: event.metaKey, ctrlKey: event.ctrlKey,
      shiftKey: event.shiftKey, altKey: event.altKey,
      target: event.currentTarget.target, download: event.currentTarget.hasAttribute("download"),
    });
    if (kind === "native") return false;
    if (kind === "anchor") {
      lifecycle.cancel();
      if (current.href !== destination.href) router.push(href, { scroll: false });
      event.preventDefault();
      settleDestination(href);
      persistRouterScroll(window.history, window.scrollX, window.scrollY);
      return true; // Move focus out of the closing menu without starting a warp.
    }
    event.preventDefault();
    const development = process.env.NODE_ENV === "development";
    previewRef.current = warpPreviewEnabled(current.search, development, previewRef.current);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches && !previewRef.current;
    const compact = window.matchMedia("(max-width: 767px)").matches;
    const home = routePath(destination.pathname) === "/";
    const introPreview = development && ["full", "replay"].includes(destination.searchParams.get("intro") ?? "");
    const introHandoff = home && !destination.hash && (introPreview || !getCosmicIntroDecision(window, false, development).seen);
    const timing = getWarpTiming(current.pathname, destination.pathname, reduced, compact, introHandoff);
    lifecycle.start(href, timing, () => {
      if (home) {
        document.documentElement.dataset.internalHomeNavigation = "true";
        try { window.sessionStorage.setItem(INTERNAL_HOME_NAVIGATION_KEY, "1"); } catch { /* Optional marker. */ }
      }
      router.push(href, { scroll: false });
    });
    return true;
  }, [router, lifecycle]);

  const value = useMemo(() => ({ pageTransitionActive: transition !== null, navigateWithTransition }), [transition, navigateWithTransition]);
  return (
    <PageTransitionContext.Provider value={value}>
      {children}
      <span className="cosmic-navigation-announcement" role="status" aria-live="polite" aria-atomic="true">{announcement}</span>
      <ArchivePortalTransition transition={transition} />
    </PageTransitionContext.Provider>
  );
}
