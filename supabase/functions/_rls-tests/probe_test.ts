// Probe what env vars the test runner exposes.
import { assert } from "https://deno.land/std@0.224.0/assert/mod.ts";

Deno.test("env probe", () => {
  const keys = Object.keys(Deno.env.toObject()).filter((k) =>
    k.startsWith("SUPABASE") || k.startsWith("SB_") || k.includes("KEY") || k.includes("URL")
  );
  console.log("Available env keys:", keys);
  assert(true);
});
