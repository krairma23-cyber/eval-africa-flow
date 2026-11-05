import { describe, expect, it } from "bun:test";
import { fetchAllRows } from "../src/lib/fetch-all";

/** Fake table: each batch returns the slice of `total` rows it asked for. */
function fakeTable(total: number) {
  const calls: Array<[number, number]> = [];
  const build = (from: number, to: number) => {
    calls.push([from, to]);
    const last = Math.min(to, total - 1);
    const rows = Array.from({ length: Math.max(0, last - from + 1) }, (_, i) => ({ id: from + i }));
    return Promise.resolve({ data: rows, error: null });
  };
  return { build, calls };
}

describe("fetchAllRows", () => {
  it("loads every row when a table holds more than the 1000-row API cap", async () => {
    const { build, calls } = fakeTable(2500);
    const { data, error } = await fetchAllRows(build);

    expect(error).toBeNull();
    expect(data.length).toBe(2500);
    expect(calls).toEqual([
      [0, 999],
      [1000, 1999],
      [2000, 2999],
    ]);
  });

  it("stops as soon as a batch comes back short", async () => {
    const { build, calls } = fakeTable(120);
    const { data } = await fetchAllRows(build);

    expect(data.length).toBe(120);
    expect(calls.length).toBe(1);
  });

  it("reports the error instead of silently returning a truncated list", async () => {
    const { data, error } = await fetchAllRows(() =>
      Promise.resolve({ data: null, error: { message: "boom" } })
    );

    expect(data.length).toBe(0);
    expect(error).toEqual({ message: "boom" });
  });

  it("never asks for more rows than the safety cap", async () => {
    const { build, calls } = fakeTable(100000);
    const { data } = await fetchAllRows(build, 1000, 3000);

    expect(data.length).toBe(3000);
    expect(calls.length).toBe(3);
  });
});
