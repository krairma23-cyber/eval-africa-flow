/**
 * Loads every row of a query in batches, bypassing the 1000-row API cap.
 * `build(from, to)` must return a fresh, ordered query with `.range(from, to)` applied.
 * The row type is inferred from the query, so call sites need no casts.
 */
export async function fetchAllRows<Rows extends readonly unknown[]>(
  build: (from: number, to: number) => PromiseLike<{ data: Rows | null; error: unknown }>,
  batchSize = 1000,
  maxRows = 50000,
): Promise<{ data: Rows; error: unknown }> {
  type Row = Rows extends readonly (infer R)[] ? R : never;
  const all: Row[] = [];

  for (let from = 0; from < maxRows; from += batchSize) {
    const { data, error } = await build(from, from + batchSize - 1);
    if (error) return { data: all as unknown as Rows, error };
    const rows = data ?? [];
    all.push(...(rows as readonly Row[]));
    if (rows.length < batchSize) break;
  }

  return { data: all as unknown as Rows, error: null };
}
