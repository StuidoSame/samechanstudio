"use client";

import Image from "next/image";
import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from "react";

type IPhoneFrameProps = {
  children?: ReactNode;
};

type DailyAnswer = {
  id: string;
  text: string;
  createdAt: string;
};

type DailyQuestionStorage = {
  version: 1;
  days: Record<string, DailyAnswer[]>;
};

const DAILY_QUESTION_STORAGE_KEY = "same-studio-daily-question-v1";

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

function isDailyAnswer(value: unknown): value is DailyAnswer {
  if (!value || typeof value !== "object") {
    return false;
  }

  const answer = value as Partial<DailyAnswer>;

  return (
    typeof answer.id === "string" &&
    typeof answer.text === "string" &&
    answer.text.trim().length > 0 &&
    answer.text.length <= 120 &&
    typeof answer.createdAt === "string"
  );
}

function readDailyStorage(): DailyQuestionStorage {
  try {
    const storedValue = window.localStorage.getItem(DAILY_QUESTION_STORAGE_KEY);

    if (!storedValue) {
      return { version: 1, days: {} };
    }

    const parsedValue = JSON.parse(storedValue) as Partial<DailyQuestionStorage>;

    if (parsedValue.version !== 1 || !parsedValue.days || typeof parsedValue.days !== "object") {
      return { version: 1, days: {} };
    }

    const days = Object.fromEntries(
      Object.entries(parsedValue.days).map(([dateKey, storedAnswers]) => [
        dateKey,
        Array.isArray(storedAnswers) ? storedAnswers.filter(isDailyAnswer).slice(0, 3) : [],
      ]),
    );

    return { version: 1, days };
  } catch {
    return { version: 1, days: {} };
  }
}

function writeDailyAnswers(dateKey: string, answers: DailyAnswer[]) {
  try {
    const storage = readDailyStorage();
    storage.days[dateKey] = answers.slice(0, 3);
    window.localStorage.setItem(DAILY_QUESTION_STORAGE_KEY, JSON.stringify(storage));
  } catch {
    // The in-memory experience remains available when storage is blocked.
  }
}

