import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { UserCog, ArrowRightLeft, MapPin } from "lucide-react";

const Assignments = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Affectations & Mouvements</h1>
          <p className="text-muted-foreground mt-2">
            Gérez les affectations, orientations et permutations des enseignants et élèves
          </p>
        </div>
      </div>

      <Tabs defaultValue="affectations" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="affectations">
            <UserCog className="h-4 w-4 mr-2" />
            Affectations
          </TabsTrigger>
          <TabsTrigger value="orientations">
            <MapPin className="h-4 w-4 mr-2" />
            Orientations
          </TabsTrigger>
          <TabsTrigger value="permutations">
            <ArrowRightLeft className="h-4 w-4 mr-2" />
            Permutations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="affectations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Affectations des Enseignants</CardTitle>
              <CardDescription>
                Assignez des enseignants aux classes et matières
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  Gérez les affectations des enseignants dans les différentes classes
                </p>
                <Button>
                  Nouvelle Affectation
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Affectations des Élèves</CardTitle>
              <CardDescription>
                Assignez des élèves aux classes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  Gérez les affectations des élèves dans les différentes classes
                </p>
                <Button>
                  Nouvelle Affectation
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orientations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Orientations des Élèves</CardTitle>
              <CardDescription>
                Gérez l'orientation scolaire et professionnelle des élèves
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  Suivez et gérez les orientations vers différentes filières
                </p>
                <Button>
                  Nouvelle Orientation
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Conseils d'Orientation</CardTitle>
              <CardDescription>
                Planifiez et documentez les conseils d'orientation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  Organisez les conseils d'orientation par classe ou par élève
                </p>
                <Button>
                  Planifier un Conseil
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permutations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Permutations d'Enseignants</CardTitle>
              <CardDescription>
                Gérez les permutations et échanges d'enseignants
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  Organisez les permutations entre enseignants pour différentes raisons
                </p>
                <Button>
                  Nouvelle Permutation
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Changements de Classe</CardTitle>
              <CardDescription>
                Gérez les changements de classe des élèves
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  Effectuez des changements de classe pour les élèves
                </p>
                <Button>
                  Nouveau Changement
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Assignments;
