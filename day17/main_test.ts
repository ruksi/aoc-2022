import { assertEquals } from "std/testing/asserts.ts";
import { part1, part2 } from "./main.ts";

Deno.test(function solve() {
  assertEquals(part1, 3235);
  assertEquals(part2, 1591860465110);
});