export function IPhoneFrame({ children }: IPhoneFrameProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const answerInputRef = useRef<HTMLTextAreaElement>(null);
  const [hasEntered, setHasEntered] = useState(false);
  const [currentDate, setCurrentDate] = useState<Date | null>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [questionStarted, setQuestionStarted] = useState(false);
  const [typedQuestion, setTypedQuestion] = useState("");
  const [typingComplete, setTypingComplete] = useState(false);
  const [answers, setAnswers] = useState<DailyAnswer[]>([]);
  const [answerDraft, setAnswerDraft] = useState("");
  const [showSavedState, setShowSavedState] = useState(false);
  const savedStateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentDateKey = currentDate ? getLocalDateKey(currentDate) : "";

  useEffect(() => {
    const initialDateFrame = window.requestAnimationFrame(() => setCurrentDate(new Date()));

    return () => window.cancelAnimationFrame(initialDateFrame);
  }, []);

  useEffect(() => {
    let midnightTimer: ReturnType<typeof setTimeout> | undefined;

    const refreshLocalDate = () => {
      const nextDate = new Date();
      setCurrentDate((displayedDate) =>
        displayedDate && getLocalDateKey(displayedDate) === getLocalDateKey(nextDate)
          ? displayedDate
          : nextDate,
      );
    };

    const scheduleNextMidnight = () => {
      const now = new Date();
      const nextMidnight = new Date(now);
      nextMidnight.setHours(24, 0, 0, 0);

      midnightTimer = setTimeout(() => {
        refreshLocalDate();
        scheduleNextMidnight();
      }, Math.max(0, nextMidnight.getTime() - now.getTime()) + 50);
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        refreshLocalDate();
      }
    };

    scheduleNextMidnight();
    window.addEventListener("focus", refreshLocalDate);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      if (midnightTimer) {
        clearTimeout(midnightTimer);
      }

      window.removeEventListener("focus", refreshLocalDate);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
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

  useEffect(() => {
    if (!currentDateKey) {
      return;
    }

    const dateChangeFrame = window.requestAnimationFrame(() => {
      const storage = readDailyStorage();
      setAnswers(storage.days[currentDateKey] ?? []);
      setAnswerDraft("");
      setShowSavedState(false);
      setQuestionStarted(false);
      setTypedQuestion("");
      setTypingComplete(false);

      if (savedStateTimerRef.current) {
        clearTimeout(savedStateTimerRef.current);
        savedStateTimerRef.current = null;
      }
    });

    return () => window.cancelAnimationFrame(dateChangeFrame);
  }, [currentDateKey]);

  useEffect(
    () => () => {
      if (savedStateTimerRef.current) {
        clearTimeout(savedStateTimerRef.current);
      }
    },
    [],
  );

  const submitAnswer = (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    const text = answerDraft.trim();

    if (!text || !currentDateKey || answers.length >= 3 || showSavedState) {
      return;
    }

    const nextAnswer: DailyAnswer = {
      id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}`,
      text,
      createdAt: new Date().toISOString(),
    };

    const nextAnswers = [nextAnswer, ...answers].slice(0, 3);
    setAnswers(nextAnswers);
    writeDailyAnswers(currentDateKey, nextAnswers);
    setAnswerDraft("");
    setShowSavedState(true);

    if (savedStateTimerRef.current) {
      clearTimeout(savedStateTimerRef.current);
    }

    savedStateTimerRef.current = setTimeout(() => {
      setShowSavedState(false);
      savedStateTimerRef.current = null;
    }, 1100);
  };

  const handleAnswerKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submitAnswer();
    }
  };

  const answerLimitReached = answers.length >= 3;
  const answerInputDisabled = answerLimitReached || !typingComplete;

  const focusAnswerInput = (event: MouseEvent<HTMLFormElement>) => {
    if (answerInputDisabled || (event.target as HTMLElement).closest("button")) {
      return;
    }

    answerInputRef.current?.focus();
  };

  return (
    <div ref={stageRef} className="device-phone-stage" aria-label="SAME STUDIO 하루 질문">
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
                  alt=""
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
                  <div className="phone-daily-answer-space">
                    {answers.length > 0 ? (
                      <ol className="phone-daily-answer-list">
                        {answers.map((answer) => (
                          <li key={answer.id}>{answer.text}</li>
                        ))}
                      </ol>
                    ) : (
                      <div className="phone-daily-empty-cards" aria-hidden="true">
                        <span />
                        <span />
                      </div>
                    )}
                  </div>
                  {showSavedState ? (
                    <div className="phone-daily-saved-state" role="status" aria-live="polite">
                      <span aria-hidden="true">✓</span>
                      저장했어요
                    </div>
                  ) : (
                    <form
                      className={`phone-daily-form${answerInputDisabled ? " is-disabled" : ""}`}
                      onClick={focusAnswerInput}
                      onSubmit={submitAnswer}
                    >
                      <textarea
                        ref={answerInputRef}
                        value={answerDraft}
                        maxLength={120}
                        rows={2}
                        aria-label="오늘의 답변 입력"
                        placeholder={answerLimitReached ? "오늘 기록 완료" : "오늘의 답변"}
                        disabled={answerInputDisabled}
                        onChange={(event) => setAnswerDraft(event.target.value)}
                        onKeyDown={handleAnswerKeyDown}
                      />
                      <button
                        type="submit"
                        aria-label="오늘의 답변 저장"
                        disabled={answerLimitReached || !answerDraft.trim()}
                        onClick={(event) => event.stopPropagation()}
                      >
                        <span aria-hidden="true">✓</span>
                      </button>
                    </form>
                  )}
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
