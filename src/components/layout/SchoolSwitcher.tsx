import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

/** Shows a school selector only when the user belongs to several schools. */
export function SchoolSwitcher() {
  const [schools, setSchools] = useState<{ id: string; name: string }[]>([]);
  const [active, setActive] = useState<string>("");
  const { toast } = useToast();

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const [{ data: m }, { data: p }] = await Promise.all([
        supabase.from("school_memberships" as any).select("school_id, schools(name)").eq("user_id", user.id),
        supabase.from("profiles").select("school_id").eq("user_id", user.id).maybeSingle(),
      ]);
      setSchools(((m as any[]) ?? []).map((r) => ({ id: r.school_id, name: r.schools?.name ?? "École" })));
      setActive(p?.school_id ?? "");
    })();
  }, []);

  if (schools.length < 2) return null;

  const change = async (id: string) => {
    const { error } = await supabase.rpc("set_active_school" as any, { p_school_id: id });
    if (error) return toast({ title: "Erreur", description: "Impossible de changer d'école", variant: "destructive" });
    window.location.reload();
  };

  return (
    <Select value={active} onValueChange={change}>
      <SelectTrigger className="h-8 w-[160px] sm:w-[200px] text-xs" aria-label="Changer d'école">
        <SelectValue placeholder="École" />
      </SelectTrigger>
      <SelectContent>
        {schools.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
      </SelectContent>
    </Select>
  );
}
