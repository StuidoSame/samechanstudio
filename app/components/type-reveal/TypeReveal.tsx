"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type HTMLAttributes,
  type ReactNode,
  type Ref,
} from "react";

type RevealContextValue = {
  hasRevealed: boolean;
  reducedMotion: boolean;
};

type TypeRevealStep = {
  text: string;
  speed: number;
  gapAfter?: number;
};

type TypeRevealGroupProps = HTMLAttributes<HTMLElement> & {
  as?: "div" | "section";
  children: ReactNode;
  threshold?: number;
  rootMargin?: string;
};

type TypeRevealProps = {
  as?: "span" | "h2" | "p";
  className?: string;
  delay?: number;
  id?: string;
  preserveLineBreaks?: boolean;
  speed: number;
  text: string;
};

const TypeRevealContext = createContext<RevealContextValue | null>(null);

const getCharacterCount = (text: string) => Array.from(text).length;

export function getTypeRevealDelay(
  steps: readonly TypeRevealStep[],
  index: number,
  defaultGap = 160,
  initialDelay = 0,
) {
  return steps.slice(0, index).reduce(
    (delay, step) =>
      delay +
      getCharacterCount(step.text) * step.speed +
      (step.gapAfter ?? defaultGap),
    initialDelay,
  );
}

export function TypeRevealGroup({
  as = "div",
  children,
  threshold = 0.3,
  rootMargin = "0px 0px -12% 0px",
  ...props
}: TypeRevealGroupProps) {
  const groupRef = useRef<HTMLElement>(null);
  const [hasRevealed, setHasRevealed] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateReducedMotion = () => setReducedMotion(query.matches);

    updateReducedMotion();
    query.addEventListener("change", updateReducedMotion);
    return () => query.removeEventListener("change", updateReducedMotion);
  }, []);

  useEffect(() => {
    if (hasRevealed || !groupRef.current) return;

    if (!("IntersectionObserver" in window)) {
      const fallbackId = globalThis.setTimeout(() => setHasRevealed(true), 0);
      return () => globalThis.clearTimeout(fallbackId);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || entry.intersectionRatio < threshold) return;
        setHasRevealed(true);
        observer.disconnect();
      },
      { threshold, rootMargin },
    );

    observer.observe(groupRef.current);
    return () => observer.disconnect();
  }, [hasRevealed, rootMargin, threshold]);

  const contextValue = { hasRevealed, reducedMotion };

  if (as === "section") {
    return (
      <TypeRevealContext.Provider value={contextValue}>
        <section
          {...props}
          ref={groupRef as Ref<HTMLElement>}
          data-type-reveal-group={hasRevealed ? "revealed" : "pending"}
        >
          {children}
        </section>
      </TypeRevealContext.Provider>
    );
  }

  return (
    <TypeRevealContext.Provider value={contextValue}>
      <div
        {...props}
        ref={groupRef as Ref<HTMLDivElement>}
        data-type-reveal-group={hasRevealed ? "revealed" : "pending"}
      >
        {children}
      </div>
    </TypeRevealContext.Provider>
  );
}

export function TypeReveal({
  as = "span",
  className = "",
  delay = 0,
  id,
  preserveLineBreaks = false,
  speed,
  text,
}: TypeRevealProps) {
  const context = useContext(TypeRevealContext);
  const [visibleLength, setVisibleLength] = useState(0);
  const [complete, setComplete] = useState(false);

  if (!context) {
    throw new Error("TypeReveal must be rendered inside TypeRevealGroup.");
  }

  const characters = useMemo(() => Array.from(text), [text]);

  useEffect(() => {
    if (!context.hasRevealed) return;

    if (context.reducedMotion) {
      const reducedRevealId = window.setTimeout(() => {
        setVisibleLength(characters.length);
        setComplete(true);
      }, 0);
      return () => window.clearTimeout(reducedRevealId);
    }

    let intervalId: number | null = null;
    const delayId = window.setTimeout(() => {
      if (characters.length === 0) {
        setComplete(true);
        return;
      }

      let nextLength = 1;
      setVisibleLength(nextLength);
      intervalId = window.setInterval(() => {
        nextLength += 1;
        setVisibleLength(Math.min(nextLength, characters.length));

        if (nextLength >= characters.length) {
          if (intervalId !== null) window.clearInterval(intervalId);
          intervalId = null;
          setComplete(true);
        }
      }, speed);
    }, delay);

    return () => {
      window.clearTimeout(delayId);
      if (intervalId !== null) window.clearInterval(intervalId);
    };
  }, [characters, context.hasRevealed, context.reducedMotion, delay, speed]);

  const Tag = as;
  const stateClass = complete
    ? " is-complete"
    : visibleLength > 0
      ? " is-typing"
      : " is-pending";
  const reducedClass = context.reducedMotion ? " is-reduced-motion" : "";

  return (
    <Tag
      id={id}
      className={`type-reveal${className ? ` ${className}` : ""}${stateClass}${reducedClass}`}
      aria-label={text}
      data-preserve-line-breaks={preserveLineBreaks ? "true" : undefined}
      data-reveal-length={visibleLength}
    >
      <span className="type-reveal-reserve" aria-hidden="true">
        {text}
      </span>
      <span className="type-reveal-visual" aria-hidden="true">
        {characters.slice(0, visibleLength).join("")}
      </span>
    </Tag>
  );
}
