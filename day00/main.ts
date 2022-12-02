const here = new URL(".", import.meta.url).pathname;
const input = await Deno.readTextFile(`${here}_input.dat`);

export const part1 = input.length;
export const part2 = input.length;

if (import.meta.main) {
  console.log(`Day 00 - Part 1: ${part1}`);
  console.log(`Day 00 - Part 2: ${part2}`);
}
