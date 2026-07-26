export type TypeRevealStep = {
  text: string;
  speed: number;
  gapAfter?: number;
};

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
