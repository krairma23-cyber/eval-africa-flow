import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useRole } from "@/hooks/useRole";
import { logError } from "@/lib/logger";
import { DeleteConfirmButton } from "@/components/shared/DeleteConfirmButton";
import {
  AccountingEntryDialog,
  PAYMENT_METHODS,
  type AccountingCategory,
  type AccountingEntry,
} from "@/components/forms/AccountingEntryDialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Plus, Search, Download, TrendingUp, TrendingDown, Wallet, Receipt, Pencil, Sparkles, RefreshCw,
} from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from "recharts";

const formatCFA = (n: number) => new Intl.NumberFormat("fr-FR").format(Math.round(n)) + " FCFA";
const methodLabel = (v: string | null) => PAYMENT_METHODS.find((m) => m.value === v)?.label ?? "—";

export default function Accounting() {
  const { toast } = useToast();
  const { isAdmin } = useRole();
  const [loading, setLoading] = useState(true);
  const [schoolId, setSchoolId] = useState<string | null>(null);
  const [categories, setCategories] = useState<AccountingCategory[]>([]);
  const [entries, setEntries] = useState<AccountingEntry[]>([]);
  const [search, setSearch] = useState("");
  const [kindFilter, setKindFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [period, setPeriod] = useState<string>("year");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<AccountingEntry | null>(null);

  const today = new Date();
  const [importOpen, setImportOpen] = useState(false);
  const [importStart, setImportStart] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1).toISOString().slice(0, 10)
  );
  const [importEnd, setImportEnd] = useState(today.toISOString().slice(0, 10));
  const [importPreview, setImportPreview] = useState<{ count: number; amount: number } | null>(null);
  const [importing, setImporting] = useState(false);

  const runImport = async (dryRun: boolean) => {
    setImporting(true);
    try {
      const { data, error } = await supabase.rpc("import_tuition_payments", {
        p_start: importStart,
        p_end: importEnd,
        p_dry_run: dryRun,
      });
      if (error) {
        toast({ title: "Erreur", description: error.message, variant: "destructive" });
        return;
      }
      const row = Array.isArray(data) ? data[0] : data;
      const count = Number(row?.imported_count ?? 0);
      const amount = Number(row?.imported_amount ?? 0);
      if (dryRun) {
        setImportPreview({ count, amount });
      } else {
        toast({
          title: "Import terminé",
          description: count === 0
            ? "Aucun nouveau paiement à importer sur cette période."
            : `${count} paiement(s) importé(s) pour ${formatCFA(amount)}.`,
        });
        setImportOpen(false);
        setImportPreview(null);
        loadAll();
      }
    } finally {
      setImporting(false);
    }
  };

  const openImport = () => {
    setImportPreview(null);
    setImportOpen(true);
  };

  const loadAll = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("school_id")
          .eq("id", user.id)
          .maybeSingle();
        setSchoolId(profile?.school_id ?? null);
      }

      const [{ data: cats, error: catErr }, { data: ents, error: entErr }] = await Promise.all([
        supabase.from("accounting_categories").select("id,name,kind,color,code").order("name"),
        supabase
          .from("accounting_entries")
          .select("id,entry_date,label,kind,amount,payment_method,reference,notes,category_id")
          .order("entry_date", { ascending: false }),
      ]);

      if (catErr || entErr) {
        await logError("Failed to load accounting data", catErr || entErr, { component: "Accounting" });
        toast({ title: "Erreur", description: "Impossible de charger la comptabilité", variant: "destructive" });
      }

      setCategories((cats ?? []) as AccountingCategory[]);
      setEntries(((ents ?? []) as unknown as AccountingEntry[]).map((e) => ({ ...e, amount: Number(e.amount) })));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAll(); }, []);

  const seedCategories = async () => {
    const { error } = await supabase.rpc("seed_accounting_categories");
    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Succès", description: "Catégories par défaut créées" });
    loadAll();
  };

  const periodStart = useMemo(() => {
    const now = new Date();
    if (period === "month") return new Date(now.getFullYear(), now.getMonth(), 1);
    if (period === "quarter") return new Date(now.getFullYear(), now.getMonth() - 2, 1);
    if (period === "year") return new Date(now.getFullYear(), 0, 1);
    return null;
  }, [period]);

  const filtered = useMemo(() => {
    return entries.filter((e) => {
      if (periodStart && new Date(e.entry_date) < periodStart) return false;
      if (kindFilter !== "all" && e.kind !== kindFilter) return false;
      if (categoryFilter !== "all" && e.category_id !== categoryFilter) return false;
      if (search && !`${e.label} ${e.reference ?? ""}`.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [entries, periodStart, kindFilter, categoryFilter, search]);

  const totals = useMemo(() => {
    const income = filtered.filter((e) => e.kind === "income").reduce((s, e) => s + e.amount, 0);
    const expense = filtered.filter((e) => e.kind === "expense").reduce((s, e) => s + e.amount, 0);
    return { income, expense, balance: income - expense, count: filtered.length };
  }, [filtered]);

  const monthly = useMemo(() => {
    const map = new Map<string, { month: string; recettes: number; depenses: number }>();
    filtered.forEach((e) => {
      const key = e.entry_date.slice(0, 7);
      const row = map.get(key) ?? { month: key, recettes: 0, depenses: 0 };
      if (e.kind === "income") row.recettes += e.amount; else row.depenses += e.amount;
      map.set(key, row);
    });
    return Array.from(map.values()).sort((a, b) => a.month.localeCompare(b.month));
  }, [filtered]);

  const byCategory = useMemo(() => {
    return categories
      .map((c) => {
        const total = filtered.filter((e) => e.category_id === c.id).reduce((s, e) => s + e.amount, 0);
        return { ...c, total };
      })
      .filter((c) => c.total > 0)
      .sort((a, b) => b.total - a.total);
  }, [categories, filtered]);

  const exportCsv = () => {
    const header = ["Date", "Libellé", "Type", "Catégorie", "Montant", "Règlement", "Référence", "Notes"];
    const rows = filtered.map((e) => [
      e.entry_date,
      e.label,
      e.kind === "income" ? "Recette" : "Dépense",
      categories.find((c) => c.id === e.category_id)?.name ?? "",
      String(e.amount),
      methodLabel(e.payment_method),
      e.reference ?? "",
      (e.notes ?? "").replace(/\n/g, " "),
    ]);
    const csv = [header, ...rows]
      .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(";"))
      .join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `grand-livre-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const openNew = () => { setEditing(null); setDialogOpen(true); };
  const openEdit = (e: AccountingEntry) => { setEditing(e); setDialogOpen(true); };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Comptabilité</h1>
          <p className="text-sm text-muted-foreground">
            Encaissements, décaissements et bilan simplifié de l'établissement
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={exportCsv} disabled={filtered.length === 0}>
            <Download className="h-4 w-4 mr-2" /> Grand livre (CSV)
          </Button>
          {isAdmin && categories.length === 0 && (
            <Button variant="outline" onClick={seedCategories}>
              <Sparkles className="h-4 w-4 mr-2" /> Créer les catégories
            </Button>
          )}
          {isAdmin && (
            <Button onClick={openNew}>
              <Plus className="h-4 w-4 mr-2" /> Nouvelle écriture
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-emerald-500">
          <CardHeader className="pb-2 flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Recettes</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent><p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{formatCFA(totals.income)}</p></CardContent>
        </Card>
        <Card className="border-l-4 border-l-destructive">
          <CardHeader className="pb-2 flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Dépenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent><p className="text-2xl font-bold text-destructive">{formatCFA(totals.expense)}</p></CardContent>
        </Card>
        <Card className="border-l-4 border-l-primary">
          <CardHeader className="pb-2 flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Solde</CardTitle>
            <Wallet className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${totals.balance >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"}`}>
              {formatCFA(totals.balance)}
            </p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-muted-foreground">
          <CardHeader className="pb-2 flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Écritures</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><p className="text-2xl font-bold text-foreground">{totals.count}</p></CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6 flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input className="pl-9" placeholder="Rechercher une écriture…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[170px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="month">Ce mois</SelectItem>
              <SelectItem value="quarter">3 derniers mois</SelectItem>
              <SelectItem value="year">Année en cours</SelectItem>
              <SelectItem value="all">Tout l'historique</SelectItem>
            </SelectContent>
          </Select>
          <Select value={kindFilter} onValueChange={setKindFilter}>
            <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les types</SelectItem>
              <SelectItem value="income">Recettes</SelectItem>
              <SelectItem value="expense">Dépenses</SelectItem>
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les catégories</SelectItem>
              {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Tabs defaultValue="journal">
        <TabsList>
          <TabsTrigger value="journal">Journal</TabsTrigger>
          <TabsTrigger value="bilan">Bilan</TabsTrigger>
        </TabsList>

        <TabsContent value="journal" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Journal des écritures</CardTitle>
              <CardDescription>{filtered.length} écriture(s) sur la période sélectionnée</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
              ) : filtered.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">
                  Aucune écriture. {isAdmin ? "Cliquez sur « Nouvelle écriture » pour commencer." : ""}
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Libellé</TableHead>
                        <TableHead>Catégorie</TableHead>
                        <TableHead>Règlement</TableHead>
                        <TableHead className="text-right">Montant</TableHead>
                        {isAdmin && <TableHead className="text-right">Actions</TableHead>}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filtered.map((e) => {
                        const cat = categories.find((c) => c.id === e.category_id);
                        return (
                          <TableRow key={e.id}>
                            <TableCell className="whitespace-nowrap">
                              {new Date(e.entry_date).toLocaleDateString("fr-FR")}
                            </TableCell>
                            <TableCell>
                              <div className="font-medium text-foreground">{e.label}</div>
                              {e.reference && <div className="text-xs text-muted-foreground">Réf. {e.reference}</div>}
                            </TableCell>
                            <TableCell>
                              {cat ? (
                                <Badge variant="outline" style={{ borderColor: cat.color, color: cat.color }}>
                                  {cat.name}
                                </Badge>
                              ) : <span className="text-muted-foreground">—</span>}
                            </TableCell>
                            <TableCell className="text-muted-foreground">{methodLabel(e.payment_method)}</TableCell>
                            <TableCell className={`text-right font-semibold ${e.kind === "income" ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"}`}>
                              {e.kind === "income" ? "+" : "−"} {formatCFA(e.amount)}
                            </TableCell>
                            {isAdmin && (
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-1">
                                  <Button variant="ghost" size="icon" onClick={() => openEdit(e)}>
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                  <DeleteConfirmButton
                                    table="accounting_entries"
                                    id={e.id}
                                    itemLabel={e.label}
                                    onDeleted={loadAll}
                                    variant="ghost"
                                    size="icon"
                                  />
                                </div>
                              </TableCell>
                            )}
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bilan" className="mt-4 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recettes vs dépenses par mois</CardTitle>
            </CardHeader>
            <CardContent>
              {monthly.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">Pas encore de données.</p>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthly}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="month" fontSize={12} />
                    <YAxis fontSize={12} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
                    <Tooltip formatter={(v: number) => formatCFA(v)} />
                    <Legend />
                    <Bar dataKey="recettes" fill="#10b981" name="Recettes" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="depenses" fill="#ef4444" name="Dépenses" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Répartition par catégorie</CardTitle>
              <CardDescription>Sur la période sélectionnée</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {byCategory.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">Pas encore de données.</p>
              ) : byCategory.map((c) => (
                <div key={c.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                    <span className="text-sm text-foreground">{c.name}</span>
                    <Badge variant="secondary" className="text-[10px]">
                      {c.kind === "income" ? "Recette" : "Dépense"}
                    </Badge>
                  </div>
                  <span className="text-sm font-mono text-muted-foreground">{formatCFA(c.total)}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AccountingEntryDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        categories={categories}
        entry={editing}
        schoolId={schoolId}
        onSaved={loadAll}
      />
    </div>
  );
}
