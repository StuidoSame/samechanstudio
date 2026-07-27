export type DailyPuzzle = {
  board: readonly boolean[];
  minimumMoves: number;
};

export const DAILY_PUZZLES: Record<number, DailyPuzzle> = {
  0: { board: [false, false, false, true, false, true, true, false, true], minimumMoves: 2 },
  1: { board: [false, false, true, true, true, false, true, false, false], minimumMoves: 3 },
  2: { board: [false, false, false, true, false, false, true, false, true], minimumMoves: 3 },
  3: { board: [false, true, false, true, false, true, false, true, false], minimumMoves: 4 },
  4: { board: [true, true, false, false, false, true, true, false, false], minimumMoves: 4 },
  5: { board: [false, false, false, false, true, false, false, true, false], minimumMoves: 5 },
  6: { board: [false, false, false, false, true, true, false, true, true], minimumMoves: 6 },
};

export const WEEK_PROGRESS_BY_DAY: Record<number, string> = {
  0: "07 / 07",
  1: "01 / 07",
  2: "02 / 07",
  3: "03 / 07",
  4: "04 / 07",
  5: "05 / 07",
  6: "06 / 07",
};
