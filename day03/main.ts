const here = new URL(".", import.meta.url).pathname;
const input = await Deno.readTextFile(`${here}_input.dat`);

const sacks = input
  .split("\n");

const splitSacks = sacks
  .map((sack) => {
    const len = sack.length;
    const mid = len / 2;
    return [sack.slice(0, mid), sack.slice(mid, len)];
  });

const duplicates = splitSacks
  .map((sack) => {
    const firstCompartment = sack[0];
    const secondCompartment = sack[1];
    return firstCompartment
      .split("")
      .find((char) => secondCompartment.includes(char)) as string;
  });

const lowerOffset = "a".charCodeAt(0) - 1;
const upperOffset = "A".charCodeAt(0) - 27; // 27 is from the lowercase a - z
const charToPriority = (char: string) => {
  const code = char.charCodeAt(0);
  return code > lowerOffset ? code - lowerOffset : code - upperOffset;
};
const sum = (previous: number, current: number) => previous + current;

export const part1 = duplicates.map(charToPriority).reduce(sum);

const groupBy = <T>(data: T[], count: number): T[][] => {
  const groups = [];
  for (let i = 0; i < data.length; i += count) {
    groups.push(data.slice(i, i + count));
  }
  return groups;
};

const elfGroups = groupBy(sacks, 3);

const badges = elfGroups.map((group) => {
  const firstElf = group[0];
  const secondElf = group[1];
  const thirdElf = group[2];
  return firstElf
    .split("")
    .find((char) =>
      secondElf.includes(char) && thirdElf.includes(char)
    ) as string;
});

export const part2 = badges.map(charToPriority).reduce(sum);

if (import.meta.main) {
  console.log(`Day 03 - Part 1: ${part1}`);
  console.log(`Day 03 - Part 2: ${part2}`);
}
