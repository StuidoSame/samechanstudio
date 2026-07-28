"use client";

import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
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

const PAGE_TRANSITION_ROUTE_DELAY_MS = 520;
const PAGE_TRANSITION_FINISH_DELAY_MS = 260;
const REDUCED_ROUTE_DELAY_MS = 90;
const REDUCED_FINISH_DELAY_MS = 90;
const HEADER_SCROLL_GAP_PX = 24;
const INTERNAL_HOME_NAVIGATION_KEY = "same-studio-internal-home-navigation-v1";
const PENDING_DESTINATION_KEY = "same-studio-pending-destination-v1";

type PageTransitionContextValue = {
  pageTransitionActive: boolean;
  navigateWithTransition: (
    event: ReactMouseEvent<HTMLAnchorElement>,
    href: string,
  ) => boolean;
};

const PageTransitionContext =
  createContext<PageTransitionContextValue | null>(null);

function getDestination(href: string): PageTransitionDestination {
  const url = new URL(href, window.location.href);
  if (url.hash === "#about") return "ABOUT";
  if (url.hash === "#apps") return "APPS";
  if (url.hash === "#contact") return "CONTACT";
  if (url.pathname === "/support") return "SUPPORT";
  if (url.pathname === "/terms") return "TERMS";
  if (url.pathname === "/privacy") return "PRIVACY";
  return "HOME";
}

function isModifiedNavigation(event: ReactMouseEvent<HTMLAnchorElement>) {
  return (
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey ||
    event.currentTarget.target === "_blank" ||
    event.currentTarget.hasAttribute("download")
  );
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
    document.querySelector<HTMLElement>("main h1, main [data-focus-target], main"),
  );
  return true;
}

