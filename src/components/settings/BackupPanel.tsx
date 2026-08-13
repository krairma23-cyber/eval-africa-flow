import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { logError } from "@/lib/logger";
import { Download, DatabaseBackup, RefreshCw } from "lucide-react";

interface BackupRow {
  id: string;
  file_path: string;
  size_bytes: number;
  row_count: number;
  status: string;
  trigger_source: string;
  created_at: string;
  expires_at: string | null;
}

const formatSize = (bytes: number) => {
  if (!bytes) return "0 Ko";
  const kb = bytes / 1024;
  return kb > 1024 ? `${(kb / 1024).toFixed(1)} Mo` : `${kb.toFixed(0)} Ko`;
};

export default function BackupPanel() {
  const { toast } = useToast();
  const [backups, setBackups] = useState<BackupRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);

  const loadBackups = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("school_backups")
        .select("id, file_path, size_bytes, row_count, status, trigger_source, created_at, expires_at")
        .order("created_at", { ascending: false })
        .limit(10);
      if (error) throw error;
      setBackups((data ?? []) as BackupRow[]);
    } catch (error) {
      logError("Load backups failed", error, { component: "BackupPanel", action: "load" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBackups();
  }, [loadBackups]);

  const runBackup = async () => {
    setRunning(true);
    try {
      const { data, error } = await supabase.functions.invoke("school-backup", { body: {} });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      toast({
        title: "Sauvegarde créée",
        description: `${(data as any)?.rowCount ?? 0} enregistrements archivés.`,
      });
      await loadBackups();
    } catch (error) {
      logError("Manual backup failed", error, { component: "BackupPanel", action: "run" });
      toast({
        title: "Échec de la sauvegarde",
        description: "La sauvegarde n'a pas pu être générée. Réessayez plus tard.",
        variant: "destructive",
      });
    } finally {
      setRunning(false);
    }
  };

  const downloadBackup = async (backup: BackupRow) => {
    try {
      const { data, error } = await supabase.storage
        .from("school-backups")
        .createSignedUrl(backup.file_path, 120);
      if (error || !data?.signedUrl) throw error ?? new Error("URL indisponible");
      window.open(data.signedUrl, "_blank", "noopener");
    } catch (error) {
      logError("Backup download failed", error, { component: "BackupPanel", action: "download" });
      toast({
        title: "Téléchargement impossible",
        description: "Le fichier de sauvegarde n'a pas pu être ouvert.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="space-y-0.5 min-w-0">
          <p className="text-sm font-medium">Sauvegardes de l'établissement</p>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Sauvegarde automatique chaque nuit (03h00) et purge des archives expirées
          </p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Button variant="outline" size="sm" onClick={loadBackups} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Button size="sm" onClick={runBackup} disabled={running}>
            <DatabaseBackup className="h-4 w-4 mr-2" />
            {running ? "Sauvegarde..." : "Sauvegarder maintenant"}
          </Button>
        </div>
      </div>

      {backups.length === 0 ? (
        <p className="text-xs text-muted-foreground border rounded-md p-3">
          {loading ? "Chargement..." : "Aucune sauvegarde pour le moment."}
        </p>
      ) : (
        <ul className="divide-y rounded-md border">
          {backups.map((b) => (
            <li key={b.id} className="flex items-center justify-between gap-3 p-3">
              <div className="min-w-0">
                <p className="text-sm truncate">
                  {new Date(b.created_at).toLocaleString("fr-FR")}
                </p>
                <p className="text-xs text-muted-foreground">
                  {b.row_count} enregistrements · {formatSize(b.size_bytes)} ·{" "}
                  {b.trigger_source === "cron" ? "automatique" : "manuelle"}
                  {b.expires_at
                    ? ` · expire le ${new Date(b.expires_at).toLocaleDateString("fr-FR")}`
                    : " · conservation illimitée"}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Badge variant={b.status === "success" ? "secondary" : "destructive"}>
                  {b.status === "success" ? "OK" : "Échec"}
                </Badge>
                {b.status === "success" && (
                  <Button variant="ghost" size="sm" onClick={() => downloadBackup(b)}>
                    <Download className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
