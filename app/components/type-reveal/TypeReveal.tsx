"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
  type Ref,
} from "react";
import { useI18n } from "../../i18n/I18nProvider";
import type { Locale } from "../../i18n/types";

type RevealContextValue = {
  hasRevealed: boolean;
  isInView: boolean;
  reducedMotion: boolean;
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

type TypeRevealLinesProps = {
  as?: TypeRevealProps["as"];
  className?: string;
  delay?: number;
  id?: string;
  lines: readonly string[];
  stagger?: number;
};

const TypeRevealContext = createContext<RevealContextValue | null>(null);
const CJK_LOCALES = new Set<Locale>(["ja", "zh-CN", "zh-TW"]);

export function TypeRevealGroup({
  as = "div",
  children,
  threshold = 0.3,
  rootMargin = "0px 0px -12% 0px",
  ...props
}: TypeRevealGroupProps) {
  const groupRef = useRef<HTMLElement>(null);
  const [hasRevealed, setHasRevealed] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateReducedMotion = () => setReducedMotion(query.matches);

    updateReducedMotion();
    query.addEventListener("change", updateReducedMotion);
    return () => query.removeEventListener("change", updateReducedMotion);
  }, []);

  useEffect(() => {
    if (!groupRef.current) return;

    if (!("IntersectionObserver" in window)) {
      const fallbackId = globalThis.setTimeout(() => {
        setHasRevealed(true);
        setIsInView(true);
      }, 0);
      return () => globalThis.clearTimeout(fallbackId);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          setIsInView(false);
          return;
        }

        if (entry.intersectionRatio < threshold) return;
        setIsInView(true);
        setHasRevealed(true);
      },
      { threshold: [0, threshold], rootMargin },
    );

    observer.observe(groupRef.current);
    return () => observer.disconnect();
  }, [rootMargin, threshold]);

  const contextValue = { hasRevealed, isInView, reducedMotion };

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
  ...props
}: TypeRevealProps) {
  const { locale } = useI18n();

  if (CJK_LOCALES.has(locale)) {
    return (
      <TypeRevealLinesContent
        key={`${locale}:${props.text}`}
        as={props.as}
        className={props.className}
        delay={props.delay}
        id={props.id}
        lines={props.text.split("\n")}
        locale={locale}
      />
    );
  }

  return (
    <TypeRevealContent
      key={`${locale}:${props.text}`}
      {...props}
    />
  );
}

export function TypeRevealLines(props: TypeRevealLinesProps) {
  const { locale } = useI18n();

  return (
    <TypeRevealLinesContent
      key={`${locale}:${props.lines.join("\n")}`}
      {...props}
      locale={locale}
    />
  );
}

function TypeRevealLinesContent({
  as = "span",
  className = "",
  delay = 0,
  id,
  lines,
  locale,
  stagger = 120,
}: TypeRevealLinesProps & { locale: Locale }) {
  const context = useContext(TypeRevealContext);
  const [ready, setReady] = useState(false);

  if (!context) {
    throw new Error("TypeRevealLines must be rendered inside TypeRevealGroup.");
  }

  useEffect(() => {
    if (!context.hasRevealed || context.reducedMotion) return;

    const revealFrame = window.requestAnimationFrame(() => setReady(true));
    return () => window.cancelAnimationFrame(revealFrame);
  }, [context.hasRevealed, context.reducedMotion]);

  const Tag = as;
  const revealed = context.hasRevealed && (context.reducedMotion || ready);
  const stateClass = revealed ? " is-complete" : " is-pending";
  const reducedClass = context.reducedMotion ? " is-reduced-motion" : "";
  const ariaLabel = lines.join(" ");

  return (
    <Tag
      id={id}
      className={`type-reveal-lines${className ? ` ${className}` : ""}${stateClass}${reducedClass}`}
      aria-label={ariaLabel}
      data-locale={locale}
      data-reveal-mode="line"
    >
      {lines.map((line, index) => (
        <span
          className="type-reveal-line"
          key={`${locale}-${index}-${line}`}
          style={
            {
              "--type-reveal-line-delay": `${delay + index * stagger}ms`,
            } as CSSProperties
          }
        >
          {line}
        </span>
      ))}
    </Tag>
  );
}

function TypeRevealContent({
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

  const revealUnits = useMemo(() => Array.from(text), [text]);

  useEffect(() => {
    if (!context.hasRevealed || complete) return;

    if (!context.isInView || context.reducedMotion) {
      const reducedRevealId = window.setTimeout(() => {
        setVisibleLength(revealUnits.length);
        setComplete(true);
      }, 0);
      return () => window.clearTimeout(reducedRevealId);
    }

    let intervalId: number | null = null;
    const delayId = window.setTimeout(() => {
      if (revealUnits.length === 0) {
        setComplete(true);
        return;
      }

      let nextLength = 1;
      setVisibleLength(nextLength);
      intervalId = window.setInterval(() => {
        nextLength += 1;
        setVisibleLength(Math.min(nextLength, revealUnits.length));

        if (nextLength >= revealUnits.length) {
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
  }, [
    complete,
    context.hasRevealed,
    context.isInView,
    context.reducedMotion,
    delay,
    revealUnits,
    speed,
  ]);

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
      data-reveal-mode="character"
    >
      <span className="type-reveal-reserve" aria-hidden="true">
        {text}
      </span>
      <span className="type-reveal-visual" aria-hidden="true">
        {revealUnits.slice(0, visibleLength).join("")}
      </span>
    </Tag>
  );
}
