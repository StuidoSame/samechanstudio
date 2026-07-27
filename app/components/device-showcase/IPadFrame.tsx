"use client";

import { useEffect, useState, type ReactNode } from "react";
import { DAILY_PUZZLES, WEEK_PROGRESS_BY_DAY } from "./dailyPuzzles";

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

type IPadFrameProps = {
  children?: ReactNode;
};

export function IPadFrame({ children }: IPadFrameProps) {
  const [weekday, setWeekday] = useState<number | null>(null);
  const [board, setBoard] = useState<boolean[]>([]);
  const [moves, setMoves] = useState(0);
  const isCompleted = isUniformBoard(board);

  useEffect(() => {
    const dateFrame = window.requestAnimationFrame(() => {
      const localWeekday = new Date().getDay();
      setWeekday(localWeekday);
      setBoard([...DAILY_PUZZLES[localWeekday].board]);
      setMoves(0);
    });

    return () => window.cancelAnimationFrame(dateFrame);
  }, []);

  const handleTileClick = (tileIndex: number) => {
    if (isCompleted) {
      return;
    }

    setBoard((currentBoard) => toggleTileAndNeighbors(currentBoard, tileIndex));
    setMoves((currentMoves) => currentMoves + 1);
  };

  const resetPuzzle = () => {
    if (weekday === null) {
      return;
    }

    setBoard([...DAILY_PUZZLES[weekday].board]);
    setMoves(0);
  };

  return (
    <div className="device-tablet-stage" aria-label="Interactive iPad daily puzzle">
      <div className="device-tablet-frame">
        <div className="device-screen device-tablet-screen">
          {children ?? (
            <div className="tablet-puzzle">
              <header className="tablet-puzzle-header">
                <span>THINK SPACE</span>
                <time>{weekday === null ? "-- / 07" : WEEK_PROGRESS_BY_DAY[weekday]}</time>
              </header>
              <main className="tablet-puzzle-main">
                <p id="tablet-puzzle-instructions">Make every light feel the same.</p>
                <div className={`tablet-puzzle-board${isCompleted ? " is-complete" : ""}`} aria-labelledby="tablet-puzzle-instructions">
                  {board.map((isOn, index) => (
                    <button
                      key={index}
                      type="button"
                      className={`tablet-puzzle-tile${isOn ? " is-on" : ""}`}
                      aria-label={`${Math.floor(index / 3) + 1}행 ${(index % 3) + 1}열 타일, ${isOn ? "켜짐" : "꺼짐"}`}
                      aria-pressed={isOn}
                      disabled={isCompleted}
                      onClick={() => handleTileClick(index)}
                    />
                  ))}
                </div>
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
              <footer className="tablet-puzzle-footer">
                <span>Moves {String(moves).padStart(2, "0")}</span>
                <button type="button" disabled={weekday === null} onClick={resetPuzzle} aria-label="오늘의 퍼즐 초기화">Reset</button>
                <span className="tablet-puzzle-status" aria-hidden="true" />
              </footer>
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
