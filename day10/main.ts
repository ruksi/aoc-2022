const here = new URL(".", import.meta.url).pathname;
const input = await Deno.readTextFile(`${here}_input.dat`);

type Command = "noop" | "add";

interface Instruction {
  command: Command;
  argument: number;
}

const program = input.split("\n").flatMap((row) => {
  const split = row.split(" ");
  const command = split[0];
  if (command == "noop") {
    return { command: "noop", argument: 0 };
  }
  if (command == "addx") {
    // simplify "addx" to "noop" + "add" (which also adds to x)
    return [
      { command: "noop", argument: 0 },
      { command: "add", argument: parseInt(split[1]) },
    ];
  }
});

let x = 1;
let sumSignals = 0;
let crt = "";

for (const [index, instruction] of program.entries()) {
  if (!instruction) throw Error();

  const cycle = index + 1;
  if (cycle % 20 == 0) {
    if (cycle == 20 || (cycle - 20) % 40 == 0) {
      const signal = cycle * x;
      sumSignals += signal;
    }
  }

  const sprite = [x - 1, x, x + 1];
  crt += sprite.includes(index % 40) ? "#" : ".";
  if (cycle % 40 == 0) {
    crt += "\n";
  }

  if (instruction.command == "add") {
    x += instruction.argument;
  }
}

export const part1 = sumSignals;
export const part2 = "\n" + crt;
if (import.meta.main) {
  console.log(`Day 10 - Part 1: ${part1}`);
  console.log(`Day 10 - Part 2: ${part2}`);
}
