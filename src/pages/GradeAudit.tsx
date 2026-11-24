import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ChevronLeft, ChevronRight, RefreshCw, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { gradeAuditFlags } from "@/lib/grade-security";

const eventNames: Record<string, string> = { baseline: "Note préexistante", initial: "Saisie initiale", correction: "Correction", period_closed: "Clôture" };
const pageSize = 25;
const scoreLabel = (score: number | null, absent: boolean | null) => absent ? "Absent" : score === null ? "—" : String(score);

export default function GradeAudit() {
  const [entries, setEntries] = useState<Tables<"grade_audit_log">[]>([]);
  const [terms, setTerms] = useState<{ id: string; name: string }[]>([]);
  const [term, setTerm] = useState("all");
  const [event, setEvent] = useState("all");
  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [flagged, setFlagged] = useState(false);
  const [page, setPage] = useState(0);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    let active = true;
    supabase.from("terms").select("id, name").order("end_date", { ascending: false }).then(({ data }) => { if (active) setTerms(data || []); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true); setError("");
      let query = supabase.from("grade_audit_log").select("*", { count: "exact" }).order("created_at", { ascending: false }).order("id");
      if (term !== "all") query = query.eq("term_id", term);
      if (event !== "all") query = query.eq("event_type", event);
      if (flagged) query = query.neq("flags", "{}");
      if (fromDate) query = query.gte("created_at", `${fromDate}T00:00:00Z`);
      if (toDate) query = query.lte("created_at", `${toDate}T23:59:59.999999Z`);
      const needle = search.trim().replace(/[,%().\\_]/g, "");
      if (needle) query = query.or(`student_name.ilike.%${needle}%,actor_name.ilike.%${needle}%,assessment_title.ilike.%${needle}%,reason.ilike.%${needle}%`);
      const result = await query.range(page * pageSize, (page + 1) * pageSize - 1);
      if (!active) return;
      if (result.error) { setError("Impossible de charger le journal."); setEntries([]); setCount(0); }
      else { setEntries(result.data || []); setCount(result.count || 0); }
      setLoading(false);
    };
    const timer = setTimeout(load, 200);
    return () => { active = false; clearTimeout(timer); };
  }, [term, event, search, fromDate, toDate, flagged, page, refresh]);

  const pages = Math.max(1, Math.ceil(count / pageSize));
  return <div className="space-y-6">
    <Button asChild variant="ghost"><Link to="/dashboard/assessments"><ArrowLeft className="mr-2 h-4 w-4" />Retour aux évaluations</Link></Button>
    <header className="flex flex-wrap items-center justify-between gap-3">
      <div><h1 className="text-2xl font-bold flex items-center gap-2"><ShieldCheck className="h-6 w-6 text-primary" />Journal des notes</h1><p className="text-sm text-muted-foreground">Historique de l’école · Horaires UTC</p></div>
      <Button variant="outline" disabled={loading} onClick={() => setRefresh(value => value + 1)}><RefreshCw className="mr-2 h-4 w-4" />Actualiser</Button>
    </header>
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
      <div className="space-y-1"><Label htmlFor="audit-search">Élève, auteur ou motif</Label><Input id="audit-search" value={search} onChange={e => { setSearch(e.target.value); setPage(0); }} /></div>
      <div className="space-y-1"><Label>Période</Label><Select value={term} onValueChange={value => { setTerm(value); setPage(0); }}><SelectTrigger aria-label="Période"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Toutes les périodes</SelectItem>{terms.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent></Select></div>
      <div className="space-y-1"><Label>Événement</Label><Select value={event} onValueChange={value => { setEvent(value); setPage(0); }}><SelectTrigger aria-label="Événement"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Tous les événements</SelectItem>{Object.entries(eventNames).map(([key, label]) => <SelectItem key={key} value={key}>{label}</SelectItem>)}</SelectContent></Select></div>
      <div className="space-y-1"><Label htmlFor="audit-from">Du (UTC)</Label><Input id="audit-from" type="date" value={fromDate} max={toDate || undefined} onChange={e => { setFromDate(e.target.value); setPage(0); }} /></div>
      <div className="space-y-1"><Label htmlFor="audit-to">Au (UTC)</Label><Input id="audit-to" type="date" value={toDate} min={fromDate || undefined} onChange={e => { setToDate(e.target.value); setPage(0); }} /></div>
    </div>
    <div className="flex flex-wrap justify-between gap-3"><div className="flex items-center gap-2"><Checkbox id="audit-flagged" checked={flagged} onCheckedChange={value => { setFlagged(value === true); setPage(0); }} /><Label htmlFor="audit-flagged">Changements à examiner uniquement</Label></div><span className="text-sm text-muted-foreground">{count} événement(s)</span></div>
    {error ? <p role="alert" className="text-destructive">{error}</p> : <div className="overflow-x-auto rounded border border-border">
      <Table><TableHeader><TableRow><TableHead>Date / auteur</TableHead><TableHead>Élève / évaluation</TableHead><TableHead>Avant</TableHead><TableHead>Après</TableHead><TableHead className="min-w-56">Motif / vigilance</TableHead></TableRow></TableHeader><TableBody>
        {loading ? <TableRow><TableCell colSpan={5} className="text-center h-24">Chargement…</TableCell></TableRow> : entries.length === 0 ? <TableRow><TableCell colSpan={5} className="text-center h-24">Aucun événement pour ces filtres.</TableCell></TableRow> : entries.map(entry => <TableRow key={entry.id}>
          <TableCell className="align-top min-w-44"><time dateTime={entry.created_at}>{new Date(entry.created_at).toLocaleString("fr-FR", { timeZone: "UTC" })}</time><p className="font-medium mt-1">{entry.actor_name}</p>{entry.actor_id && <p className="text-xs text-muted-foreground break-all max-w-48" title="Identifiant de l’auteur">{entry.actor_id}</p>}<Badge variant="outline" className="mt-2">{eventNames[entry.event_type] || entry.event_type}</Badge></TableCell>
          <TableCell className="align-top min-w-40"><p className="font-medium">{entry.student_name || "—"}</p><p>{entry.assessment_title || "—"}</p><p className="text-muted-foreground text-xs">{entry.term_name}</p></TableCell>
          <TableCell className="align-top"><span className="font-semibold">{scoreLabel(entry.old_score, entry.old_absent)}</span><p className="text-xs text-muted-foreground whitespace-pre-wrap break-words max-w-52">{entry.old_comment}</p></TableCell>
          <TableCell className="align-top"><span className="font-semibold">{scoreLabel(entry.new_score, entry.new_absent)}</span>{entry.max_score !== null && <span className="text-xs text-muted-foreground"> / {entry.max_score}</span>}<p className="text-xs text-muted-foreground whitespace-pre-wrap break-words max-w-52">{entry.new_comment}</p></TableCell>
          <TableCell className="align-top"><p className="whitespace-pre-wrap break-words max-w-96">{entry.reason}</p><div className="flex flex-wrap gap-1 mt-2">{entry.flags.map(flag => <Badge key={flag} variant="secondary">{gradeAuditFlags[flag] || flag}</Badge>)}</div></TableCell>
        </TableRow>)}
      </TableBody></Table>
    </div>}
    <footer className="flex items-center justify-between"><span className="text-sm text-muted-foreground">Page {page + 1} sur {pages}</span><div className="flex gap-2"><Button variant="outline" size="icon" aria-label="Page précédente" disabled={loading || page === 0} onClick={() => setPage(value => value - 1)}><ChevronLeft className="h-4 w-4" /></Button><Button variant="outline" size="icon" aria-label="Page suivante" disabled={loading || page + 1 >= pages} onClick={() => setPage(value => value + 1)}><ChevronRight className="h-4 w-4" /></Button></div></footer>
  </div>;
}