"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from "react";
import { DAILY_PUZZLES, WEEK_PROGRESS_BY_DAY } from "./dailyPuzzles";

const DAILY_PUZZLE_STORAGE_KEY = "same-studio-daily-puzzle-v1";

type StoredPuzzleDay = {
  board: boolean[];
  moves: number;
  completed: boolean;
  completedAt: string | null;
};

type DailyPuzzleStorage = {
  version: 1;
  days: Record<string, StoredPuzzleDay>;
};

function toggleTileAndNeighbors(board: boolean[], tileIndex: number) {
  const row = Math.floor(tileIndex / 3);
  const column = tileIndex % 3;
  const affectedTiles = [tileIndex];

  if (row > 0) affectedTiles.push(tileIndex - 3);
  if (row < 2) affectedTiles.push(tileIndex + 3);
  if (column > 0) affectedTiles.push(tileIndex - 1);
  if (column < 2) affectedTiles.push(tileIndex + 1);

  return board.map((isOn, index) => affectedTiles.includes(index) ? !isOn : isOn);
}

function isUniformBoard(board: boolean[]) {
  return board.length === 9 && board.every((tile) => tile === board[0]);
}

function getLocalDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function isStoredPuzzleDay(value: unknown): value is StoredPuzzleDay {
  if (!value || typeof value !== "object") return false;

  const storedDay = value as Partial<StoredPuzzleDay>;
  return (
    Array.isArray(storedDay.board) &&
    storedDay.board.length === 9 &&
    storedDay.board.every((tile) => typeof tile === "boolean") &&
    typeof storedDay.moves === "number" &&
    Number.isInteger(storedDay.moves) &&
    storedDay.moves >= 0 &&
    typeof storedDay.completed === "boolean" &&
    (storedDay.completedAt === null || typeof storedDay.completedAt === "string")
  );
}

function readPuzzleStorage(): DailyPuzzleStorage {
  try {
    const storedValue = window.localStorage.getItem(DAILY_PUZZLE_STORAGE_KEY);
    if (!storedValue) return { version: 1, days: {} };

    const parsedValue = JSON.parse(storedValue) as Partial<DailyPuzzleStorage>;
    if (parsedValue.version !== 1 || !parsedValue.days || typeof parsedValue.days !== "object") {
      return { version: 1, days: {} };
    }

    const days = Object.fromEntries(
      Object.entries(parsedValue.days).filter((entry): entry is [string, StoredPuzzleDay] => isStoredPuzzleDay(entry[1])),
    );
    return { version: 1, days };
  } catch {
    return { version: 1, days: {} };
  }
}

function writePuzzleDay(dateKey: string, day: StoredPuzzleDay) {
  try {
    const storage = readPuzzleStorage();
    storage.days[dateKey] = day;
    window.localStorage.setItem(DAILY_PUZZLE_STORAGE_KEY, JSON.stringify(storage));
  } catch {
    // The puzzle remains playable in memory when storage is unavailable.
  }
}

type IPadFrameProps = {
  children?: ReactNode;
};

