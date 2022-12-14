const here = new URL(".", import.meta.url).pathname;
const input = await Deno.readTextFile(`${here}_input.dat`);

interface Point {
  x: number;
  y: number;
}

const toPoint = (text: string): Point => {
  const split = text.split(",");
  if (split.length != 2) throw Error(`invalid point ${text}`);
  const x = parseInt(split[0]);
  const y = parseInt(split[1]);
  return { x, y };
};

const integersBetween = (start: number, end: number): number[] => {
  const s = start > end ? end : start;
  const e = s == start ? end : start;
  const count = e - s + 1; // 1 as includes the tailing integer
  const integers = [...Array(count).keys()].map((i) => i + s);
  if (e == start) integers.reverse();
  return integers;
};

const pointsBetween = (start: Point, end: Point): Point[] => {
  if (start.x == end.x) {
    return integersBetween(start.y, end.y).map((y) => ({ x: start.x, y }));
  } else if (start.y == end.y) {
    return integersBetween(start.x, end.x).map((x) => ({ x, y: start.y }));
  }
  throw Error(`line points don't share an axis`);
};

const rowToPoints = (row: string): Point[] => {
  const points: Point[] = [];
  const texts = row.split(" -> ");
  for (let i = 0; i < texts.length; i++) {
    const previous = texts[i - 1];
    if (typeof previous == "undefined") continue;
    const current = texts[i];
    const [pPoint, cPoint] = [toPoint(previous), toPoint(current)];
    const between = pointsBetween(pPoint, cPoint);
    points.push(...between);
  }
  return points;
};

const rocks = input
  .split("\n")
  .flatMap(rowToPoints);

enum Thing {
  Rock = 1,
  Sand = 2,
}

type Grid = Record<number, Record<number, Thing>>;
const cave: Grid = {};
const getThing = (grid: Grid, point: Point): Thing | undefined => {
  if (typeof grid[point.y] == "undefined") grid[point.y] = {};
  return grid[point.y][point.x];
};
const setThing = (grid: Grid, point: Point, value: Thing) => {
  if (typeof grid[point.y] == "undefined") grid[point.y] = {};
  grid[point.y][point.x] = value;
};

rocks.forEach((rock) => setThing(cave, rock, Thing.Rock));

const pourSand = (
  grid: Grid,
  source: Point,
  abyssY: number,
  floorY: number,
) => {
  outer:
  while (true) {
    const point = { ...source };
    const here = getThing(grid, point);
    if (typeof here != "undefined") break; // the source is blocked
    while (true) {
      if (point.y >= abyssY) break outer; // fell to the void
      if (point.y + 1 >= floorY) { // hit the infinitely wide floor
        setThing(grid, point, Thing.Sand);
        break;
      }
      const down = getThing(grid, { x: point.x, y: point.y + 1 });
      if (typeof down == "undefined") {
        point.y += 1;
        continue;
      }
      const downLeft = getThing(grid, { x: point.x - 1, y: point.y + 1 });
      if (typeof downLeft == "undefined") {
        point.x -= 1;
        point.y += 1;
        continue;
      }
      const downRight = getThing(grid, { x: point.x + 1, y: point.y + 1 });
      if (typeof downRight == "undefined") {
        point.x += 1;
        point.y += 1;
        continue;
      }
      setThing(grid, point, Thing.Sand);
      break;
    }
  }
};

const countSand = (grid: Grid): number => {
  return Object.entries(grid)
    .reduce((total, [_k, row]) => {
      return total +
        Object.entries(row).reduce(
          (count, [_k, thing]) => thing == Thing.Sand ? count + 1 : count,
          0,
        );
    }, 0);
};

const maxY = Math.max(...rocks.map((point) => point.y));
const source = toPoint("500,0");

const endlessCave = JSON.parse(JSON.stringify(cave));
pourSand(endlessCave, source, maxY, Infinity);

const flooredCave = JSON.parse(JSON.stringify(cave));
pourSand(flooredCave, source, Infinity, maxY + 2);

export const part1 = countSand(endlessCave);
export const part2 = countSand(flooredCave);
if (import.meta.main) {
  console.log(`Day 14 - Part 1: ${part1}`); // 24
  console.log(`Day 14 - Part 2: ${part2}`); // 93
}
