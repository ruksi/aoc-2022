const here = new URL(".", import.meta.url).pathname;
const input = await Deno.readTextFile(`${here}_input.dat`);

type Direction = "U" | "D" | "L" | "R";

interface Motion {
  direction: Direction;
  steps: number;
}

export interface Position {
  x: number;
  y: number;
}

const motions = input
  .split("\n")
  .map((row) => {
    const parts = row.split(" ");
    const motion: Motion = {
      direction: parts[0] as Direction,
      steps: parseInt(parts[1]),
    };
    return motion;
  });

export const follow = (target: Position, follower: Position): Position => {
  if (
    [target.x - 1, target.x, target.x + 1].includes(follower.x) &&
    [target.y - 1, target.y, target.y + 1].includes(follower.y)
  ) {
    return follower;
  }
  if (target.x == follower.x) {
    return {
      x: follower.x,
      y: follower.y + ((target.y - follower.y) > 0 ? 1 : -1),
    };
  }
  if (target.y == follower.y) {
    return {
      x: follower.x + ((target.x - follower.x) > 0 ? 1 : -1),
      y: follower.y,
    };
  }
  return {
    x: follower.x + ((target.x - follower.x) > 0 ? 1 : -1),
    y: follower.y + ((target.y - follower.y) > 0 ? 1 : -1),
  };
};

const directionToMovement: Record<Direction, Position> = {
  "U": { x: 0, y: 1 },
  "D": { x: 0, y: -1 },
  "L": { x: -1, y: 0 },
  "R": { x: 1, y: 0 },
};

const travel = (motions: Motion[], knotCount: number): Position[] => {
  const rope: Position[] = [];
  for (const _knot of [...Array(knotCount)]) {
    rope.push({ x: 0, y: 0 });
  }

  const history: Position[] = [];
  history.push({ ...rope[rope.length - 1] });

  for (const motion of motions) {
    const movement = directionToMovement[motion.direction];
    for (const _index in [...Array(motion.steps)]) {
      rope[0] = { x: rope[0].x + movement.x, y: rope[0].y + movement.y };
      for (let i = 1; i < rope.length; i++) {
        rope[i] = follow(rope[i - 1], rope[i]);
      }
      history.push({ ...rope[rope.length - 1] });
    }
  }

  return history;
};

const gatherUnique = (positions: Position[]): Position[] => {
  const uniques: Position[] = [];
  for (const pos of positions) {
    const notRecodedYet = uniques
      .find((p) => p.x == pos.x && p.y == pos.y) == undefined;
    if (notRecodedYet) uniques.push(pos);
  }
  return uniques;
};

const shortRopeHistory = travel(motions, 2);
const shortRopeUnique = gatherUnique(shortRopeHistory);

const longRopeHistory = travel(motions, 10);
const longRopeUnique = gatherUnique(longRopeHistory);

export const part1 = shortRopeUnique.length;
export const part2 = longRopeUnique.length;
if (import.meta.main) {
  console.log(`Day 09 - Part 1: ${part1}`);
  console.log(`Day 09 - Part 2: ${part2}`);
}
