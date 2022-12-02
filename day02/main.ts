// noinspection PointlessArithmeticExpressionJS

const here = new URL(".", import.meta.url).pathname;
const input = await Deno.readTextFile(`${here}_input.dat`);

const scores: Record<string, number> = {
  "A A": 1 + 3,
  "A B": 2 + 6,
  "A C": 3 + 0,
  "B A": 1 + 0,
  "B B": 2 + 3,
  "B C": 3 + 6,
  "C A": 1 + 6,
  "C B": 2 + 0,
  "C C": 3 + 3,
};

const rows = input
  .trim()
  .split("\n");

export const part1 = rows
  .map((r) => r.replace("X", "A").replace("Y", "B").replace("Z", "C"))
  .map((row) => scores[row])
  .reduce((p, c) => p + c);

const picks: Record<string, string> = {
  "A X": "A C",
  "A Y": "A A",
  "A Z": "A B",
  "B X": "B A",
  "B Y": "B B",
  "B Z": "B C",
  "C X": "C B",
  "C Y": "C C",
  "C Z": "C A",
};

export const part2 = rows
  .map((row) => scores[picks[row]])
  .reduce((p, c) => p + c);

if (import.meta.main) {
  console.log(`Day 02 - Part 1: ${part1}`);
  console.log(`Day 02 - Part 2: ${part2}`);
}