export function IPadFrame({ children }: IPadFrameProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const resetButtonRef = useRef<HTMLButtonElement>(null);
  const tileButtonRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [hasEntered, setHasEntered] = useState(false);
  const [currentDate, setCurrentDate] = useState<Date | null>(null);
  const [board, setBoard] = useState<boolean[]>([]);
  const [moves, setMoves] = useState(0);
  const weekday = currentDate?.getDay() ?? null;
  const currentDateKey = currentDate ? getLocalDateKey(currentDate) : "";
  const isCompleted = isUniformBoard(board);

  useEffect(() => {
    const dateFrame = window.requestAnimationFrame(() => setCurrentDate(new Date()));

    return () => window.cancelAnimationFrame(dateFrame);
  }, []);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

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
      if (!document.hidden) refreshLocalDate();
    };

    scheduleNextMidnight();
    window.addEventListener("focus", refreshLocalDate);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      if (midnightTimer) clearTimeout(midnightTimer);
      window.removeEventListener("focus", refreshLocalDate);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    if (!currentDate || !currentDateKey) return;

    const storageFrame = window.requestAnimationFrame(() => {
      const savedDay = readPuzzleStorage().days[currentDateKey];
      setBoard(savedDay ? [...savedDay.board] : [...DAILY_PUZZLES[currentDate.getDay()].board]);
      setMoves(savedDay?.moves ?? 0);
    });

    return () => window.cancelAnimationFrame(storageFrame);
  }, [currentDate, currentDateKey]);

  const handleTileClick = (tileIndex: number) => {
    if (isCompleted) {
      return;
    }

    const nextBoard = toggleTileAndNeighbors(board, tileIndex);
    const nextMoves = moves + 1;
    const nextCompleted = isUniformBoard(nextBoard);
    const nextCompletedAt = nextCompleted ? new Date().toISOString() : null;

    setBoard(nextBoard);
    setMoves(nextMoves);

    if (currentDateKey) {
      writePuzzleDay(currentDateKey, {
        board: nextBoard,
        moves: nextMoves,
        completed: nextCompleted,
        completedAt: nextCompletedAt,
      });
    }
  };

  const resetPuzzle = () => {
    if (weekday === null) {
      return;
    }

    const initialBoard = [...DAILY_PUZZLES[weekday].board];
    setBoard(initialBoard);
    setMoves(0);

    if (currentDateKey) {
      writePuzzleDay(currentDateKey, {
        board: initialBoard,
        moves: 0,
        completed: false,
        completedAt: null,
      });
    }
  };

  const handleScreenPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget || !resetButtonRef.current) return;

    const resetBounds = resetButtonRef.current.getBoundingClientRect();
    if (
      event.clientX >= resetBounds.left &&
      event.clientX <= resetBounds.right &&
      event.clientY >= resetBounds.top &&
      event.clientY <= resetBounds.bottom
    ) {
      resetPuzzle();
      return;
    }

    const tileIndex = tileButtonRefs.current.findIndex((tile) => {
      if (!tile) return false;
      const tileBounds = tile.getBoundingClientRect();
      return (
        event.clientX >= tileBounds.left &&
        event.clientX <= tileBounds.right &&
        event.clientY >= tileBounds.top &&
        event.clientY <= tileBounds.bottom
      );
    });

    if (tileIndex >= 0) handleTileClick(tileIndex);
  };

  const handleResetKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      resetPuzzle();
    }
  };

  return (
    <div ref={stageRef} className="device-tablet-stage" role="group" aria-label="THINK SPACE 하루 퍼즐">
      <div className="device-tablet-frame">
        <div className="device-screen device-tablet-screen" onPointerUp={handleScreenPointerUp}>
          {children ?? (
            <div className={`tablet-puzzle${hasEntered ? " is-entered" : ""}`}>
              <header className="tablet-puzzle-header">
                <span>THINK SPACE</span>
                <time>{weekday === null ? "-- / 07" : WEEK_PROGRESS_BY_DAY[weekday]}</time>
              </header>
              <main className="tablet-puzzle-main">
                <p id="tablet-puzzle-instructions">Make every light feel the same.</p>
                <div
                  className={`tablet-puzzle-board${isCompleted ? " is-complete" : ""}`}
                  role="group"
                  aria-label="3×3 하루 패턴 퍼즐"
                  aria-describedby="tablet-puzzle-instructions"
                >
                  {board.map((isOn, index) => (
                    <button
                      key={index}
                      ref={(element) => {
                        tileButtonRefs.current[index] = element;
                      }}
                      type="button"
                      className={`tablet-puzzle-tile${isOn ? " is-on" : ""}`}
                      aria-label={`${Math.floor(index / 3) + 1}행 ${(index % 3) + 1}열 타일, ${isOn ? "켜짐" : "꺼짐"}`}
                      aria-pressed={isOn}
                      disabled={isCompleted}
                      style={{ "--tile-index": index } as CSSProperties}
                      onClick={() => handleTileClick(index)}
                    />
                  ))}
                </div>
                <button
                  ref={resetButtonRef}
                  type="button"
                  className={`tablet-puzzle-reset${hasEntered ? " is-visible" : ""}`}
                  disabled={weekday === null}
                  onClick={resetPuzzle}
                  onKeyDown={handleResetKeyDown}
                  aria-label="오늘의 퍼즐 초기화"
                >
                  Reset
                </button>
                <div
                  className={`tablet-puzzle-completion${isCompleted ? " is-visible" : ""}`}
                  aria-live="polite"
                  aria-atomic="true"
                >
                  {isCompleted ? (
                    <div>
                      <span aria-hidden="true">✓</span>
                      <strong>A little clearer.</strong>
                      <small>Tomorrow, another thought.</small>
                    </div>
                  ) : null}
                </div>
              </main>
              <div className="tablet-puzzle-footer">
                <span>Moves {String(moves).padStart(2, "0")}</span>
                <span aria-hidden="true" />
                <span className="tablet-puzzle-status" aria-hidden="true" />
              </div>
            </div>
          )}
        </div>
        <span className="device-tablet-camera" aria-hidden="true" />
        <span className="device-tablet-button" aria-hidden="true" />
        <span className="device-frame-highlight" aria-hidden="true" />
      </div>
    </div>
  );
}
