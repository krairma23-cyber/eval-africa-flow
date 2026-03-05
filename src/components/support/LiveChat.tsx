import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Send, X, MessageCircle } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface ChatMessage {
  id: string;
  session_id: string;
  sender_id: string;
  message: string;
  is_admin: boolean;
  read: boolean;
  created_at: string;
}

interface ChatSession {
  id: string;
  user_id: string;
  status: string;
  created_at: string;
}

interface LiveChatProps {
  onClose?: () => void;
}

export default function LiveChat({ onClose }: LiveChatProps) {
  const [session, setSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    initializeChat();
  }, []);

  useEffect(() => {
    if (session) {
      subscribeToMessages();
    }
    return () => {
      supabase.removeAllChannels();
    };
  }, [session]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const initializeChat = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Erreur",
          description: "Vous devez être connecté pour utiliser le chat",
          variant: "destructive",
        });
        return;
      }

      setCurrentUserId(user.id);

      // Check for active session
      const { data: existingSession } = await supabase
        .from('support_chat_sessions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (existingSession) {
        setSession(existingSession);
        await loadMessages(existingSession.id);
      } else {
        // Create new session
        await createNewSession(user.id);
      }
    } catch (error) {
      console.error('Error initializing chat:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'initialiser le chat",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createNewSession = async (userId: string) => {
    try {
      // Get user's school_id
      const { data: profile } = await supabase
        .from('profiles')
        .select('school_id')
        .eq('user_id', userId)
        .single();

      const { data, error } = await supabase
        .from('support_chat_sessions')
        .insert({
          user_id: userId,
          school_id: profile?.school_id,
          status: 'active'
        })
        .select()
        .single();

      if (error) throw error;

      setSession(data);
      
      // Send welcome message from support bot
      await supabase
        .from('support_chat_messages')
        .insert({
          session_id: data.id,
          sender_id: 'system',
          message: "Bienvenue sur le support EvalScol Africa ! 👋\nComment pouvons-nous vous aider aujourd'hui ?",
          is_admin: true
        });

    } catch (error) {
      console.error('Error creating session:', error);
      throw error;
    }
  };

  const loadMessages = async (sessionId: string) => {
    try {
      const { data, error } = await supabase
        .from('support_chat_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      setMessages(data || []);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const subscribeToMessages = () => {
    if (!session) return;

    const channel = supabase
      .channel(`chat-${session.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'support_chat_messages',
          filter: `session_id=eq.${session.id}`
        },
        (payload) => {
          setMessages(prev => [...prev, payload.new as ChatMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !session || !currentUserId || sending) return;

    setSending(true);
    try {
      const { error } = await supabase
        .from('support_chat_messages')
        .insert({
          session_id: session.id,
          sender_id: currentUserId,
          message: newMessage.trim(),
          is_admin: false
        });

      if (error) throw error;

      setNewMessage("");
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le message",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (loading) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md flex flex-col h-[600px]">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">Chat en direct</CardTitle>
        </div>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-2 ${
                  message.sender_id === currentUserId ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.is_admin && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      SUP
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`max-w-[75%] rounded-lg p-3 ${
                    message.sender_id === currentUserId
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap break-words">{message.message}</p>
                  <p className={`text-xs mt-1 ${
                    message.sender_id === currentUserId
                      ? 'text-primary-foreground/70'
                      : 'text-muted-foreground'
                  }`}>
                    {format(new Date(message.created_at), 'HH:mm', { locale: fr })}
                  </p>
                </div>
                {message.sender_id === currentUserId && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">
                      MOI
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>

        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Tapez votre message..."
              disabled={sending}
              className="flex-1"
            />
            <Button 
              onClick={sendMessage} 
              disabled={!newMessage.trim() || sending}
              size="icon"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Un agent vous répondra dans quelques instants
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
