import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { logError } from "@/lib/logger";
import { Download, Upload, AlertTriangle, CheckCircle2, FileSpreadsheet } from "lucide-react";
interface ImportStudentsDialogProps {
  onImported: () => void;
  children: React.ReactNode;
}

interface ParsedRow {
  student_number: string;
  first_name: string;
  last_name: string;
  date_of_birth?: string;
  gender?: string;
  parent_name?: string;
  parent_phone?: string;
  parent_email?: string;
  address?: string;
  class_name?: string;
  _row: number;
}

function validateRow(r: Record<string, string>): string | null {
  if (!r.student_number) return "student_number requis";
  if (r.student_number.length > 50) return "student_number trop long";
  if (!r.first_name) return "first_name requis";
  if (!r.last_name) return "last_name requis";
  if (r.parent_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(r.parent_email)) return "parent_email invalide";
  return null;
}

const HEADERS = [
  "student_number",
  "first_name",
  "last_name",
  "date_of_birth",
  "gender",
  "parent_name",
  "parent_phone",
  "parent_email",
  "address",
  "class_name",
];

export function ImportStudentsDialog({ onImported, children }: ImportStudentsDialogProps) {
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{ created: number; skipped: number; errors: string[] } | null>(null);
  const [schoolId, setSchoolId] = useState<string | null>(null);
  const [academicYearId, setAcademicYearId] = useState<string | null>(null);
  const [classMap, setClassMap] = useState<Record<string, string>>({});
  const [planInfo, setPlanInfo] = useState<{ current: number; max: number } | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!open) return;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: profile } = await (supabase.from("profiles") as any).select("school_id").eq("user_id", user.id).maybeSingle();
      if (!profile?.school_id) return;
      setSchoolId(profile.school_id);

      const { data: classes } = await (supabase.from("classrooms") as any).select("id,name").eq("school_id", profile.school_id);
      const map: Record<string, string> = {};
      (classes || []).forEach((c: any) => { map[String(c.name).trim().toLowerCase()] = c.id; });
      setClassMap(map);

      const { data: year } = await (supabase.from("academic_years") as any)
        .select("id")
        .eq("school_id", profile.school_id)
        .eq("is_current", true)
        .maybeSingle();
      setAcademicYearId(year?.id || null);

      const { data: features } = await (supabase.from("user_plan_features") as any).select("max_students").eq("user_id", user.id).maybeSingle();
      const { count } = await supabase.from("students").select("*", { count: "exact", head: true }).eq("school_id", profile.school_id);
      setPlanInfo({ current: count || 0, max: features?.max_students || 50 });
    })();
  }, [open]);

  const downloadTemplate = () => {
    const example = [{
      student_number: "EL260001",
      first_name: "Awa",
      last_name: "Diallo",
      date_of_birth: "2010-05-14",
      gender: "F",
      parent_name: "Mariam Diallo",
      parent_phone: "+225 07 00 00 00 00",
      parent_email: "parent@example.com",
      address: "Abidjan, Cocody",
      class_name: "6ème A",
    }];
    const ws = XLSX.utils.json_to_sheet(example, { header: HEADERS });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Élèves");
    XLSX.writeFile(wb, "modele-import-eleves.xlsx");
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setResult(null);
    setParseErrors([]);
    try {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: "array" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const json: any[] = XLSX.utils.sheet_to_json(ws, { defval: "", raw: false });

      const errors: string[] = [];
      const parsed: ParsedRow[] = [];
      json.forEach((r, idx) => {
        const rowNum = idx + 2;
        const normalized: any = {};
        HEADERS.forEach((h) => { normalized[h] = String(r[h] ?? "").trim(); });
        const check = rowSchema.safeParse(normalized);
        if (!check.success) {
          errors.push(`Ligne ${rowNum}: ${check.error.issues[0].message} (${check.error.issues[0].path.join(".")})`);
          return;
        }
        parsed.push({ ...normalized, _row: rowNum });
      });
      setRows(parsed);
      setParseErrors(errors);
    } catch (err) {
      toast({ title: "Erreur", description: "Impossible de lire le fichier Excel", variant: "destructive" });
    }
  };

  const runImport = async () => {
    if (!schoolId || rows.length === 0) return;
    if (planInfo && planInfo.current + rows.length > planInfo.max) {
      toast({
        title: "Quota dépassé",
        description: `Votre plan autorise ${planInfo.max} élèves. Vous en avez ${planInfo.current} et tentez d'en importer ${rows.length}.`,
        variant: "destructive",
      });
      return;
    }

    setImporting(true);
    setProgress(0);
    const errors: string[] = [];
    let created = 0;
    let skipped = 0;

    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      try {
        const { data: existing } = await supabase
          .from("students")
          .select("id")
          .eq("school_id", schoolId)
          .eq("student_number", r.student_number)
          .maybeSingle();
        if (existing) { skipped++; continue; }

        const { data: inserted, error } = await supabase.from("students").insert({
          school_id: schoolId,
          student_number: r.student_number,
          first_name: r.first_name,
          last_name: r.last_name,
          date_of_birth: r.date_of_birth || null,
          gender: r.gender || null,
          parent_name: r.parent_name || null,
          parent_phone: r.parent_phone || null,
          parent_email: r.parent_email || null,
          address: r.address || null,
        }).select("id").single();

        if (error) throw error;

        if (r.class_name && inserted) {
          const classId = classMap[r.class_name.trim().toLowerCase()];
          if (classId) {
            await supabase.from("enrollments").insert({
              student_id: inserted.id,
              classroom_id: classId,
              school_id: schoolId,
              status: "active",
            });
          } else {
            errors.push(`Ligne ${r._row}: classe "${r.class_name}" introuvable — élève créé sans inscription`);
          }
        }
        created++;
      } catch (err: any) {
        errors.push(`Ligne ${r._row}: ${err.message || "erreur inconnue"}`);
        await logError("Bulk import row failed", err, { component: "ImportStudentsDialog", row: r._row });
      }
      setProgress(Math.round(((i + 1) / rows.length) * 100));
    }

    setResult({ created, skipped, errors });
    setImporting(false);
    if (created > 0) {
      toast({ title: "Import terminé", description: `${created} élève(s) créé(s), ${skipped} ignoré(s), ${errors.length} erreur(s).` });
      onImported();
    }
  };

  const reset = () => {
    setRows([]);
    setParseErrors([]);
    setResult(null);
    setProgress(0);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) reset(); }}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" /> Importer des élèves (Excel)
          </DialogTitle>
          <DialogDescription>
            Téléchargez le modèle, remplissez-le, puis importez le fichier. Les doublons de matricule sont ignorés.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <Button type="button" variant="outline" onClick={downloadTemplate} className="w-full sm:w-auto">
              <Download className="h-4 w-4 mr-2" /> Télécharger le modèle Excel
            </Button>
            {planInfo && (
              <div className="text-sm text-muted-foreground self-center">
                Plan: {planInfo.current}/{planInfo.max} élèves
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="file">Fichier Excel (.xlsx)</Label>
            <Input id="file" type="file" accept=".xlsx,.xls" onChange={handleFile} disabled={importing} />
            <p className="text-xs text-muted-foreground mt-1">
              Colonnes requises : student_number, first_name, last_name. Optionnelles : date_of_birth (YYYY-MM-DD), gender (M/F), parent_name, parent_phone, parent_email, address, class_name.
            </p>
          </div>

          {parseErrors.length > 0 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>{parseErrors.length} ligne(s) invalide(s)</AlertTitle>
              <AlertDescription>
                <ul className="text-xs max-h-32 overflow-y-auto list-disc pl-4">
                  {parseErrors.slice(0, 20).map((e, i) => <li key={i}>{e}</li>)}
                  {parseErrors.length > 20 && <li>… et {parseErrors.length - 20} autres</li>}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {rows.length > 0 && !result && (
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertTitle>{rows.length} élève(s) prêt(s) à importer</AlertTitle>
              <AlertDescription>Cliquez sur "Lancer l'import" pour créer les élèves.</AlertDescription>
            </Alert>
          )}

          {importing && <Progress value={progress} />}

          {result && (
            <Alert variant={result.errors.length ? "destructive" : "default"}>
              <AlertTitle>Résultat</AlertTitle>
              <AlertDescription className="space-y-1">
                <p>✅ Créés : <strong>{result.created}</strong></p>
                <p>⏭️ Ignorés (doublons) : <strong>{result.skipped}</strong></p>
                <p>❌ Erreurs : <strong>{result.errors.length}</strong></p>
                {result.errors.length > 0 && (
                  <ul className="text-xs max-h-32 overflow-y-auto list-disc pl-4 mt-2">
                    {result.errors.slice(0, 20).map((e, i) => <li key={i}>{e}</li>)}
                    {result.errors.length > 20 && <li>… et {result.errors.length - 20} autres</li>}
                  </ul>
                )}
              </AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)} disabled={importing}>Fermer</Button>
            <Button onClick={runImport} disabled={importing || rows.length === 0 || !!result}>
              <Upload className="h-4 w-4 mr-2" />
              {importing ? "Import…" : "Lancer l'import"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
