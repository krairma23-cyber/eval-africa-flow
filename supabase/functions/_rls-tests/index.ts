// Placeholder entrypoint. The real work lives in rls_test.ts and is executed
// via `supabase functions test` / Deno test runner.
Deno.serve(() => new Response("RLS test suite — run with deno test", { status: 200 }));
