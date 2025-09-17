import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

interface Subject {
  id: string;
  name: string;
  code: string;
  description: string;
  created_at: string;
}

export default function Subjects() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching subjects:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les matières",
          variant: "destructive",
        });
      } else {
        setSubjects(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredSubjects = subjects.filter(
    (subject) =>
      subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subject.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (subject.description && subject.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        
        <Skeleton className="h-10 w-full max-w-sm" />
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <BookOpen className="h-8 w-8" />
            Matières
          </h1>
          <p className="text-muted-foreground">
            Gestion des matières enseignées
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Ajouter une matière
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher une matière..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {filteredSubjects.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Aucune matière trouvée</h3>
            <p className="text-muted-foreground text-center mb-4">
              {searchTerm
                ? "Aucune matière ne correspond à votre recherche"
                : "Commencez par ajouter des matières à votre établissement"}
            </p>
            {!searchTerm && (
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Ajouter la première matière
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredSubjects.map((subject) => (
            <Card key={subject.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{subject.name}</span>
                  <Badge variant="outline">{subject.code}</Badge>
                </CardTitle>
                <CardDescription>
                  {subject.description || "Aucune description"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  Créée le {formatDate(subject.created_at)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}