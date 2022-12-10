import { assertEquals } from "std/testing/asserts.ts";
import { follow, part1, part2 } from "./main.ts";

Deno.test(function closeEnough() {
  const target = { x: 0, y: 0 };

  // on top of
  assertEquals(follow(target, { x: 0, y: 0 }), { x: 0, y: 0 });

  // horizontal
  assertEquals(follow(target, { x: 1, y: 0 }), { x: 1, y: 0 });
  assertEquals(follow(target, { x: -1, y: 0 }), { x: -1, y: 0 });

  // vertical
  assertEquals(follow(target, { x: 0, y: 1 }), { x: 0, y: 1 });
  assertEquals(follow(target, { x: 0, y: -1 }), { x: 0, y: -1 });

  // diagonal
  assertEquals(follow(target, { x: 1, y: 1 }), { x: 1, y: 1 });
  assertEquals(follow(target, { x: 1, y: -1 }), { x: 1, y: -1 });
  assertEquals(follow(target, { x: -1, y: 1 }), { x: -1, y: 1 });
  assertEquals(follow(target, { x: -1, y: -1 }), { x: -1, y: -1 });
});

Deno.test(function follows() {
  const target = { x: 0, y: 0 };

  // horizontal
  assertEquals(follow(target, { x: 2, y: 0 }), { x: 1, y: 0 });
  assertEquals(follow(target, { x: -2, y: 0 }), { x: -1, y: 0 });

  // vertical
  assertEquals(follow(target, { x: 0, y: 2 }), { x: 0, y: 1 });
  assertEquals(follow(target, { x: 0, y: -2 }), { x: 0, y: -1 });

  // diagonal
  assertEquals(follow(target, { x: 2, y: 2 }), { x: 1, y: 1 });
  assertEquals(follow(target, { x: 2, y: -2 }), { x: 1, y: -1 });
  assertEquals(follow(target, { x: -2, y: 2 }), { x: -1, y: 1 });
  assertEquals(follow(target, { x: -2, y: -2 }), { x: -1, y: -1 });
});

Deno.test(function solve() {
  assertEquals(part1, 5619);
  assertEquals(part2, 2376);
});
