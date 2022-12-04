const here = new URL(".", import.meta.url).pathname;
const input = await Deno.readTextFile(`${here}_input.dat`);

const toRange = (str: string): number[] => {
  const startAndEnd = str.split("-");
  const start = parseInt(startAndEnd[0]);
  const end = parseInt(startAndEnd[1]);
  return [...Array(end - start + 1).keys()].map((i) => i + start);
};

const rows = input
  .split("\n")
  .map((row) => row.split(","))
  .map((row) => [toRange(row[0]), toRange(row[1])]);

const isSubsetOf = <T>(a: T[], b: T[]): boolean =>
  a.every((i) => b.includes(i));
const subsetCount = rows.reduce((acc, row) => {
  return (isSubsetOf(row[0], row[1]) || isSubsetOf(row[1], row[0]))
    ? acc + 1
    : acc;
}, 0);

const hasOverlapWith = <T>(a: T[], b: T[]): boolean =>
  a.some((i) => b.includes(i));
const overlapCount = rows.reduce((acc, row) => {
  return (hasOverlapWith(row[0], row[1]) || hasOverlapWith(row[1], row[0]))
    ? acc + 1
    : acc;
}, 0);

export const part1 = subsetCount;
export const part2 = overlapCount;

if (import.meta.main) {
  console.log(`Day 04 - Part 1: ${part1}`);
  console.log(`Day 04 - Part 2: ${part2}`);
}
