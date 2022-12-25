const here = new URL(".", import.meta.url).pathname;
const input = await Deno.readTextFile(`${here}_input.dat`);

type Point = {
  x: number;
  y: number;
  z: number;
};

type Droplet = string; // e.g. "1,2,3" meaning "x,y,z"

const isPoint = (thing: Point | Droplet): thing is Point => {
  return (thing as Point).x !== undefined;
};

const toPoint = (droplet: Droplet | Point): Point => {
  if (isPoint(droplet)) return droplet;
  const split = droplet.split(",");
  if (split.length != 3) throw Error(`invalid droplet ${droplet}`);
  const [x, y, z] = split.map(Number);
  return { x, y, z };
};

const isDroplet = (thing: Droplet | Point): thing is Droplet => {
  return typeof thing === "string";
};

const toDroplet = (point: Point | Droplet): Droplet => {
  if (isDroplet(point)) return point;
  return `${point.x},${point.y},${point.z}`;
};

const neighbors = (point: Point | Droplet): Set<Droplet> => {
  const p = toPoint(point);
  return new Set([
    [1, -1].map((n) => ({ x: p.x + n, y: p.y, z: p.z })),
    [1, -1].map((n) => ({ x: p.x, y: p.y + n, z: p.z })),
    [1, -1].map((n) => ({ x: p.x, y: p.y, z: p.z + n })),
  ].flatMap((ns) => ns.flatMap((n) => toDroplet(n))));
};

const union = <T>(a: Set<T>, b: Set<T>): Set<T> => new Set([...a, ...b]);

const difference = <T>(a: Set<T>, b: Set<T>): Set<T> =>
  new Set([...a].filter((x) => !b.has(x)));

const lava = new Set<Droplet>(input.split("\n"));
const isLava = (droplet: Droplet): boolean => lava.has(droplet);
const isAir = (droplet: Droplet): boolean => !lava.has(droplet);
const airNeighbors = (droplet: Droplet) =>
  new Set([...neighbors(droplet)].filter(isAir));
const air = difference(
  [...lava]
    .map((ld) => neighbors(ld))
    .reduce(union, new Set()),
  lava,
);

const allSurfaceArea = [...air]
  .flatMap((d) => [...neighbors(d)].filter(isLava))
  .length;

const isAirPocket = (droplet: Droplet, min: number, max: number): boolean => {
  const explored = new Set<Droplet>();
  const depthFirstSearch = (droplet: Droplet): boolean => {
    explored.add(droplet);
    for (const nearbyAir of airNeighbors(droplet)) {
      if (explored.has(nearbyAir)) continue;
      const airPoint = toPoint(nearbyAir);
      if (min > airPoint.x || airPoint.x > max) return true;
      if (min > airPoint.y || airPoint.y > max) return true;
      if (min > airPoint.z || airPoint.z > max) return true;
      const further = depthFirstSearch(nearbyAir);
      if (further) return further; // found exterior, nothing else matters...
    }
    return false;
  };
  return !depthFirstSearch(droplet);
};

const points = [...lava].map((ld) => toPoint(ld));
const xs = points.map((p) => p.x);
const ys = points.map((p) => p.y);
const zs = points.map((p) => p.z);
const minXYZ = Math.min(...xs, ...ys, ...zs);
const maxXYZ = Math.max(...xs, ...ys, ...zs);
const exteriorSurfaceArea = [...air]
  .filter((ad) => !isAirPocket(ad, minXYZ, maxXYZ)) // fill air pockets
  .flatMap((ad) => [...neighbors(ad)].filter(isLava))
  .length;

export const part1 = allSurfaceArea;
// noinspection UnnecessaryLocalVariableJS
export const part2 = exteriorSurfaceArea;
if (import.meta.main) {
  console.log(`Day 18 - Part 1: ${part1}`);
  console.log(`Day 18 - Part 2: ${part2}`);
}
