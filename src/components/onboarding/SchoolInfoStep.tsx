import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { School } from "lucide-react";

interface SchoolInfoStepProps {
  onNext: () => void;
  onDataChange: (data: any) => void;
  initialData: any;
}

export function SchoolInfoStep({ onNext, onDataChange, initialData }: SchoolInfoStepProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    address: initialData?.address || "",
    phone: initialData?.phone || "",
    email: initialData?.email || "",
    academicYear: initialData?.academicYear || "2024-2025",
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Utilisateur non connecté");

      // Get user's school_id from profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("school_id")
        .eq("user_id", user.id)
        .single();

      if (!profile?.school_id) throw new Error("Aucune école associée");

      // Update school information
      const { data: school, error } = await supabase
        .from("schools")
        .update({
          name: formData.name,
          address: formData.address,
          phone: formData.phone,
          email: formData.email,
          academic_year: formData.academicYear,
        })
        .eq("id", profile.school_id)
        .select()
        .single();

      if (error) throw error;

      onDataChange({ ...formData, id: school.id });
      toast({
        title: "Informations sauvegardées",
        description: "Les informations de votre école ont été enregistrées",
      });
      onNext();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center mb-6">
        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3">
          <School className="h-6 w-6 text-primary" />
        </div>
        <h2 className="text-2xl font-bold">Informations sur l'établissement</h2>
        <p className="text-muted-foreground mt-2">
          Commençons par les informations de base de votre école
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Nom de l'établissement *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Ex: Lycée Jean de La Fontaine"
            required
          />
        </div>

        <div>
          <Label htmlFor="address">Adresse complète *</Label>
          <Textarea
            id="address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            placeholder="123 Rue de l'École, 75001 Paris, France"
            required
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="phone">Téléphone</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+33 1 23 45 67 89"
            />
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="contact@ecole.fr"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="academicYear">Année académique *</Label>
          <Input
            id="academicYear"
            value={formData.academicYear}
            onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
            placeholder="2024-2025"
            required
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={loading}>
          {loading ? "Enregistrement..." : "Continuer"}
        </Button>
      </div>
    </form>
  );
}