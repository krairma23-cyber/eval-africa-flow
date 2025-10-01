import { useState, useEffect } from 'react';
import { useConversation } from '@11labs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mic, MicOff, Brain, Zap, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from "@/hooks/use-toast";
import { logError } from "@/lib/logger";

export const AIAssistant = () => {
  const [isListening, setIsListening] = useState(false);
  const [lastMessage, setLastMessage] = useState('');
  const [agentReady, setAgentReady] = useState(false);
  const [showDemo, setShowDemo] = useState(true);
  const { toast } = useToast();

  const conversation = useConversation({
    onConnect: () => {
      setAgentReady(true);
      toast({
        title: "🤖 Assistant IA connecté",
        description: "Vous pouvez maintenant parler avec votre assistant IA pédagogique",
      });
    },
    onDisconnect: () => {
      setAgentReady(false);
      setIsListening(false);
    },
    onMessage: (message) => {
      setLastMessage(message.message || '');
    },
    onError: (error) => {
      logError('AI Assistant connection error', error, {
        component: 'AIAssistant',
        action: 'CONNECT'
      });
      toast({
        title: "Erreur Assistant IA",
        description: "Impossible de se connecter à l'assistant IA. Vérifiez votre configuration.",
        variant: "destructive",
      });
    },
    clientTools: {
      createAssessment: (params: { subject: string; type: string; difficulty: string }) => {
        toast({
          title: "✨ Évaluation générée",
          description: `Nouvelle évaluation en ${params.subject} (${params.difficulty})`,
        });
        return `Assessment created for ${params.subject}`;
      },
      analyzePerformance: (params: { studentId: string }) => {
        toast({
          title: "📊 Analyse prédictive",
          description: "Analyse des performances de l'élève en cours...",
        });
        return "Performance analysis completed";
      },
      generateReport: (params: { reportType: string; class: string }) => {
        toast({
          title: "📋 Rapport généré",
          description: `Rapport ${params.reportType} créé pour la classe ${params.class}`,
        });
        return "Report generated successfully";
      }
    }
  });

  const startConversation = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // For demo purposes, we'll simulate the conversation
      // In production, you would use: await conversation.startSession({ agentId: 'your-agent-id' });
      setIsListening(true);
      setAgentReady(true);
      setShowDemo(false);
      
      toast({
        title: "🎙️ Mode vocal activé",
        description: "Parlez à votre assistant IA pour créer des évaluations, analyser les performances, etc.",
      });
    } catch (error) {
      toast({
        title: "Accès microphone requis",
        description: "Autorisez l'accès au microphone pour utiliser l'assistant vocal",
        variant: "destructive",
      });
    }
  };

  const stopConversation = async () => {
    setIsListening(false);
    setAgentReady(false);
    // await conversation.endSession();
  };

  const demoFeatures = [
    { icon: Brain, title: "Génération d'évaluations", desc: "Créez des évaluations personnalisées par la voix" },
    { icon: Zap, title: "Analyse prédictive", desc: "Prédisez les performances des élèves" },
    { icon: Sparkles, title: "Rapports automatiques", desc: "Générez des bulletins personnalisés" }
  ];

  return (
    <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-br from-card to-card/50">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5" />
      
      <CardHeader className="relative">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ 
              scale: isListening ? [1, 1.2, 1] : 1,
              rotate: isListening ? 360 : 0 
            }}
            transition={{ 
              scale: { duration: 2, repeat: Infinity },
              rotate: { duration: 4, repeat: Infinity, ease: "linear" }
            }}
            className="p-2 rounded-full bg-gradient-to-r from-primary to-accent"
          >
            <Brain className="h-6 w-6 text-primary-foreground" />
          </motion.div>
          <div>
            <CardTitle className="text-xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Assistant IA EvalScol
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant={agentReady ? "default" : "secondary"} className="text-xs">
                {agentReady ? "🟢 Connecté" : "🔴 Déconnecté"}
              </Badge>
              <Badge variant="outline" className="text-xs">
                IA Générative
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative space-y-4">
        {showDemo && (
          <div className="grid gap-3">
            {demoFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border/50"
              >
                <feature.icon className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium text-sm">{feature.title}</p>
                  <p className="text-xs text-muted-foreground">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <AnimatePresence>
          {lastMessage && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-3 rounded-lg bg-primary/10 border border-primary/20"
            >
              <p className="text-sm">{lastMessage}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex gap-2">
          <Button
            onClick={isListening ? stopConversation : startConversation}
            className={`flex-1 ${isListening 
              ? 'bg-destructive hover:bg-destructive/90' 
              : 'bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90'
            }`}
          >
            {isListening ? (
              <>
                <MicOff className="h-4 w-4 mr-2" />
                Arrêter l'écoute
              </>
            ) : (
              <>
                <Mic className="h-4 w-4 mr-2" />
                Activer l'assistant
              </>
            )}
          </Button>
        </div>

        <div className="text-xs text-muted-foreground text-center">
          💡 Dites "Créer une évaluation de mathématiques" ou "Analyser les performances de la classe"
        </div>
      </CardContent>
    </Card>
  );
};