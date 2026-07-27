"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type ReactNode } from "react";

type IPhoneFrameProps = {
  children?: ReactNode;
};

const DAILY_QUESTIONS: Record<number, string> = {
  0: "다음 주의 나에게 남기고 싶은 말은 무엇인가요?",
  1: "이번 주에 꼭 이루고 싶은 한 가지는 무엇인가요?",
  2: "오늘 나를 조금 더 편안하게 만든 것은 무엇인가요?",
  3: "최근에 새롭게 알게 된 것은 무엇인가요?",
  4: "오늘 고마웠던 순간은 무엇인가요?",
  5: "이번 주에 가장 잘했다고 생각하는 일은 무엇인가요?",
  6: "오늘 천천히 즐기고 싶은 것은 무엇인가요?",
};

function formatLocalDate(date: Date) {
  return new Intl.DateTimeFormat("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "long",
  }).format(date);
}

function getLocalDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function IPhoneFrame({ children }: IPhoneFrameProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [hasEntered, setHasEntered] = useState(false);
  const [currentDate, setCurrentDate] = useState<Date | null>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [questionStarted, setQuestionStarted] = useState(false);
  const [typedQuestion, setTypedQuestion] = useState("");
  const [typingComplete, setTypingComplete] = useState(false);

  useEffect(() => {
    setCurrentDate(new Date());
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setPrefersReducedMotion(mediaQuery.matches);

    updatePreference();
    mediaQuery.addEventListener("change", updatePreference);

    return () => mediaQuery.removeEventListener("change", updatePreference);
  }, []);

  useEffect(() => {
    const stage = stageRef.current;

    if (!stage) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasEntered(true);
          observer.disconnect();
        }
      },
      { threshold: 0.5 },
    );

    observer.observe(stage);

    return () => observer.disconnect();
  }, []);

  const question = currentDate ? DAILY_QUESTIONS[currentDate.getDay()] : "";

  useEffect(() => {
    if (!hasEntered || !question) {
      return;
    }

    let typingTimer: ReturnType<typeof setTimeout> | undefined;
    let characterIndex = 0;

    const typeNextCharacter = () => {
      characterIndex += 1;
      setTypedQuestion(question.slice(0, characterIndex));

      if (characterIndex < question.length) {
        typingTimer = setTimeout(typeNextCharacter, 48);
      } else {
        setTypingComplete(true);
      }
    };

    const revealTimer = setTimeout(
      () => {
        setQuestionStarted(true);

        if (prefersReducedMotion) {
          setTypedQuestion(question);
          setTypingComplete(true);
          return;
        }

        typeNextCharacter();
      },
      prefersReducedMotion ? 0 : 520,
    );

    return () => {
      clearTimeout(revealTimer);

      if (typingTimer) {
        clearTimeout(typingTimer);
      }
    };
  }, [hasEntered, prefersReducedMotion, question]);

  return (
    <div ref={stageRef} className="device-phone-stage" aria-label="Interactive iPhone moment">
      <div className="device-phone-frame">
        <span className="device-phone-button device-phone-button--action" aria-hidden="true" />
        <span className="device-phone-button device-phone-button--volume-up" aria-hidden="true" />
        <span className="device-phone-button device-phone-button--volume-down" aria-hidden="true" />
        <span className="device-phone-button device-phone-button--power" aria-hidden="true" />
        <div className="device-screen device-phone-screen">
          {children ?? (
            <div
              className={`phone-daily-experience${hasEntered ? " is-entered" : ""}${questionStarted ? " is-question-started" : ""}${typingComplete ? " is-typing-complete" : ""}`}
            >
              <div className="phone-daily-splash">
                <Image
                  className="phone-daily-logo"
                  src="/assets/favicon/favicon.ico"
                  alt="SAME STUDIO"
                  width={64}
                  height={64}
                  priority
                  unoptimized
                />
                <span>SAME STUDIO</span>
              </div>
              <div className="phone-daily-content" aria-hidden={!questionStarted}>
                <header className="phone-daily-header">
                  <time dateTime={currentDate ? getLocalDateKey(currentDate) : undefined}>
                    {currentDate ? formatLocalDate(currentDate) : "오늘"}
                  </time>
                  <h3>
                    <span className="phone-daily-sr-only">{question}</span>
                    <span aria-hidden="true">
                      {typedQuestion}
                      {!typingComplete && <i className="phone-daily-cursor" />}
                    </span>
                  </h3>
                </header>
                <div className="phone-daily-after-typing">
                  <div className="phone-daily-answer-space" aria-hidden="true" />
                  <div className="phone-daily-input-placeholder" aria-hidden="true">
                    <span>오늘의 답변</span>
                    <i>✓</i>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        <span className="device-phone-island" aria-hidden="true" />
        <span className="device-frame-highlight" aria-hidden="true" />
      </div>
    </div>
  );
}
