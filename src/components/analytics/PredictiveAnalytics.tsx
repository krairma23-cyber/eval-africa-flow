import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Brain, Target } from 'lucide-react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface PredictionData {
  studentName: string;
  currentScore: number;
  predictedScore: number;
  risk: 'low' | 'medium' | 'high';
  improvement: number;
  subject: string;
  confidence: number;
}

const mockPredictions: PredictionData[] = [
  { studentName: "Marie Dubois", currentScore: 85, predictedScore: 92, risk: 'low', improvement: 7, subject: "Mathématiques", confidence: 94 },
  { studentName: "Pierre Martin", currentScore: 72, predictedScore: 68, risk: 'medium', improvement: -4, subject: "Physique", confidence: 87 },
  { studentName: "Sophie Chen", currentScore: 65, predictedScore: 58, risk: 'high', improvement: -7, subject: "Chimie", confidence: 91 },
  { studentName: "Lucas Rey", currentScore: 78, predictedScore: 84, risk: 'low', improvement: 6, subject: "Biologie", confidence: 89 },
];

const performanceData = [
  { month: 'Sep', actual: 75, predicted: 76 },
  { month: 'Oct', actual: 78, predicted: 79 },
  { month: 'Nov', actual: 82, predicted: 81 },
  { month: 'Dec', actual: 85, predicted: 84 },
  { month: 'Jan', actual: 87, predicted: 88 },
  { month: 'Fév', actual: null, predicted: 91 },
];

export const PredictiveAnalytics = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState<'week' | 'month' | 'semester'>('month');
  const [aiProcessing, setAiProcessing] = useState(false);

  const runPredictiveAnalysis = () => {
    setAiProcessing(true);
    setTimeout(() => {
      setAiProcessing(false);
    }, 3000);
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-accent';
      case 'medium': return 'text-yellow-500';
      case 'high': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  const getRiskBadgeVariant = (risk: string) => {
    switch (risk) {
      case 'low': return 'default';
      case 'medium': return 'secondary';
      case 'high': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Analytics Prédictifs IA
          </h2>
          <p className="text-muted-foreground">Prédictions basées sur l'apprentissage automatique</p>
        </div>
        <Button 
          onClick={runPredictiveAnalysis}
          disabled={aiProcessing}
          className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
        >
          {aiProcessing ? (
            <>
              <Brain className="h-4 w-4 mr-2 animate-spin" />
              Analyse en cours...
            </>
          ) : (
            <>
              <Target className="h-4 w-4 mr-2" />
              Lancer l'analyse IA
            </>
          )}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Performance Prediction Chart */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Évolution Prédictive
            </CardTitle>
            <CardDescription>Prédictions vs performances réelles</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="actual" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={3}
                    name="Réel"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="predicted" 
                    stroke="hsl(var(--accent))" 
                    strokeWidth={3}
                    strokeDasharray="5 5"
                    name="Prédit"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* AI Confidence Metrics */}
        <Card className="border-accent/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-accent" />
              Confiance IA
            </CardTitle>
            <CardDescription>Précision des prédictions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Précision globale</span>
                <span className="font-medium">94.2%</span>
              </div>
              <Progress value={94.2} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Fiabilité prédictive</span>
                <span className="font-medium">89.7%</span>
              </div>
              <Progress value={89.7} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Modèle d'apprentissage</span>
                <span className="font-medium">91.5%</span>
              </div>
              <Progress value={91.5} className="h-2" />
            </div>

            <div className="pt-4 space-y-2">
              <Badge variant="outline" className="text-xs">
                🤖 Neural Network v2.1
              </Badge>
              <Badge variant="outline" className="text-xs">
                📊 +12,847 données d'entraînement
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Student Risk Predictions */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-primary" />
            Prédictions par Élève
          </CardTitle>
          <CardDescription>Identification proactive des élèves à risque</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {mockPredictions.map((prediction, index) => (
              <motion.div
                key={prediction.studentName}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-4 rounded-lg border bg-card/50"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-medium">{prediction.studentName}</h4>
                    <Badge variant={getRiskBadgeVariant(prediction.risk)} className="text-xs">
                      {prediction.risk === 'low' ? '✅ Faible risque' : 
                       prediction.risk === 'medium' ? '⚠️ Risque moyen' : 
                       '🚨 Risque élevé'}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {prediction.subject}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>Actuel: {prediction.currentScore}%</span>
                    <span>Prédit: {prediction.predictedScore}%</span>
                    <span className={`flex items-center gap-1 ${prediction.improvement >= 0 ? 'text-accent' : 'text-destructive'}`}>
                      {prediction.improvement >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      {Math.abs(prediction.improvement)}%
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm text-muted-foreground mb-1">Confiance</div>
                  <div className="font-medium text-lg">{prediction.confidence}%</div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};