const here = new URL(".", import.meta.url).pathname;
const input = await Deno.readTextFile(`${here}_input.dat`);

type Atom = {
  value: number;
  source: number;
};

const encrypted: Atom[] = input
  .split("\n")
  .map((row, index) => ({ value: Number(row), source: index }));

const findBySource = (atoms: Atom[], index: number): Atom => {
  const result = atoms.find((a) => a.source == index);
  if (!result) throw Error(`atom not found with source index ${index}`);
  return result;
};

const move = (atoms: Atom[], atom: Atom, newIndex: number) => {
  const oldIndex = atoms.findIndex((a) => a.source === atom.source);
  atoms.splice(oldIndex, 1);
  atoms.splice(newIndex, 0, atom);
};

const decrypt = (
  atoms: Atom[],
  decryptionKey: number,
  loops: number,
): { x: number; y: number; z: number } => {
  const decrypted = JSON.parse(JSON.stringify(atoms)) as Atom[];
  for (const a of decrypted) a.value *= decryptionKey;
  const lastIndex = decrypted.length - 1;

  for (const _loop of [...Array(loops).keys()]) {
    for (const index of [...Array(decrypted.length).keys()]) {
      const atom = findBySource(decrypted, index); // iterate according to the source index...
      const shift = atom.value % lastIndex;
      let newIndex = decrypted.findIndex((a) => a.source === atom.source);
      newIndex += shift;
      newIndex = newIndex % lastIndex;
      move(decrypted, atom, newIndex);
    }
  }

  const zeroIndex = decrypted.findIndex((a) => a.value == 0);
  const allBeforeZero = decrypted.splice(0, zeroIndex);
  const result = [...decrypted, ...allBeforeZero];
  return {
    x: result[1000 % result.length].value,
    y: result[2000 % result.length].value,
    z: result[3000 % result.length].value,
  };
};

const simpleCoordinates = decrypt(encrypted, 1, 1);
const complexCoordinates = decrypt(encrypted, 811589153, 10);

export const part1 = (
  simpleCoordinates.x +
  simpleCoordinates.y +
  simpleCoordinates.z
);
export const part2 = (
  complexCoordinates.x +
  complexCoordinates.y +
  complexCoordinates.z
);

if (import.meta.main) {
  console.log(`Day 20 - Part 1: ${part1}`);
  console.log(`Day 20 - Part 2: ${part2}`);
}
