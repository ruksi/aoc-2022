const here = new URL(".", import.meta.url).pathname;
const input = await Deno.readTextFile(`${here}_input.dat`);

type InspectFunction = (worry: number) => number;
type PassFunction = (worry: number) => number;

interface Monkey {
  items: number[];
  inspect: InspectFunction;
  pass: PassFunction;
}

const dividers: number[] = [];

const primeMonkeys = input
  .split("\n\n")
  .map((section) => {
    const split = section.split("\n");

    const items = (split[1].match(/ Starting items: (.+)/) || [])[1]
      .split(", ")
      .map((n) => parseInt(n));

    const operation = split[2].match(/Operation: new = old ([*+]) (.+)/);
    if (!operation || operation.length != 3) throw Error();
    const symbol = operation[1] as "+" | "*";
    const operand = parseInt(operation[2]);

    let inspect: InspectFunction;
    if (symbol === "+") {
      inspect = (old: number) => old + (isNaN(operand) ? old : operand);
    } else if (symbol === "*") {
      inspect = (old: number) => old * (isNaN(operand) ? old : operand);
    } else {
      throw Error();
    }

    const divider = parseInt(
      (split[3].match(/Test: divisible by (\d+)/) || [])[1],
    );
    const truthy = parseInt(
      (split[4].match(/If true: throw to monkey (\d+)/) || [])[1],
    );
    const falsy = parseInt(
      (split[5].match(/If false: throw to monkey (\d+)/) || [])[1],
    );

    dividers.push(divider);

    const pass: PassFunction = (worry: number) => {
      return (worry % divider == 0) ? truthy : falsy;
    };

    const m: Monkey = { items, inspect, pass };
    return m;
  });

const monkeyAround = (
  monkeys: Monkey[],
  rounds: number,
  compressor: (worry: number) => number,
): number => {
  // copy only the changing parts; the "items"
  monkeys = monkeys.map((m) => ({ ...m, items: [...m.items] }));

  const inspects = [...Array(monkeys.length)].map((_) => 0);

  for (const _index of [...Array(rounds).keys()]) {
    for (const [monkeyId, monkey] of monkeys.entries()) {
      const items = monkey.items;
      monkey.items = [];
      for (const item of items) {
        let worry = item;
        worry = monkey.inspect(worry);
        inspects[monkeyId] += 1;
        worry = compressor(worry);
        const passTo = monkey.pass(worry);
        monkeys[passTo].items.push(worry);
      }
    }
  }

  const sorted = inspects.sort((a, b) => b - a);
  return sorted[0] * sorted[1];
};

const relief = (worry: number) => {
  return Math.floor(worry / 3);
};
const relaxingMonkeyBusiness = monkeyAround(primeMonkeys, 20, relief);

const keepMeaningfulParts = (worry: number) => {
  return worry % dividers.reduce((product, div) => div * product, 1);
};
const stressfulMonkeyBusiness = monkeyAround(
  primeMonkeys,
  10000,
  keepMeaningfulParts,
);

export const part1 = relaxingMonkeyBusiness;
export const part2 = stressfulMonkeyBusiness;
if (import.meta.main) {
  console.log(`Day 11 - Part 1: ${part1}`);
  console.log(`Day 11 - Part 2: ${part2}`);
}
