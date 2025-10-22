import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, ArrowLeft } from "lucide-react";

interface CampusSetupStepProps {
  onNext: () => void;
  onBack: () => void;
  onDataChange: (data: any) => void;
  initialData: any;
  schoolData: any;
}

export function CampusSetupStep({ onNext, onBack, onDataChange, initialData, schoolData }: CampusSetupStepProps) {
  const [loading, setLoading] = useState(false);
  const [campusName, setCampusName] = useState(initialData?.name || "Campus Principal");
  const [campusAddress, setCampusAddress] = useState(initialData?.address || schoolData?.address || "");
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create campus
      const { data: campus, error } = await supabase
        .from("campuses")
        .insert({
          school_id: schoolData.id,
          name: campusName,
          address: campusAddress,
        })
        .select()
        .single();

      if (error) throw error;

      onDataChange({ name: campusName, address: campusAddress, id: campus.id });
      toast({
        title: "Campus créé",
        description: "Le campus a été créé avec succès",
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
          <Building2 className="h-6 w-6 text-primary" />
        </div>
        <h2 className="text-2xl font-bold">Configuration du campus</h2>
        <p className="text-muted-foreground mt-2">
          Créez votre premier campus (vous pourrez en ajouter d'autres plus tard)
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="campusName">Nom du campus *</Label>
          <Input
            id="campusName"
            value={campusName}
            onChange={(e) => setCampusName(e.target.value)}
            placeholder="Campus Principal"
            required
          />
          <p className="text-xs text-muted-foreground mt-1">
            Si vous n'avez qu'un seul site, vous pouvez garder "Campus Principal"
          </p>
        </div>

        <div>
          <Label htmlFor="campusAddress">Adresse du campus</Label>
          <Input
            id="campusAddress"
            value={campusAddress}
            onChange={(e) => setCampusAddress(e.target.value)}
            placeholder="Adresse du campus"
          />
        </div>
      </div>

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Création..." : "Continuer"}
        </Button>
      </div>
    </form>
  );
}