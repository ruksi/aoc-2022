const here = new URL(".", import.meta.url).pathname;
const input = await Deno.readTextFile(`${here}_input.dat`);

interface Point {
  x: number;
  y: number;
}

class Grid {
  _grid: number[][] = [];
  _points: Point[] = [];
  _minX = 0;
  _maxX = 9999;
  _minY = 0;
  _maxY = 9999;

  constructor(grid: number[][]) {
    this._grid = grid;
    this._minY = 0;
    this._maxY = this._grid.length - 1;
    this._minX = 0;
    this._maxX = this._grid[0].length - 1;
    for (const y of this._grid.keys()) {
      for (const x of this._grid[0].keys()) {
        this._points.push({ x, y });
      }
    }
  }

  points(): Point[] {
    return this._points; // should return a copy but we don't modify these
  }

  heightAt(point: Point): number {
    return this._grid[point.y][point.x];
  }

  visibilityAt(point: Point): boolean {
    if ([this._minY, this._maxY].includes(point.y)) {
      return true;
    }
    if ([this._minX, this._maxX].includes(point.x)) {
      return true;
    }
    const height = this.heightAt(point);
    const linesOfSight = [
      this.northFrom(point),
      this.southFrom(point),
      this.westFrom(point),
      this.eastFrom(point),
    ];
    for (const los of linesOfSight) {
      const firstTallerTreeHeight = Array.from(los)
        .map((p) => this.heightAt(p))
        .find((h) => h >= height);
      const canBeSeen = firstTallerTreeHeight == undefined;
      if (canBeSeen) {
        return true;
      }
    }
    return false;
  }

  scenicScoreAt(point: Point): number {
    const height = this.heightAt(point);
    const directions = [
      { score: 0, lineOfSight: this.northFrom(point) },
      { score: 0, lineOfSight: this.southFrom(point) },
      { score: 0, lineOfSight: this.westFrom(point) },
      { score: 0, lineOfSight: this.eastFrom(point) },
    ];

    for (const direction of directions) {
      for (const p of direction.lineOfSight) {
        direction.score += 1;
        if (this.heightAt(p) >= height) break;
      }
    }
    return directions.reduce((product, dir) => product * dir.score, 1);
  }

  *northFrom(point: Point): Generator<Point> {
    for (let y = point.y - 1; y >= this._minY; y--) yield { x: point.x, y };
  }

  *southFrom(point: Point): Generator<Point> {
    for (let y = point.y + 1; y <= this._maxY; y++) yield { x: point.x, y };
  }

  *westFrom(point: Point): Generator<Point> {
    for (let x = point.x - 1; x >= this._minX; x--) yield { x, y: point.y };
  }

  *eastFrom(point: Point): Generator<Point> {
    for (let x = point.x + 1; x <= this._maxX; x++) yield { x, y: point.y };
  }
}

const grid = new Grid(
  input.split("\n").map((row) => row.split("").map((cell) => parseInt(cell))),
);

const visiblePoints = grid.points()
  .filter((p) => grid.visibilityAt(p));

const bestScenicScore = grid.points()
  .reduce((best, point) => {
    const current = grid.scenicScoreAt(point);
    return current > best ? current : best;
  }, 0);

export const part1 = visiblePoints.length;
export const part2 = bestScenicScore;
if (import.meta.main) {
  console.log(`Day 07 - Part 1: ${part1}`);
  console.log(`Day 07 - Part 2: ${part2}`);
}
