import { join } from "std/path/posix.ts";

const here = new URL(".", import.meta.url).pathname;
const input = await Deno.readTextFile(`${here}_input.dat`);

interface Command {
  executable: "cd" | "ls";
  target: string;
  output: string[];
}

interface File {
  name: string;
  size: number;
}

const commands: Command[] = input
  .split("$ ")
  .filter((row) => row.length)
  .map((row) => row.split("\n").filter((part) => part.length))
  .map((row) => {
    const parts = row[0].split(" ");
    return {
      executable: parts[0] as "cd" | "ls",
      target: parts.length > 1 ? parts[1] : "",
      output: row.slice(1),
    };
  });

const filesystem: Record<string, File[]> = {};

let currentLocation = "???";
for (const cmd of commands) {
  if (cmd.executable == "cd") {
    currentLocation = cmd.target.startsWith("/")
      ? join(cmd.target)
      : join(currentLocation, cmd.target);
  } else if (cmd.executable == "ls") {
    const files: File[] = cmd.output
      .filter((o) => !o.startsWith("dir"))
      .map((o) => {
        const parts = o.split(" ");
        return { name: parts[1], size: parseInt(parts[0]) };
      });
    filesystem[currentLocation] = files;
  } else {
    throw Error(`unknown command executable: ${cmd.executable}`);
  }
}

const dirSelfSizes: Record<string, number> = Object.fromEntries(
  Object.entries(filesystem)
    .map(([k, v]) => [k, v.reduce((acc, f) => acc + f.size, 0)]),
);

const dirTotalSizes = Object.fromEntries(
  Object.entries(dirSelfSizes)
    .map(([k, _]) => {
      const selfAndChildrenSize = Object.entries(dirSelfSizes)
        .filter(([p, _]) => p.startsWith(k))
        .reduce((acc, [_, v]) => acc + v, 0);
      return [k, selfAndChildrenSize];
    }),
);

const combinedSizeOfSmallDirectories = Object.entries(dirTotalSizes)
  .filter(([_, v]) => v < 100000)
  .reduce((acc, [_, v]) => acc + v, 0);

const totalSpace = 70000000;
const updateSpace = 30000000;
const rootSpace = totalSpace - dirTotalSizes["/"];
const neededSpace = updateSpace - rootSpace;
const dirToDeleteSize = Object.entries(dirTotalSizes)
  .filter(([_, v]) => v >= neededSpace)
  .sort(([_, a], [__, b]) => a - b)[0][1];

export const part1 = combinedSizeOfSmallDirectories;
export const part2 = dirToDeleteSize;
if (import.meta.main) {
  console.log(`Day 07 - Part 1: ${part1}`);
  console.log(`Day 07 - Part 2: ${part2}`);
}
