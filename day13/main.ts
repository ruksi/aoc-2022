const here = new URL(".", import.meta.url).pathname;
const input = await Deno.readTextFile(`${here}_input.dat`);

type Packet = Array<Packet | number>;

interface PacketPair {
  pairIndex: number;
  lefts: Packet;
  rights: Packet;
}

const pairs: PacketPair[] = input
  .split("\n\n")
  .map((pair, index) => {
    const split = pair.split("\n");
    return {
      pairIndex: index + 1, // the packet pairs are one indexed
      lefts: JSON.parse(split[0]),
      rights: JSON.parse(split[1]),
    };
  });

const comparePackets = (lefts: Packet, rights: Packet): boolean | undefined => {
  const leftLen = lefts.length;
  const rightLen = rights.length;
  const minLength = Math.min(leftLen, rightLen);

  for (let i = 0; i < minLength; i++) {
    const l = lefts[i];
    const lType = typeof l;
    const lIsNumber = lType == "number";
    const lIsArray = Array.isArray(l);

    const r = rights[i];
    const rType = typeof r;
    const rIsNumber = rType == "number";
    const rIsArray = Array.isArray(r);

    if (lIsNumber && rIsNumber && l != r) return l < r;
    if (lIsArray && rIsArray) {
      const deep = comparePackets(l, r);
      if (typeof deep != "undefined") return deep;
    }
    if (lIsNumber && rIsArray) {
      const deep = comparePackets([l], r);
      if (typeof deep != "undefined") return deep;
    }
    if (lIsArray && rIsNumber) {
      const deep = comparePackets(l, [r]);
      if (typeof deep != "undefined") return deep;
    }
  }

  if (rightLen > leftLen) return true;
  if (leftLen > rightLen) return false;

  return undefined;
};

const isInRightOrder = (pair: PacketPair): boolean => {
  const result = comparePackets(pair.lefts, pair.rights);
  if (typeof result == "undefined") {
    throw Error("invalid package pair");
  }
  return result;
};

const rightOrderPairs = pairs
  .filter((p) => isInRightOrder(p));
const rightOrderIndexSum = rightOrderPairs
  .reduce((sum, p) => sum + p.pairIndex, 0);

const dividerPackages = [[[2]], [[6]]];
const allPackages = [
  ...pairs.flatMap((pair) => [pair.lefts, pair.rights]),
  ...dividerPackages,
];
allPackages.sort((l, r) => {
  const result = comparePackets(l, r);
  if (typeof result == "undefined") throw Error();
  return result ? -1 : 1;
});

const decoderKey = dividerPackages
  .map((dividerPackage) => allPackages.indexOf(dividerPackage) + 1) // one-indexed
  .reduce((product, packageIndex) => product * packageIndex, 1);

export const part1 = rightOrderIndexSum;
// noinspection UnnecessaryLocalVariableJS
export const part2 = decoderKey;
if (import.meta.main) {
  console.log(`Day 13 - Part 1: ${part1}`);
  console.log(`Day 13 - Part 2: ${part2}`);
}
