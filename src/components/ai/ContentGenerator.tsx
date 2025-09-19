import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Wand2, FileText, ClipboardCheck, BarChart3, Download, Copy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from "@/hooks/use-toast";

interface GeneratedContent {
  type: string;
  content: string;
  metadata: {
    subject: string;
    level: string;
    duration: string;
    difficulty: string;
  };
}

export const ContentGenerator = () => {
  const [generating, setGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [selectedType, setSelectedType] = useState<'assessment' | 'report' | 'analysis'>('assessment');
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    subject: '',
    level: '',
    topic: '',
    difficulty: 'medium',
    questionsCount: '10',
    duration: '60',
  });

  const generateContent = async () => {
    setGenerating(true);
    
    // Simulate AI generation
    setTimeout(() => {
      let content = '';
      
      if (selectedType === 'assessment') {
        content = generateAssessmentContent();
      } else if (selectedType === 'report') {
        content = generateReportContent();
      } else {
        content = generateAnalysisContent();
      }

      setGeneratedContent({
        type: selectedType,
        content,
        metadata: {
          subject: formData.subject,
          level: formData.level,
          duration: formData.duration + ' min',
          difficulty: formData.difficulty
        }
      });

      setGenerating(false);
      toast({
        title: "✨ Contenu généré avec succès",
        description: `${selectedType === 'assessment' ? 'Évaluation' : selectedType === 'report' ? 'Rapport' : 'Analyse'} créé(e) par IA`,
      });
    }, 3000);
  };

  const generateAssessmentContent = () => {
    return `# Évaluation - ${formData.subject}
**Sujet:** ${formData.topic}
**Niveau:** ${formData.level}
**Durée:** ${formData.duration} minutes
**Difficulté:** ${formData.difficulty}

## Questions générées par IA:

### Question 1 (4 points)
Expliquez les concepts fondamentaux de ${formData.topic} en donnant des exemples concrets.

**Critères d'évaluation:**
- Clarté de l'explication (2 pts)
- Pertinence des exemples (2 pts)

### Question 2 (6 points)
Résolvez le problème suivant en détaillant votre démarche:
[Problème adapté au niveau ${formData.level}]

**Barème:**
- Méthode correcte (3 pts)
- Calculs justes (2 pts)
- Présentation (1 pt)

### Question 3 (10 points)
Analyse critique: Comparez et contrastez les différentes approches pour...

*[Générée automatiquement selon les paramètres spécifiés]*

---
**Total: 20 points**
**Temps recommandé par question: ${Math.floor(parseInt(formData.duration) / parseInt(formData.questionsCount))} min**`;
  };

  const generateReportContent = () => {
    return `# Rapport de Performance - Classe ${formData.level}
**Matière:** ${formData.subject}
**Période:** Trimestre en cours
**Généré le:** ${new Date().toLocaleDateString('fr-FR')}

## Analyse globale par IA

### 📊 Statistiques de classe
- **Moyenne générale:** 14.2/20 (+1.3 vs trimestre précédent)
- **Médiane:** 14.8/20
- **Écart-type:** 3.1
- **Taux de réussite:** 87% (≥10/20)

### 🎯 Points forts identifiés
1. **Compréhension conceptuelle** - 92% des élèves maîtrisent les bases
2. **Participation active** - Augmentation de 23% des interventions
3. **Travail collaboratif** - Excellents résultats en projets de groupe

### ⚠️ Axes d'amélioration détectés
1. **Rédaction scientifique** - 34% d'élèves en difficulté
2. **Gestion du temps** - Problème identifié pour 28% de la classe
3. **Applications pratiques** - Besoin de renforcement

### 🔮 Prédictions IA pour le prochain trimestre
- **Évolution attendue:** +0.8 points de moyenne
- **Élèves à accompagner:** 5 élèves identifiés
- **Recommandations pédagogiques:** Mise en place d'ateliers méthodologiques

### 📈 Graphiques et données
*[Graphiques interactifs générés automatiquement]*

---
*Rapport généré par l'IA EvalScol - Analyse basée sur 247 points de données*`;
  };

  const generateAnalysisContent = () => {
    return `# Analyse Prédictive - ${formData.subject}
**Analyse générée par IA le:** ${new Date().toLocaleString('fr-FR')}

## 🧠 Insights Intelligence Artificielle

### Modèle prédictif utilisé
- **Algorithme:** Neural Network Transformer v3.2
- **Données d'entraînement:** 47,392 évaluations
- **Précision:** 94.7%
- **Confiance:** 89.2%

### 📊 Tendances détectées

#### Performances par compétence
1. **Analyse critique** - Forte progression (+15%)
2. **Résolution de problèmes** - Stable (±2%)
3. **Communication** - En amélioration (+8%)

#### Patterns comportementaux
- **Pic de performance:** Mardis 10h-12h
- **Baisse attention:** Vendredi après-midi
- **Méthode efficace:** Apprentissage par projet (+12% résultats)

### 🎯 Recommandations IA personnalisées

#### Pour l'enseignant
1. **Différenciation pédagogique** - 3 groupes de niveau identifiés
2. **Timing optimal** - Notions complexes le matin
3. **Supports visuels** - 67% d'apprenants visuels détectés

#### Pour les élèves
- **Marie D.:** Potentiel élevé, challenger avec exercices avancés
- **Pierre M.:** Besoin de consolidation, proposer tutorat
- **Sophie C.:** Profil kinesthésique, privilégier manipulation

### 🚀 Prédictions futures
- **Objectif atteignable:** +2.3 points de moyenne d'ici fin d'année
- **Risque d'échec:** 3% de la classe (intervention recommandée)
- **Excellence:** 23% des élèves peuvent viser 18+/20

---
*Analyse alimentée par l'IA EvalScol - Mise à jour temps réel*`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "📋 Copié",
      description: "Contenu copié dans le presse-papiers",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Générations IA Automatiques
        </h2>
        <p className="text-muted-foreground">Créez du contenu pédagogique avec l'intelligence artificielle</p>
      </div>

      <Tabs value={selectedType} onValueChange={(value) => setSelectedType(value as any)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="assessment" className="flex items-center gap-2">
            <ClipboardCheck className="h-4 w-4" />
            Évaluations
          </TabsTrigger>
          <TabsTrigger value="report" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Rapports
          </TabsTrigger>
          <TabsTrigger value="analysis" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analyses
          </TabsTrigger>
        </TabsList>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Configuration Panel */}
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wand2 className="h-5 w-5 text-primary" />
                Configuration IA
              </CardTitle>
              <CardDescription>
                Paramètres pour la génération automatique
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="subject">Matière</Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    placeholder="ex: Mathématiques, Physique..."
                  />
                </div>

                <div>
                  <Label htmlFor="level">Niveau</Label>
                  <Select value={formData.level} onValueChange={(value) => setFormData({...formData, level: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner le niveau" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="6eme">6ème</SelectItem>
                      <SelectItem value="5eme">5ème</SelectItem>
                      <SelectItem value="4eme">4ème</SelectItem>
                      <SelectItem value="3eme">3ème</SelectItem>
                      <SelectItem value="2nde">2nde</SelectItem>
                      <SelectItem value="1ere">1ère</SelectItem>
                      <SelectItem value="terminale">Terminale</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="topic">Sujet/Thème</Label>
                  <Input
                    id="topic"
                    value={formData.topic}
                    onChange={(e) => setFormData({...formData, topic: e.target.value})}
                    placeholder="ex: Fonctions linéaires, Optique..."
                  />
                </div>

                <div>
                  <Label htmlFor="difficulty">Difficulté</Label>
                  <Select value={formData.difficulty} onValueChange={(value) => setFormData({...formData, difficulty: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Facile</SelectItem>
                      <SelectItem value="medium">Moyen</SelectItem>
                      <SelectItem value="hard">Difficile</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {selectedType === 'assessment' && (
                  <>
                    <div>
                      <Label htmlFor="questionsCount">Nombre de questions</Label>
                      <Input
                        id="questionsCount"
                        type="number"
                        value={formData.questionsCount}
                        onChange={(e) => setFormData({...formData, questionsCount: e.target.value})}
                        min="1"
                        max="50"
                      />
                    </div>

                    <div>
                      <Label htmlFor="duration">Durée (minutes)</Label>
                      <Input
                        id="duration"
                        type="number"
                        value={formData.duration}
                        onChange={(e) => setFormData({...formData, duration: e.target.value})}
                        min="15"
                        max="240"
                      />
                    </div>
                  </>
                )}
              </div>

              <Button 
                onClick={generateContent}
                disabled={generating || !formData.subject || !formData.level}
                className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
              >
                {generating ? (
                  <>
                    <Wand2 className="h-4 w-4 mr-2 animate-spin" />
                    Génération IA en cours...
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4 mr-2" />
                    Générer avec l'IA
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Generated Content Display */}
          <Card className="border-accent/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-accent" />
                Contenu Généré
              </CardTitle>
              {generatedContent && (
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">{generatedContent.metadata.subject}</Badge>
                  <Badge variant="outline">{generatedContent.metadata.level}</Badge>
                  <Badge variant="outline">{generatedContent.metadata.difficulty}</Badge>
                  <Badge variant="outline">{generatedContent.metadata.duration}</Badge>
                </div>
              )}
            </CardHeader>
            <CardContent>
              <AnimatePresence>
                {generating && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center py-8"
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="inline-block mb-4"
                    >
                      <Wand2 className="h-8 w-8 text-primary" />
                    </motion.div>
                    <p className="text-muted-foreground">L'IA génère votre contenu...</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Analyse des paramètres • Génération • Optimisation
                    </p>
                  </motion.div>
                )}

                {generatedContent && !generating && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    <div className="max-h-96 overflow-y-auto p-4 bg-muted/50 rounded-lg border">
                      <pre className="whitespace-pre-wrap text-sm font-mono">
                        {generatedContent.content}
                      </pre>
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        onClick={() => copyToClipboard(generatedContent.content)}
                        className="flex-1"
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copier
                      </Button>
                      <Button variant="outline" className="flex-1">
                        <Download className="h-4 w-4 mr-2" />
                        Télécharger
                      </Button>
                    </div>
                  </motion.div>
                )}

                {!generatedContent && !generating && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Wand2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Configurez les paramètres et générez du contenu avec l'IA</p>
                  </div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </div>
      </Tabs>
    </div>
  );
};