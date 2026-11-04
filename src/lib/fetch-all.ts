/**
 * Loads every row of a query in batches, bypassing the 1000-row API cap.
 * `build(from, to)` must return a fresh, ordered query with `.range(from, to)` applied.
 */
export async function fetchAllRows<T>(
  build: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: unknown }>,
  batchSize = 1000,
  maxRows = 50000,
): Promise<{ data: T[]; error: unknown }> {
  const all: T[] = [];
  for (let from = 0; from < maxRows; from += batchSize) {
    const { data, error } = await build(from, from + batchSize - 1);
    if (error) return { data: all, error };
    const rows = data ?? [];
    all.push(...rows);
    if (rows.length < batchSize) break;
  }
  return { data: all, error: null };
}
