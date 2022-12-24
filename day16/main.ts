const here = new URL(".", import.meta.url).pathname;
const input = await Deno.readTextFile(`${here}_input.dat`);

console.log(
  "This might take a while... like 1 hour or more depending on your hardware.",
);

interface Valve {
  id: string;
  rate: number;
  tunnels: string[];
}

type ValveMap = Record<string, Valve>;

const valves: ValveMap = Object.fromEntries(
  input
    .split("\n")
    .map((row) => {
      const hits = row.match(
        /Valve (\w+) has flow rate=(\d+); tunnels? leads? to valves? ([\w, ]+)/,
      );
      if (!hits || hits.length != 4) throw Error("invalid input");
      const id = hits[1];
      const rate = parseInt(hits[2]);
      const tunnels = hits[3].split(", ");
      return [id, { id, rate, tunnels }];
    }),
);

const breadthFirstSearch = (
  graph: ValveMap,
  toOpen: string[],
  root: string,
  timeLeft: number,
) => {
  const explored = new Set<string>();
  explored.add(root);

  const queue: string[] = [];
  queue.push(root);

  const parents: Record<string, string> = {};

  const best: { paths: string[][]; score: number } = {
    paths: [],
    score: 0,
  };

  while (queue.length) {
    const valve = graph[queue.shift() as string];

    if (toOpen.includes(valve.id) && valve.rate > 0) {
      const path = [valve.id];
      while (true) {
        const curr = path[path.length - 1];
        if (curr == root) break;
        path.push(parents[curr]);
      }
      path.reverse();
      if (timeLeft - path.length < 0) continue;

      const branchTimeLeft = timeLeft - path.length;
      const branchRoot = path[path.length - 1];
      const score = branchTimeLeft * valve.rate;

      const branchOpenValves = [...toOpen];
      branchOpenValves.splice(branchOpenValves.indexOf(branchRoot, 0), 1);
      const branchBest = breadthFirstSearch(
        valves,
        branchOpenValves,
        branchRoot,
        branchTimeLeft,
      );

      if (branchBest.score + score > best.score) {
        best.paths = [path].concat(branchBest.paths);
        best.score = branchBest.score + score;
      }
    }

    for (const neighbor of valve.tunnels.map((id) => graph[id])) {
      if (explored.has(neighbor.id)) continue;
      explored.add(neighbor.id);
      parents[neighbor.id] = valve.id;
      queue.push(neighbor.id);
    }
  }

  return best;
};

const cartesian = function* <T>(head: T[], ...tail: T[][]): Generator<T[]> {
  // @ts-ignore the spread is fine
  const remainder = tail.length > 0 ? cartesian(...tail) : [[]];
  for (const r of remainder) for (const h of head) yield [h, ...r];
};

const hasDuplicates = <T>(array: T[]): boolean =>
  !!array.find((id, index) => array.indexOf(id) != index);

const leftSides = function* (
  array: string[],
  size: number,
): Generator<string[]> {
  const uniques = new Set<string>();
  for (
    // @ts-ignore the spread is fine
    const potential of cartesian(...[...Array(size).keys()].map((_) => array))
  ) {
    if (hasDuplicates(potential)) continue;
    potential.sort();
    const key = potential.reduce((all, char) => all + char, "");
    uniques.add(key);
  }
  for (const leftSideAsKey of uniques.values()) {
    yield leftSideAsKey.match(/.{1,2}/g) as string[];
  }
};

const combos = function* (array: string[]): Generator<string[][]> {
  for (const i of Array(Math.floor(array.length / 2)).keys()) {
    // zero-sized task list is like doing it solo so +1
    const leftSize = i + 1;
    for (const leftSide of leftSides(array, leftSize)) {
      const rightSide = array.filter((x) => !leftSide.includes(x));
      yield [leftSide, rightSide];
      // as it doesn't matter who does the "left" or "right" side,
      // we don't need to return information about having the valve close
      // assignments other way around...
      // if (leftSide.length != rightSide.length) yield [rightSide, leftSide];
    }
  }
};

const toOpenArray = Object.entries(valves)
  .filter(([_, valve]) => valve.rate > 0)
  .map(([_, valve]) => valve.id);

const soloOptimal = breadthFirstSearch(valves, toOpenArray, "AA", 30);

let bestComboScore = 0;
for (const [left, right] of combos(toOpenArray)) {
  const leftOptimal = breadthFirstSearch(valves, left, "AA", 26);
  const rightOptimal = breadthFirstSearch(valves, right, "AA", 26);
  const comboScore = leftOptimal.score + rightOptimal.score;
  bestComboScore = comboScore > bestComboScore ? comboScore : bestComboScore;
  console.log(`current best ${bestComboScore} (last trial was ${comboScore})`);
}

export const part1 = soloOptimal.score;
export const part2 = bestComboScore;
if (import.meta.main) {
  console.log(`Day 16 - Part 1: ${part1}`); // 1651
  console.log(`Day 16 - Part 2: ${part2}`); // 1707
}
