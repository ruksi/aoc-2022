const here = new URL(".", import.meta.url).pathname;
const inputData = await Deno.readTextFile(`${here}_input.dat`);
const shapesData = await Deno.readTextFile(`${here}_shapes.dat`);

enum Direction {
  Left = "<",
  Right = ">",
}

const toMotion: Record<Direction, number[]> = {
  [Direction.Right]: [1, 0],
  [Direction.Left]: [-1, 0],
};

const toRotation = function* <T>(source: T[], count = Infinity): Generator<T> {
  const sourceLength = source.length;
  for (let i = 0; i < count; i++) {
    yield JSON.parse(JSON.stringify(source[i % sourceLength]));
  }
};

const jetCycle = inputData.split("") as Direction[];

const shapeCycle = shapesData.split("\n\n")
  .map((shape) => {
    return shape
      .split("\n")
      .reverse()
      .flatMap((line: string, lineIndex: number) => {
        return line
          .split("")
          .map((char: string, charIndex: number) =>
            char == "#" ? [charIndex + 2, lineIndex] : [] // the +2 makes if 2 units from the left wall
          )
          .filter((indexes) => indexes.length);
      });
  });

const move = (shape: number[][], vector: number[]): number[][] => {
  const offsetX = vector[0];
  const offsetY = vector[1];
  return shape.map((coord) => [coord[0] + offsetX, coord[1] + offsetY]);
};

const getHeight = (rockMap: boolean[][]): number => {
  const ys = Array.from(rockMap.keys());
  return ys.length ? ys[ys.length - 1] + 1 : 0;
};

const wouldCollide = (rockMap: boolean[][], shape: number[][]): boolean => {
  const collision = shape.find((coord) => {
    const x = coord[0];
    if (x <= -1 || x >= 7) return true;
    const y = coord[1];
    if (y <= -1) return true;
    return rockMap[y] && rockMap[y][x];
  });
  return !!collision;
};

const freeze = (rockMap: boolean[][], shape: number[][]) => {
  for (const [x, y] of shape) {
    if (typeof rockMap[y] === "undefined") rockMap[y] = [];
    rockMap[y][x] = true;
  }
};

const findPattern = (
  numbers: number[],
  minPatternLength: number,
): [number[], number[]] => {
  const numbersLen = numbers.length;
  for (const i of [...Array(numbersLen).keys()]) {
    const haystack = numbers.slice(i);
    const haystackLen = haystack.length;
    if (haystackLen * 2 > numbersLen) continue;
    if (haystackLen < minPatternLength) break;

    const needle = numbers.slice(-(2 * haystackLen), -haystackLen);
    const endsWithPattern = haystack.every((n, index) => needle[index] == n);
    if (endsWithPattern) {
      const prefix = numbers.slice(0, -(2 * haystackLen));
      return [prefix, needle];
    }
  }

  return [[], []];
};

const simulateHeightOfRocks = (rockCount: number): number => {
  const rockMap: boolean[][] = [];
  const jetRotation = toRotation(jetCycle);

  let rockIndex = 0;
  let previousHeight = 0;

  const heightDifferences: number[] = [];
  const patternWindowSize = shapeCycle.length;

  for (let shape of toRotation(shapeCycle, rockCount)) {
    const topHeight = getHeight(rockMap);
    const offsetY = topHeight + 3;
    shape = move(shape, [0, offsetY]);

    if (rockIndex && rockIndex % patternWindowSize == 0) {
      heightDifferences.push(topHeight - previousHeight);
      previousHeight = topHeight;
      const [prefix, pattern] = findPattern(heightDifferences, 100);

      if (pattern.length) {
        // if a pattern of sufficient size is found, deduct the total height

        const windowedRockCount = rockCount / patternWindowSize;
        const patternedCount = windowedRockCount - prefix.length;
        const patternMultiplier = Math.floor(patternedCount / pattern.length);
        const leftoverCount = (patternedCount % pattern.length);
        const leftover = pattern.slice(0, leftoverCount);

        const sum = (total: number, n: number) => total + n;
        return (
          prefix.reduce(sum) +
          pattern.reduce(sum) * patternMultiplier +
          leftover.reduce(sum)
        );
      }
    }
    rockIndex++;

    while (true) {
      // we don't use the generator as the loop condition
      // so break won't close the generator
      const jet = jetRotation.next().value as Direction;

      const afterHorizontal = move(shape, toMotion[jet]);
      if (!wouldCollide(rockMap, afterHorizontal)) shape = afterHorizontal;

      const afterVertical = move(shape, [0, -1]);
      if (!wouldCollide(rockMap, afterVertical)) {
        shape = afterVertical;
      } else {
        freeze(rockMap, shape);
        break;
      }
    }
  }

  return getHeight(rockMap);
};

export const part1 = simulateHeightOfRocks(2022);
export const part2 = simulateHeightOfRocks(1000000000000);
if (import.meta.main) {
  console.log(`Day 17 - Part 1: ${part1}`);
  console.log(`Day 17 - Part 2: ${part2}`);
}
