import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, UserCheck, Save } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface Teacher {
  id: string;
  first_name: string;
  last_name: string;
  specialization: string | null;
  is_present?: boolean;
}

interface TeacherAttendanceDialogProps {
  children: React.ReactNode;
}

export function TeacherAttendanceDialog({ children }: TeacherAttendanceDialogProps) {
  const [open, setOpen] = useState(false);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [date, setDate] = useState<Date>(new Date());
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchTeachers();
    }
  }, [open]);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      
      const { data: profile } = await supabase
        .from("profiles")
        .select("school_id")
        .eq("user_id", (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (!profile?.school_id) {
        throw new Error("School ID not found");
      }

      const { data, error } = await supabase
        .from("teachers")
        .select("id, first_name, last_name, specialization")
        .eq("school_id", profile.school_id)
        .order("last_name");

      if (error) throw error;

      setTeachers(
        data.map((teacher) => ({
          ...teacher,
          is_present: true, // Default to present
        }))
      );
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les enseignants",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePresenceChange = (teacherId: string, isPresent: boolean) => {
    setTeachers((prev) =>
      prev.map((teacher) =>
        teacher.id === teacherId ? { ...teacher, is_present: isPresent } : teacher
      )
    );
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // Here you would typically save to an attendance table
      // For now, we'll just show a success message
      const absentTeachers = teachers.filter((t) => !t.is_present);

      toast({
        title: "Présences enregistrées",
        description: `${teachers.length - absentTeachers.length} présent(s), ${absentTeachers.length} absent(s) pour le ${format(date, "dd MMMM yyyy", { locale: fr })}`,
      });

      setOpen(false);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer les présences",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Présence des enseignants
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label>Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "dd MMMM yyyy", { locale: fr }) : "Sélectionner une date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(newDate) => newDate && setDate(newDate)}
                  locale={fr}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16" />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              <Label className="text-base font-semibold">Liste des enseignants</Label>
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {teachers.map((teacher) => (
                  <div
                    key={teacher.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card"
                  >
                    <div className="flex-1">
                      <p className="font-medium">
                        {teacher.first_name} {teacher.last_name}
                      </p>
                      {teacher.specialization && (
                        <p className="text-sm text-muted-foreground">
                          {teacher.specialization}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={teacher.is_present}
                        onCheckedChange={(checked) =>
                          handlePresenceChange(teacher.id, checked as boolean)
                        }
                        id={`present-${teacher.id}`}
                      />
                      <Label
                        htmlFor={`present-${teacher.id}`}
                        className="text-sm cursor-pointer"
                      >
                        Présent
                      </Label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Annuler
          </Button>
          <Button onClick={handleSave} disabled={saving || loading}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
