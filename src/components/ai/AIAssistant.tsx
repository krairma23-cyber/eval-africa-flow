import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Brain, Send, Loader2, Sparkles, Mic, MicOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from '@/components/ui/scroll-area';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export const AIAssistant = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const { toast } = useToast();

  const sendMessage = async (message: string, action?: string) => {
    if (!message.trim() && !action) return;

    const userMessage: Message = {
      role: 'user',
      content: message || `Action: ${action}`,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('ai-assistant-chat', {
        body: { message, action }
      });

      if (error) throw error;

      if (data.error) {
        if (data.code === 'RATE_LIMIT') {
          toast({ title: "⏱️ Limite atteinte", description: data.error, variant: "destructive" });
        } else if (data.code === 'INSUFFICIENT_CREDITS') {
          toast({ title: "💳 Crédits insuffisants", description: data.error, variant: "destructive" });
        } else {
          throw new Error(data.error);
        }
        return;
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);

      if (action === 'createAssessment') {
        toast({ title: "✨ Assistant prêt", description: "Je vais vous aider à créer une évaluation" });
      } else if (action === 'analyzePerformance') {
        toast({ title: "📊 Analyse lancée", description: "Préparation de l'analyse des performances" });
      } else if (action === 'generateReport') {
        toast({ title: "📋 Génération de rapport", description: "Configuration du rapport en cours" });
      }

    } catch (error) {
      console.error('Error sending message:', error);
      toast({ title: "Erreur", description: "Impossible de communiquer avec l'assistant IA", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  // Voice input using Web Speech API
  const toggleVoiceInput = useCallback(() => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      toast({ title: "🎙️ Non supporté", description: "La reconnaissance vocale n'est pas disponible dans ce navigateur", variant: "destructive" });
      return;
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.lang = 'fr-FR';
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = Array.from(event.results)
        .map(result => result[0].transcript)
        .join('');
      setInputMessage(transcript);

      // Auto-send on final result
      if (event.results[event.results.length - 1].isFinal) {
        setTimeout(() => {
          if (transcript.trim()) {
            sendMessage(transcript.trim());
          }
        }, 500);
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      if (event.error === 'not-allowed') {
        toast({ title: "🎙️ Microphone refusé", description: "Veuillez autoriser l'accès au microphone", variant: "destructive" });
      }
    };

    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    toast({ title: "🎙️ Écoute en cours...", description: "Parlez maintenant, l'IA vous écoute" });
  }, [isListening, toast]);

  const quickActions = [
    { action: 'createAssessment', label: "Créer une évaluation", icon: Brain, prompt: "Je veux créer une nouvelle évaluation" },
    { action: 'analyzePerformance', label: "Analyser performances", icon: Sparkles, prompt: "Aide-moi à analyser les performances" },
    { action: 'generateReport', label: "Générer un rapport", icon: Sparkles, prompt: "Je veux générer un rapport" }
  ];

  return (
    <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-br from-card to-card/50 flex flex-col h-[600px]">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5" />
      
      <CardHeader className="relative pb-3">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="p-2 rounded-full bg-gradient-to-r from-primary to-accent"
          >
            <Brain className="h-6 w-6 text-primary-foreground" />
          </motion.div>
          <div className="flex-1">
            <CardTitle className="text-xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Assistant IA EvalScol
            </CardTitle>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={isConnected ? "default" : "secondary"} className="text-xs">
                {isConnected ? "🟢 Connecté" : "🔴 Déconnecté"}
              </Badge>
              <Badge variant="outline" className="text-xs">
                Powered by Lovable AI
              </Badge>
              {isListening && (
                <Badge variant="destructive" className="text-xs animate-pulse">
                  🎙️ Écoute...
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative flex-1 flex flex-col p-4 min-h-0 overflow-hidden">
        {messages.length === 0 && (
          <div className="grid gap-2 mb-3">
            <p className="text-sm text-muted-foreground mb-2">Actions rapides :</p>
            {quickActions.map((action) => (
              <Button
                key={action.action}
                variant="outline"
                size="sm"
                onClick={() => sendMessage(action.prompt, action.action)}
                disabled={isLoading}
                className="justify-start gap-2"
              >
                <action.icon className="h-4 w-4" />
                {action.label}
              </Button>
            ))}
          </div>
        )}

        <ScrollArea className="flex-1 min-h-0 pr-4 mb-3">
          <div className="space-y-4 pb-2">
            <AnimatePresence>
              {messages.map((msg, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted border border-border'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {msg.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {isLoading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                <div className="bg-muted border border-border p-3 rounded-lg flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">L'assistant réfléchit...</span>
                </div>
              </motion.div>
            )}
          </div>
        </ScrollArea>

        <div className="flex-shrink-0 space-y-2 pt-2 border-t border-border/50">
          <div className="flex gap-2">
            <Button
              onClick={toggleVoiceInput}
              variant={isListening ? "destructive" : "outline"}
              size="icon"
              className={isListening ? "animate-pulse" : ""}
              title={isListening ? "Arrêter l'écoute" : "Parler à l'assistant"}
            >
              {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage(inputMessage);
                }
              }}
              placeholder={isListening ? "🎙️ Parlez maintenant..." : "Posez votre question..."}
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              onClick={() => sendMessage(inputMessage)}
              disabled={isLoading || !inputMessage.trim()}
              size="icon"
              className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
          <div className="text-xs text-muted-foreground text-center">
            🎙️ Cliquez sur le micro pour parler ou tapez votre question
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
