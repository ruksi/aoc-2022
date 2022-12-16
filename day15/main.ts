const here = new URL(".", import.meta.url).pathname;
const input = await Deno.readTextFile(`${here}_input.dat`);

interface Point {
  x: number;
  y: number;
}

interface Reading {
  sensor: Point;
  beacon: Point;
}

const toSensor = (row: string) => {
  const hits = row.match(
    /Sensor at x=(-?\d+), y=(-?\d+): closest beacon is at x=(-?\d+), y=(-?\d+)/,
  );
  if (!hits || hits.length != 5) {
    throw Error(`invalid row: ${row}`);
  }
  const sX = parseInt(hits[1]);
  const sY = parseInt(hits[2]);
  const bX = parseInt(hits[3]);
  const bY = parseInt(hits[4]);
  const reading: Reading = {
    sensor: { x: sX, y: sY },
    beacon: { x: bX, y: bY },
  };
  return reading;
};

const readings = input
  .split("\n")
  .map(toSensor);

const integerDistance = (a: number, b: number): number => {
  return Math.abs(a - b);
};

const pointDistance = (a: Point, b: Point): number => {
  return integerDistance(a.x, b.x) + integerDistance(a.y, b.y);
};

const integersBetween = (a: number, b: number): number[] => {
  const start = a > b ? b : a;
  const end = start == a ? b : a;
  const count = end - start + 1; // 1 as includes the tailing integer
  const integers = [...Array(count).keys()].map((i) => i + start);
  if (end == a) integers.reverse();
  return integers;
};

const pointsBetween = (a: Point, b: Point): Point[] => {
  if (a.x == b.x) {
    return integersBetween(a.y, b.y).map((y) => ({ x: a.x, y }));
  } else if (a.y == b.y) {
    return integersBetween(a.x, b.x).map((x) => ({ x, y: a.y }));
  }
  throw Error(`points don't share an axis`);
};

const coverage = (
  reading: Reading,
  targetY: number,
): Point[] => {
  const dist = pointDistance(reading.sensor, reading.beacon);

  // here we have plenty of early opt-outs to make
  // large sensor coverage areas manageable

  const apex = { x: reading.sensor.x, y: reading.sensor.y - dist };
  if (apex.y > targetY) return [];

  const nadir = { x: reading.sensor.x, y: reading.sensor.y + dist };
  if (nadir.y < targetY) return [];

  const bucket = [];
  for (let i = 0; i < dist; i++) {
    const topY = apex.y + i;
    if (topY == targetY) {
      const topScan = pointsBetween(
        { x: apex.x - i, y: topY },
        { x: apex.x + i, y: topY },
      );
      bucket.push(topScan);
    }
    const bottomY = nadir.y - i;
    if (bottomY == targetY) {
      const bottomScan = pointsBetween(
        { x: nadir.x - i, y: bottomY },
        { x: nadir.x + i, y: bottomY },
      );
      bucket.push(bottomScan);
    }
  }

  if (reading.sensor.y == targetY) {
    const centerScan = pointsBetween(
      { x: reading.sensor.x - dist, y: reading.sensor.y },
      { x: reading.sensor.x + dist, y: reading.sensor.y },
    );
    bucket.push(centerScan);
  }

  return bucket.flatMap((points) => points);
};

const countReadingAreaWithoutBeacons = (targetY: number): number => {
  const points = readings.flatMap((r) => coverage(r, targetY));

  const beacons = readings
    .filter((r) => r.beacon.y == targetY)
    .map((r) => r.beacon);

  // we are focusing on a single row so Y
  // filtering are done above
  const row: Record<number, boolean> = {};
  for (const point of points) row[point.x] = true;
  for (const point of beacons) delete row[point.x];

  return Object.keys(row).length;
};

// the example given is 14 readings while
// the actual input has more readings;
// both use different target Y
const target = readings.length > 15 ? 2000000 : 10;

export const part1 = countReadingAreaWithoutBeacons(target);

// OK, that didn't go into the direction I was hoping during part 1;
// oh well, do it in a more efficient different way relying that
// the readings are quite sparse

const infinite = function* (): Generator<number> {
  for (let num = 0; true; num++) {
    yield num;
  }
};

const findDistressBeacon = (axisMax: number): Point => {
  for (const y of infinite()) {
    if (y > axisMax) {
      throw Error("could not find the distress beacon");
    }

    let x = 0;
    while (x <= axisMax) {
      const reading = readings
        .find((r) =>
          pointDistance(r.sensor, r.beacon) >=
            pointDistance({ x, y }, r.sensor)
        );

      if (!reading) {
        // something out of the range of all sensors...
        // must be the distress beacon
        return { x, y };
      }

      const sensorRange = pointDistance(reading.sensor, reading.beacon);
      const toSensor = pointDistance({ x, y }, reading.sensor);

      x += sensorRange - toSensor + 1;
    }
  }
  throw Error("broken code...");
};

const distress = findDistressBeacon(target * 2);
export const part2 = distress.x * 4000000 + distress.y;
if (import.meta.main) {
  console.log(`Day 15 - Part 1: ${part1}`); // 26
  console.log(`Day 15 - Part 2: ${part2}`); // 56000011
}