function destinationIsReady(href: string) {
  const url = new URL(href, window.location.href);
  return (
    !url.hash ||
    Boolean(document.getElementById(decodeURIComponent(url.hash.slice(1))))
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

export function PageTransitionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [transition, setTransition] = useState<PageTransitionState | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const routeTimerRef = useRef<number | null>(null);
  const finishTimerRef = useRef<number | null>(null);
  const arrivalTimerRef = useRef<number | null>(null);
  const transitionLockedRef = useRef(false);

  const clearTimers = useCallback(() => {
    if (routeTimerRef.current !== null) {
      window.clearTimeout(routeTimerRef.current);
      routeTimerRef.current = null;
    }
    if (finishTimerRef.current !== null) {
      window.clearTimeout(finishTimerRef.current);
      finishTimerRef.current = null;
    }
    if (arrivalTimerRef.current !== null) {
      window.clearTimeout(arrivalTimerRef.current);
      arrivalTimerRef.current = null;
    }
  }, []);

  const finishTransition = useCallback(
    (href: string) => {
      let attempts = 0;
      const settleAndFinish = () => {
        attempts += 1;
        if (!destinationIsReady(href) && attempts < 60) {
          finishTimerRef.current = window.setTimeout(settleAndFinish, 30);
          return;
        }

        finishTimerRef.current = null;
        document.body.classList.remove("is-page-transitioning");
        document.body.removeAttribute("aria-busy");
        settleDestination(href);
        try {
          window.sessionStorage.removeItem(PENDING_DESTINATION_KEY);
        } catch {
          // Destination cleanup still completes when storage is unavailable.
        }
        setTransition(null);
        transitionLockedRef.current = false;
        document.documentElement.style.removeProperty("--archive-portal-x");
        document.documentElement.style.removeProperty("--archive-portal-y");
      };
      settleAndFinish();
    },
    [],
  );

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    let pendingHref: string | null = null;
    try {
      pendingHref = window.sessionStorage.getItem(PENDING_DESTINATION_KEY);
      window.sessionStorage.removeItem(PENDING_DESTINATION_KEY);
    } catch {
      // A persisted destination is optional; normal route rendering still works.
    }
    if (!pendingHref) return;

    let attempts = 0;
    const settleArrival = () => {
      attempts += 1;
      if (!destinationIsReady(pendingHref) && attempts < 60) {
        arrivalTimerRef.current = window.setTimeout(settleArrival, 30);
        return;
      }
      arrivalTimerRef.current = null;
      document.body.classList.remove("is-page-transitioning");
      document.body.removeAttribute("aria-busy");
      settleDestination(pendingHref);
    };
    settleArrival();

    return () => {
      if (arrivalTimerRef.current !== null) {
        window.clearTimeout(arrivalTimerRef.current);
        arrivalTimerRef.current = null;
      }
    };
  }, []);

  useEffect(
    () => () => {
      clearTimers();
      document.body.classList.remove("is-page-transitioning");
      document.body.removeAttribute("aria-busy");
      document.documentElement.style.removeProperty("--archive-portal-x");
      document.documentElement.style.removeProperty("--archive-portal-y");
    },
    [clearTimers],
  );

  const navigateWithTransition = useCallback(
    (event: ReactMouseEvent<HTMLAnchorElement>, href: string) => {
      if (isModifiedNavigation(event)) return false;

      const destinationUrl = new URL(href, window.location.href);
      if (
        destinationUrl.origin !== window.location.origin ||
        !["http:", "https:"].includes(destinationUrl.protocol)
      ) {
        return false;
      }

      const currentLocation = `${window.location.pathname}${window.location.search}${window.location.hash}`;
      const destinationLocation = `${destinationUrl.pathname}${destinationUrl.search}${destinationUrl.hash}`;
      event.preventDefault();
      if (currentLocation === destinationLocation || transitionLockedRef.current) {
        return true;
      }

      transitionLockedRef.current = true;
      const bounds = event.currentTarget.getBoundingClientRect();
      const keyboardActivation = event.clientX === 0 && event.clientY === 0;
      const x = keyboardActivation ? bounds.left + bounds.width / 2 : event.clientX;
      const y = keyboardActivation ? bounds.top + bounds.height / 2 : event.clientY;
      const nextTransition = {
        destination: getDestination(href),
        href,
        x,
        y,
      } satisfies PageTransitionState;

      document.documentElement.style.setProperty("--archive-portal-x", `${x}px`);
      document.documentElement.style.setProperty("--archive-portal-y", `${y}px`);
      document.body.classList.add("is-page-transitioning");
      document.body.setAttribute("aria-busy", "true");
      setTransition(nextTransition);

      routeTimerRef.current = window.setTimeout(
        () => {
          routeTimerRef.current = null;
          const destinationUrl = new URL(href, window.location.href);
          if (destinationUrl.pathname === "/") {
            document.documentElement.dataset.internalHomeNavigation = "true";
          }
          try {
            window.sessionStorage.setItem(PENDING_DESTINATION_KEY, href);
            if (destinationUrl.pathname === "/") {
              window.sessionStorage.setItem(
                INTERNAL_HOME_NAVIGATION_KEY,
                "1",
              );
            }
          } catch {
            // The live provider state remains the fallback when storage is unavailable.
          }
          router.push(href, { scroll: false });
          finishTimerRef.current = window.setTimeout(
            () => {
              finishTimerRef.current = null;
              finishTransition(href);
            },
            reducedMotion
              ? REDUCED_FINISH_DELAY_MS
              : PAGE_TRANSITION_FINISH_DELAY_MS,
          );
        },
        reducedMotion ? REDUCED_ROUTE_DELAY_MS : PAGE_TRANSITION_ROUTE_DELAY_MS,
      );
      return true;
    },
    [finishTransition, reducedMotion, router],
  );

  const value = useMemo(
    () => ({
      pageTransitionActive: transition !== null,
      navigateWithTransition,
    }),
    [navigateWithTransition, transition],
  );

  return (
    <PageTransitionContext.Provider value={value}>
      {children}
      <ArchivePortalTransition
        transition={transition}
        reducedMotion={reducedMotion}
      />
    </PageTransitionContext.Provider>
  );
}

export function usePageTransition() {
  const value = useContext(PageTransitionContext);
  if (!value) {
    throw new Error(
      "usePageTransition must be used within PageTransitionProvider",
    );
  }
  return value;
}
