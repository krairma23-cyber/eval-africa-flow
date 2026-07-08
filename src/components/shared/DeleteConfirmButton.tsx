import { useState, ReactNode } from "react";
import { Button, ButtonProps } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { logError } from "@/lib/logger";
import { Trash2, Loader2 } from "lucide-react";

type TableName =
  | "students"
  | "teachers"
  | "classrooms"
  | "assessments"
  | "assessment_results"
  | "report_cards"
  | "enrollments"
  | "subjects"
  | "terms";

interface DeleteConfirmButtonProps {
  table: TableName;
  id: string;
  itemLabel: string;
  title?: string;
  description?: string;
  onDeleted?: () => void;
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
  className?: string;
  children?: ReactNode;
  /** Custom delete handler when a simple table+id delete isn't enough (e.g. bulletins). */
  customDelete?: () => Promise<void>;
}

/**
 * Reusable confirm-before-delete button. Handles Supabase delete + toast + error logging.
 */
export function DeleteConfirmButton({
  table,
  id,
  itemLabel,
  title,
  description,
  onDeleted,
  variant = "ghost",
  size = "icon",
  className,
  children,
  customDelete,
}: DeleteConfirmButtonProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    setLoading(true);
    try {
      if (customDelete) {
        await customDelete();
      } else {
        const { error } = await supabase.from(table).delete().eq("id", id);
        if (error) throw error;
      }
      toast({
        title: "Supprimé",
        description: `${itemLabel} a été supprimé avec succès.`,
      });
      onDeleted?.();
      setOpen(false);
    } catch (error) {
      await logError(`Failed to delete from ${table}`, error, {
        component: "DeleteConfirmButton",
        action: "DELETE",
      });
      toast({
        title: "Erreur",
        description: "Impossible de supprimer. Vérifiez qu'aucune donnée liée ne dépend de cet élément.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
        }}
        type="button"
      >
        {children ?? <Trash2 className="h-4 w-4 text-destructive" />}
      </Button>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{title ?? "Confirmer la suppression"}</AlertDialogTitle>
            <AlertDialogDescription>
              {description ??
                `Êtes-vous sûr de vouloir supprimer ${itemLabel} ? Cette action est irréversible et supprimera également les données liées.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Suppression...
                </>
              ) : (
                "Supprimer"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
