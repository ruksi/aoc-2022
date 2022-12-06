const here = new URL(".", import.meta.url).pathname;
const input = await Deno.readTextFile(`${here}_input.dat`);

const setup = input
  .split("\n\n")
  .map((row) => row.split("\n"));

const groupBy = (data: string, count: number): string[] => {
  const groups = [];
  for (let i = 0; i < data.length; i += count) {
    groups.push(data.slice(i, i + count));
  }
  return groups;
};

const stacks = setup[0]
  .reverse()
  .slice(1) // remove the stack numbering
  .map((row) =>
    groupBy(row, 4)
      .map((crate) =>
        crate
          .replace(/([\[\]])/g, "")
          .trim()
      )
  )
  .reduce((stacks, row) => {
    if (!stacks.length) { // initialize the stacks
      stacks = [...Array(row.length)].map((_) => [] as string[]);
    }
    row.forEach((char: string, idx) =>
      char.length ? stacks[idx].push(char) : null
    );
    return stacks;
  }, [] as string[][]);

class Order {
  count: number;
  source: number;
  destination: number;

  constructor(count: number, source: number, destination: number) {
    this.count = count;
    this.source = source;
    this.destination = destination;
  }

  static parse(str: string) {
    const hits = str.match(/move (\d+) from (\d+) to (\d+)/);
    if (!hits || hits.length != 4) {
      throw Error(`Invalid order string: "${str}"`);
    }
    return new Order(
      parseInt(hits[1]),
      parseInt(hits[2]) - 1, // our stacks are zero-indexed
      parseInt(hits[3]) - 1, // our stacks are zero-indexed
    );
  }
}

const orders = setup[1].map((str) => Order.parse(str));

const mover9000 = JSON.parse(JSON.stringify(stacks)) as string[][];
for (const order of orders) {
  [...Array(order.count)].forEach((_) => {
    const source = mover9000[order.source];
    const destination = mover9000[order.destination];
    destination.push(source.pop() as string);
  });
}

const mover9001 = JSON.parse(JSON.stringify(stacks)) as string[][];
for (const order of orders) {
  const crane: string[] = [];
  const source = mover9001[order.source];
  [...Array(order.count)].forEach((_) => crane.push(source.pop() as string));
  const destination = mover9001[order.destination];
  crane.reverse().forEach((char) => destination.push(char));
}

export const part1 = mover9000.flatMap((s) => s.pop()).join("");
export const part2 = mover9001.flatMap((s) => s.pop()).join("");
if (import.meta.main) {
  console.log(`Day 05 - Part 1: ${part1}`);
  console.log(`Day 05 - Part 2: ${part2}`);
}
