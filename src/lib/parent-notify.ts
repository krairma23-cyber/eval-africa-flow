import { supabase } from "@/integrations/supabase/client";
import { FunctionsHttpError } from "@supabase/supabase-js";

export type ParentNotifyPayload =
  | { action: "report_card"; student_id: string; term_id: string; average: number; rank?: number; total?: number }
  | { action: "absence"; student_id: string; date: string }
  | { action: "fee_reminder"; student_ids: string[] };

export async function notifyParent(body: ParentNotifyPayload): Promise<{ sent: number; skipped?: number; error?: string }> {
  const { data, error } = await supabase.functions.invoke("parent-notify", { body });
  if (error) {
    let msg = error.message;
    if (error instanceof FunctionsHttpError) {
      try { msg = (await error.context.json()).error ?? msg; } catch { /* ignore */ }
    }
    return { sent: 0, error: msg };
  }
  return { sent: data?.sent ?? 0, skipped: data?.skipped };
}
