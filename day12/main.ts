const here = new URL(".", import.meta.url).pathname;
const input = await Deno.readTextFile(`${here}_input.dat`);

type Identity = string;

interface Point {
  x: number;
  y: number;
}

interface Edge {
  source: Identity;
  destination: Identity;
  distance: number;
}

const toIdentity = (point: Point): Identity => {
  return `${point.x},${point.y}`;
};

const toPoint = (identity: Identity): Point => {
  const split = identity.split(",");
  if (split.length < 2) throw Error();
  return { x: parseInt(split[0]), y: parseInt(split[1]) };
};

let defaultStart = "-1,-1";
let end = "-1,-1";
const heightmap = input
  .split("\n")
  .map((row, y) => {
    return row.split("").map((char, x) => {
      if (char == "S") {
        defaultStart = toIdentity({ x, y });
        return "a".charCodeAt(0);
      }
      if (char == "E") {
        end = toIdentity({ x, y });
        return "z".charCodeAt(0);
      }
      return char.charCodeAt(0);
    });
  });

const heightAt = (heightmap: number[][], identity: Identity): number => {
  const point = toPoint(identity);
  const height = heightmap[point.y] ? heightmap[point.y][point.x] : undefined;
  if (height == undefined) throw Error(`no height at (${identity})`);
  return height;
};

const neighborsAt = (heightmap: number[][], identity: Identity): Identity[] => {
  const point = toPoint(identity);
  const potential = [
    { x: point.x, y: point.y - 1 },
    { x: point.x, y: point.y + 1 },
    { x: point.x - 1, y: point.y },
    { x: point.x + 1, y: point.y },
  ];
  return potential.filter((p) =>
    heightmap[p.y] ? heightmap[p.y][p.x] : undefined
  ).map((p) => toIdentity(p));
};

const nodes: Identity[] = [];
const edges: Edge[] = [];
for (const [y, row] of heightmap.entries()) {
  for (const [x, sourceHeight] of row.entries()) {
    const source = toIdentity({ x, y });
    const neighbors = neighborsAt(heightmap, source);
    for (const destination of neighbors) {
      if (sourceHeight + 1 >= heightAt(heightmap, destination)) {
        edges.push({ source: source, destination: destination, distance: 1 });
      }
    }
    nodes.push(source);
  }
}

const getShortestPathTail = (
  distances: Record<Identity, number>,
  identities: Set<Identity>,
) => {
  const min = {
    distance: Infinity,
    identity: "-1,-1",
  };
  for (const identity of identities) {
    if (min.distance >= distances[identity]) {
      min.identity = identity;
      min.distance = distances[identity];
    }
  }
  return min;
};

const getSingleDistanceToEnd = (start: Identity): number => {
  // a simple Dijkstra from https://en.wikipedia.org/wiki/Dijkstra%27s_algorithm#Algorithm
  // checks way too many unrelated paths but good enough to solve this

  const distances: Record<Identity, number> = {};
  const previous: Record<Identity, Identity> = {};
  const unexplored: Set<Identity> = new Set();

  for (const node of nodes) {
    distances[node] = Infinity;
    unexplored.add(node);
  }
  distances[start] = 0;

  while (unexplored.size) {
    const tail = getShortestPathTail(distances, unexplored);
    unexplored.delete(tail.identity);

    for (const neighbor of neighborsAt(heightmap, tail.identity)) {
      if (!unexplored.has(neighbor)) continue;
      const edge = edges.find((e) =>
        e.source == tail.identity &&
        e.destination == neighbor
      );
      if (!edge) continue;
      const alternative = distances[tail.identity] + edge.distance;
      if (alternative < distances[neighbor]) {
        distances[neighbor] = alternative;
        previous[neighbor] = tail.identity;
      }
    }
  }

  return distances[end];
};

const getDistancesToEnd = (starts: Identity[]): Record<Identity, number> => {
  return Object.fromEntries(
    starts.map((n) => [n, getSingleDistanceToEnd(n)]),
  );
};

const lowStartDistances = getDistancesToEnd(
  nodes.filter((n) => heightAt(heightmap, n) == "a".charCodeAt(0)),
);
const shortestLowDistance = Object.entries(lowStartDistances)
  .reduce(
    (min, [_identity, distance]) => distance < min ? distance : min,
    Infinity,
  );

export const part1 = getSingleDistanceToEnd(defaultStart);
// noinspection UnnecessaryLocalVariableJS
export const part2 = shortestLowDistance;
if (import.meta.main) {
  console.log(`Day 12 - Part 1: ${part1}`);
  console.log(`Day 12 - Part 2: ${part2}`);
}
