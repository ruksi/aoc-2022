const here = new URL(".", import.meta.url).pathname;
const input = await Deno.readTextFile(`${here}_input.dat`);

interface Marker {
  content: string;
  location: number;
}

const windows = function* <T>(
  arr: T[] | string,
  size: number,
): Generator<Marker> {
  for (let index = 0; index + size <= arr.length; index++) {
    yield {
      content: arr.slice(index, index + size) as string,
      location: index + size,
    };
  }
};

const getMarker = (stream: string, length: number): Marker | undefined => {
  let marker;
  outerLoop:
  for (const window of windows(stream, length)) {
    for (const char of window.content.split("")) {
      const hasDuplicates = (
        window.content.indexOf(char) != window.content.lastIndexOf(char)
      );
      if (hasDuplicates) continue outerLoop;
    }
    marker = window;
    break;
  }
  return marker;
};

const shortMarker = getMarker(input, 4);
const longMarker = getMarker(input, 14);

export const part1 = shortMarker?.location;
export const part2 = longMarker?.location;

if (import.meta.main) {
  console.log(`Day 06 - Part 1: ${part1}`); // => 1582
  console.log(`Day 06 - Part 2: ${part2}`); // => 3588
}
