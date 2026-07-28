"use client";

import Image from "next/image";
import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from "react";
import { useI18n } from "../../i18n/I18nProvider";
import type { Locale } from "../../i18n/types";

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
const CJK_LOCALES = new Set<Locale>(["ja", "zh-CN", "zh-TW"]);

function formatLocalDate(date: Date, locale: string) {
  return new Intl.DateTimeFormat(locale, {
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
  const { locale, messages } = useI18n();
  const stageRef = useRef<HTMLDivElement>(null);
  const answerInputRef = useRef<HTMLTextAreaElement>(null);
  const [hasEntered, setHasEntered] = useState(false);
  const [currentDate, setCurrentDate] = useState<Date | null>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [questionStarted, setQuestionStarted] = useState(false);
  const [animatedQuestionSource, setAnimatedQuestionSource] = useState("");
  const [typedQuestion, setTypedQuestion] = useState("");
  const [typingComplete, setTypingComplete] = useState(false);
  const [answers, setAnswers] = useState<DailyAnswer[]>([]);
  const [answerDraft, setAnswerDraft] = useState("");
  const [showSavedState, setShowSavedState] = useState(false);
  const [newAnswerId, setNewAnswerId] = useState<string | null>(null);
  const savedStateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const newAnswerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
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

  const question = currentDate
    ? messages.dailyQuestion.questions[currentDate.getDay()] ?? ""
    : "";
  const exampleAnswers = currentDate
    ? messages.dailyQuestion.examples[currentDate.getDay()] ?? []
    : [];

  useEffect(() => {
    if (!hasEntered || !question) {
      return;
    }

    let revealTimer: ReturnType<typeof setTimeout> | undefined;
    let typingTimer: ReturnType<typeof setTimeout> | undefined;
    let characterIndex = 0;
    const questionCharacters = Array.from(question);
    const revealWholeQuestion = CJK_LOCALES.has(locale);

    const typeNextCharacter = () => {
      characterIndex += 1;
      setTypedQuestion(questionCharacters.slice(0, characterIndex).join(""));

      if (characterIndex < questionCharacters.length) {
        typingTimer = setTimeout(typeNextCharacter, 48);
      } else {
        setTypingComplete(true);
      }
    };

    const resetFrame = window.requestAnimationFrame(() => {
      setAnimatedQuestionSource(question);
      setQuestionStarted(false);
      setTypedQuestion("");
      setTypingComplete(false);

      revealTimer = setTimeout(
        () => {
          setQuestionStarted(true);

          if (prefersReducedMotion || revealWholeQuestion) {
            setTypedQuestion(question);
            setTypingComplete(true);
            return;
          }

          typeNextCharacter();
        },
        prefersReducedMotion ? 0 : 520,
      );
    });

    return () => {
      window.cancelAnimationFrame(resetFrame);

      if (revealTimer) {
        clearTimeout(revealTimer);
      }

      if (typingTimer) {
        clearTimeout(typingTimer);
      }
    };
  }, [hasEntered, locale, prefersReducedMotion, question]);

  useEffect(() => {
    if (!currentDateKey) {
      return;
    }

    const dateChangeFrame = window.requestAnimationFrame(() => {
      const storage = readDailyStorage();
      setAnswers(storage.days[currentDateKey] ?? []);
      setAnswerDraft("");
      setShowSavedState(false);
      setNewAnswerId(null);
      setQuestionStarted(false);
      setTypedQuestion("");
      setTypingComplete(false);

      if (savedStateTimerRef.current) {
        clearTimeout(savedStateTimerRef.current);
        savedStateTimerRef.current = null;
      }

      if (newAnswerTimerRef.current) {
        clearTimeout(newAnswerTimerRef.current);
        newAnswerTimerRef.current = null;
      }
    });

    return () => window.cancelAnimationFrame(dateChangeFrame);
  }, [currentDateKey]);

  useEffect(
    () => () => {
      if (savedStateTimerRef.current) {
        clearTimeout(savedStateTimerRef.current);
      }

      if (newAnswerTimerRef.current) {
        clearTimeout(newAnswerTimerRef.current);
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
    setNewAnswerId(nextAnswer.id);
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

    if (newAnswerTimerRef.current) {
      clearTimeout(newAnswerTimerRef.current);
    }

    newAnswerTimerRef.current = setTimeout(() => {
      setNewAnswerId(null);
      newAnswerTimerRef.current = null;
    }, 620);
  };

  const handleAnswerKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submitAnswer();
    }
  };

  const answerLimitReached = answers.length >= 3;
  const questionAnimationCurrent = animatedQuestionSource === question;
  const questionStartedCurrent = questionAnimationCurrent && questionStarted;
  const typingCompleteCurrent = questionAnimationCurrent && typingComplete;
  const visibleTypedQuestion = questionAnimationCurrent ? typedQuestion : "";
  const answerInputDisabled = answerLimitReached || !typingCompleteCurrent;

  const handleAnswerShellPointerDown = (
    event: PointerEvent<HTMLFormElement>,
  ) => {
    const target = event.target;

    if (
      answerInputDisabled ||
      !(target instanceof HTMLElement) ||
      target instanceof HTMLTextAreaElement ||
      target instanceof HTMLInputElement ||
      target.closest("button")
    ) {
      return;
    }

    event.preventDefault();
    answerInputRef.current?.focus();
  };

  return (
    <div
      ref={stageRef}
      className="device-phone-stage"
      aria-label={messages.dailyQuestion.stageLabel}
    >
      <div className="device-phone-frame">
        <span className="device-phone-button device-phone-button--action" aria-hidden="true" />
        <span className="device-phone-button device-phone-button--volume-up" aria-hidden="true" />
        <span className="device-phone-button device-phone-button--volume-down" aria-hidden="true" />
        <span className="device-phone-button device-phone-button--power" aria-hidden="true" />
        <div className="device-screen device-phone-screen">
          {children ?? (
            <div
              className={`phone-daily-experience localized-copy${hasEntered ? " is-entered" : ""}${questionStartedCurrent ? " is-question-started" : ""}${typingCompleteCurrent ? " is-typing-complete" : ""}`}
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
                    {currentDate
                      ? formatLocalDate(
                          currentDate,
                          messages.dailyQuestion.dateLocale,
                        )
                      : messages.dailyQuestion.todayFallback}
                  </time>
                  <h3>
                    <span className="phone-daily-sr-only">{question}</span>
                    <span aria-hidden="true">
                      {visibleTypedQuestion}
                      {!typingCompleteCurrent && <i className="phone-daily-cursor" />}
                    </span>
                  </h3>
                </header>
                <div className="phone-daily-after-typing">
                  <div className="phone-daily-answer-space">
                    {answers.length > 0 ? (
                      <ol className="phone-daily-answer-list">
                        {answers.map((answer) => (
                          <li className={answer.id === newAnswerId ? "is-new" : undefined} key={answer.id}>
                            {answer.text}
                          </li>
                        ))}
                      </ol>
                    ) : (
                      <ul
                        className="phone-daily-example-list"
                        aria-label={messages.dailyQuestion.examplesLabel}
                      >
                        {exampleAnswers.map((example) => (
                          <li key={example}>{example}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                  {showSavedState ? (
                    <div className="phone-daily-saved-state" role="status" aria-live="polite">
                      <span aria-hidden="true">✓</span>
                      {messages.dailyQuestion.savedStatus}
                    </div>
                  ) : (
                    <form
                      className={`phone-daily-form${answers.length === 0 ? " is-after-examples" : ""}${answerInputDisabled ? " is-disabled" : ""}`}
                      onPointerDown={handleAnswerShellPointerDown}
                      onSubmit={submitAnswer}
                    >
                      <textarea
                        ref={answerInputRef}
                        value={answerDraft}
                        maxLength={120}
                        rows={2}
                        aria-label={messages.dailyQuestion.inputLabel}
                        placeholder={
                          answerLimitReached
                            ? messages.dailyQuestion.completedPlaceholder
                            : messages.dailyQuestion.inputPlaceholder
                        }
                        disabled={answerInputDisabled}
                        onChange={(event) => setAnswerDraft(event.target.value)}
                        onKeyDown={handleAnswerKeyDown}
                      />
                      <button
                        type="submit"
                        aria-label={messages.dailyQuestion.saveButtonLabel}
                        disabled={answerLimitReached || !answerDraft.trim()}
                        onPointerDown={(event) => event.stopPropagation()}
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
