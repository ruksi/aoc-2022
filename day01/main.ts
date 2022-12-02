const here = new URL(".", import.meta.url).pathname;
const input = await Deno.readTextFile(`${here}_input.dat`);

const calories = input
  .split("\n\n")
  .map((elf) =>
    elf
      .split("\n")
      .map((str) => parseInt(str))
      .reduce((prev, curr) => prev + curr)
  )
  .sort((a, b) => b - a);

export const part1 = calories[0];
export const part2 = calories
  .slice(0, 3)
  .reduce((prev, curr) => prev + curr);

if (import.meta.main) {
  console.log(`Day 01 - Part 1: ${part1}`);
  console.log(`Day 01 - Part 2: ${part2}`);
}
