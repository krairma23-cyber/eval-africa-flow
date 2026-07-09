import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  MessageCircle, 
  Send, 
  Search,
  BookOpen,
  Video,
  Mail,
  Phone,
  Clock,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

import { Database } from "@/integrations/supabase/types";
import LiveChat from "@/components/support/LiveChat";

type Ticket = Database['public']['Tables']['support_tickets']['Row'];
type FAQ = Database['public']['Tables']['support_faqs']['Row'];

export default function Support() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showLiveChat, setShowLiveChat] = useState(false);
  const [newTicket, setNewTicket] = useState({
    subject: "",
    description: "",
    category: "general",
    priority: "medium"
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchSupportData();
  }, []);

  const fetchSupportData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Erreur",
          description: "Vous devez être connecté pour accéder au support",
          variant: "destructive",
        });
        return;
      }

      // Load tickets
      const { data: ticketsData, error: ticketsError } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (ticketsError) throw ticketsError;

      // Load FAQs
      const { data: faqsData, error: faqsError } = await supabase
        .from('support_faqs')
        .select('*')
        .eq('published', true)
        .order('views', { ascending: false });

      if (faqsError) throw faqsError;

      setTickets(ticketsData || []);
      setFaqs(faqsData || []);
    } catch (error) {
      const { logError } = await import('@/lib/logger');
      await logError('Failed to fetch support data', error, {
        component: 'Support',
        action: 'FETCH_SUPPORT_DATA'
      });
      toast({
        title: "Erreur",
        description: "Impossible de charger les données de support",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createTicket = async () => {
    if (!newTicket.subject || !newTicket.description) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Erreur",
          description: "Vous devez être connecté pour créer un ticket",
          variant: "destructive",
        });
        return;
      }

      // Get user's school_id from profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('school_id')
        .eq('user_id', user.id)
        .single();

      const { data, error } = await supabase
        .from('support_tickets')
        .insert({
          user_id: user.id,
          school_id: profile?.school_id || null,
          subject: newTicket.subject,
          description: newTicket.description,
          category: newTicket.category,
          priority: newTicket.priority,
          status: 'open'
        })
        .select()
        .single();

      if (error) throw error;

      setTickets([data, ...tickets]);
      setNewTicket({ subject: "", description: "", category: "general", priority: "medium" });
      
      toast({
        title: "Ticket créé",
        description: "Votre demande de support a été soumise avec succès",
      });
    } catch (error) {
      const { logError } = await import('@/lib/logger');
      await logError('Failed to create support ticket', error, {
        component: 'Support',
        action: 'CREATE_TICKET'
      });
      toast({
        title: "Erreur",
        description: "Impossible de créer le ticket",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredFAQs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted animate-pulse rounded" />
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Centre de Support</h1>
        <p className="text-muted-foreground">
          Trouvez de l'aide, contactez notre équipe et gérez vos tickets
        </p>
      </div>

      <Tabs defaultValue="help" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="help">Aide</TabsTrigger>
          <TabsTrigger value="tickets">Mes Tickets</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
          <TabsTrigger value="resources">Ressources</TabsTrigger>
        </TabsList>

        <TabsContent value="help" className="space-y-6">
          {/* Search */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Rechercher dans l'aide
              </CardTitle>
              <CardDescription>
                Trouvez rapidement une réponse à votre question
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Ex: Comment créer une évaluation ?"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button>
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* FAQ */}
          <Card>
            <CardHeader>
              <CardTitle>FAQ</CardTitle>
              <CardDescription>
                Les réponses aux questions les plus courantes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredFAQs.map((faq) => (
                  <div key={faq.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-lg">{faq.question}</h3>
                      <Badge variant="secondary" className="ml-4">
                        {faq.views} vues
                      </Badge>
                    </div>
                    <p className="text-muted-foreground mb-2">{faq.answer}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Badge variant="outline">{faq.category}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tickets" className="space-y-6">
          {/* Create Ticket */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Créer un nouveau ticket
              </CardTitle>
              <CardDescription>
                Décrivez votre problème ou votre question
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="subject">Sujet *</Label>
                  <Input
                    id="subject"
                    placeholder="Décrivez brièvement votre problème"
                    value={newTicket.subject}
                    onChange={(e) => setNewTicket({...newTicket, subject: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Catégorie</Label>
                  <Select value={newTicket.category} onValueChange={(value) => setNewTicket({...newTicket, category: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">Général</SelectItem>
                      <SelectItem value="technique">Technique</SelectItem>
                      <SelectItem value="facturation">Facturation</SelectItem>
                      <SelectItem value="fonctionnalite">Fonctionnalité</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="priority">Priorité</Label>
                <Select value={newTicket.priority} onValueChange={(value) => setNewTicket({...newTicket, priority: value})}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Faible</SelectItem>
                    <SelectItem value="medium">Moyenne</SelectItem>
                    <SelectItem value="high">Élevée</SelectItem>
                    <SelectItem value="urgent">Urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Décrivez votre problème en détail..."
                  rows={4}
                  value={newTicket.description}
                  onChange={(e) => setNewTicket({...newTicket, description: e.target.value})}
                />
              </div>

              <Button onClick={createTicket}>
                <Send className="h-4 w-4 mr-2" />
                Envoyer le ticket
              </Button>
            </CardContent>
          </Card>

          {/* Existing Tickets */}
          <Card>
            <CardHeader>
              <CardTitle>Vos tickets de support</CardTitle>
              <CardDescription>
                Suivez l'état de vos demandes de support
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tickets.map((ticket) => (
                  <div key={ticket.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-medium text-lg">{ticket.subject}</h3>
                        <p className="text-sm text-muted-foreground">#{ticket.id}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getPriorityColor(ticket.priority)}>
                          {ticket.priority}
                        </Badge>
                        <Badge className={getStatusColor(ticket.status)}>
                          {ticket.status}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-muted-foreground mb-3">{ticket.description}</p>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-4">
                        <span>Créé le {new Date(ticket.created_at).toLocaleDateString('fr-FR')}</span>
                        <span>Mis à jour le {new Date(ticket.updated_at).toLocaleDateString('fr-FR')}</span>
                      </div>
                      <Button variant="outline" size="sm">
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Voir détails
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Support par email
                </CardTitle>
                <CardDescription>
                  Contactez notre équipe support par email
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p><strong>Email:</strong></p>
                  <p className="text-muted-foreground">evalscolafrica@siteteck.com</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  Réponse sous 24-48h (Standard) / 12h (Professional) / 4h (Enterprise 24/7)
                </div>
                <Button asChild>
                  <a href="mailto:evalscolafrica@siteteck.com">
                    <Mail className="h-4 w-4 mr-2" />
                    Envoyer un email
                  </a>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Support téléphonique
                </CardTitle>
                <CardDescription>
                  Appelez-nous pour une assistance rapide
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p><strong>Téléphone:</strong></p>
                  <p className="text-muted-foreground">+225 01 01 82 13 29 / 07 07 04 19 03</p>
                </div>
                <div className="space-y-2">
                  <p><strong>Horaires:</strong></p>
                  <p className="text-muted-foreground">Lun-Ven: 8h-18h (GMT/UTC+0)</p>
                </div>
                <div className="space-y-2">
                  <p><strong>Bureaux:</strong></p>
                  <p className="text-muted-foreground">🇨🇮 Abidjan, Côte d'Ivoire (bureau principal)</p>
                  <p className="text-muted-foreground">🇸🇳 Dakar, Sénégal</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  Support disponible maintenant
                </div>
                <div className="flex gap-2">
                  <Button asChild className="flex-1">
                    <a href="tel:+2250101821329">
                      <Phone className="h-4 w-4 mr-2" />
                      Appeler
                    </a>
                  </Button>
                  <Button asChild variant="outline" className="flex-1">
                    <a href="https://chat.whatsapp.com/DMzKKigmion9jTcsWJtDvK" target="_blank" rel="noopener noreferrer">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      WhatsApp
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {showLiveChat ? (
            <LiveChat onClose={() => setShowLiveChat(false)} />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Chat en direct</CardTitle>
                <CardDescription>
                  Discutez directement avec notre équipe support
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <MessageCircle className="h-12 w-12 mx-auto text-primary mb-4" />
                  <h3 className="font-semibold mb-2">Besoin d'aide immédiate ?</h3>
                  <p className="text-muted-foreground mb-4">
                    Chattez en direct avec notre équipe support
                  </p>
                  <Button onClick={() => setShowLiveChat(true)}>
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Démarrer un chat
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="resources" className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Documentation
                </CardTitle>
                <CardDescription>
                  Guides détaillés et tutoriels
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start text-sm"
                    onClick={() => window.open('/getting-started', '_blank')}
                  >
                    <BookOpen className="h-4 w-4 mr-2 shrink-0" />
                    <span className="truncate">Guide de démarrage</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start text-sm"
                    onClick={() => window.open('/user-manual', '_blank')}
                  >
                    <BookOpen className="h-4 w-4 mr-2 shrink-0" />
                    <span className="truncate">Manuel utilisateur</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start text-sm"
                    onClick={() => window.open('/api-docs', '_blank')}
                  >
                    <BookOpen className="h-4 w-4 mr-2 shrink-0" />
                    <span className="truncate">Documentation API</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="h-5 w-5" />
                  Tutoriels vidéo
                </CardTitle>
                <CardDescription>
                  Apprenez en regardant nos vidéos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start text-sm"
                    onClick={() => window.open('https://www.youtube.com/watch?v=evalscol-setup', '_blank')}
                  >
                    <Video className="h-4 w-4 mr-2 shrink-0" />
                    <span className="truncate">Configuration initiale</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start text-sm"
                    onClick={() => window.open('https://www.youtube.com/watch?v=evalscol-evaluations', '_blank')}
                  >
                    <Video className="h-4 w-4 mr-2 shrink-0" />
                    <span className="truncate">Créer des évaluations</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start text-sm"
                    onClick={() => window.open('https://www.youtube.com/watch?v=evalscol-bulletins', '_blank')}
                  >
                    <Video className="h-4 w-4 mr-2 shrink-0" />
                    <span className="truncate">Générer des bulletins</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  État du service
                </CardTitle>
                <CardDescription>
                  Vérifiez l'état de nos services
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm">API EvalScol</span>
                  <Badge className="bg-green-100 text-green-800 shrink-0">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Opérationnel
                  </Badge>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm">Base de données</span>
                  <Badge className="bg-green-100 text-green-800 shrink-0">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Opérationnel
                  </Badge>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm">Assistant IA</span>
                  <Badge className="bg-green-100 text-green-800 shrink-0">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Opérationnel
                  </Badge>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => window.open('https://status.evalscol.com', '_blank')}
                >
                  Voir l'état complet
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Additional Help Section */}
      <Card className="bg-gradient-to-br from-blue-900 to-blue-950 border-blue-800 text-white">
        <CardContent className="py-8 px-6">
          <div className="text-center space-y-6">
            <h2 className="text-2xl font-bold">Besoin d'Aide Supplémentaire ?</h2>
            <p className="text-blue-100 max-w-2xl mx-auto">
              Notre équipe de support est disponible pour répondre à toutes vos questions concernant l'utilisation du portail parent EvalScol.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Button 
                size="lg"
                className="bg-purple-600 hover:bg-purple-700 text-white border-0 min-w-[200px]"
                asChild
              >
                <a href="#contact" onClick={() => {
                  const contactTab = document.querySelector('[value="contact"]') as HTMLElement;
                  contactTab?.click();
                }}>
                  <MessageCircle className="h-5 w-5 mr-2" />
                  Contacter le Support
                </a>
              </Button>
              <Button 
                size="lg"
                variant="outline"
                className="bg-transparent border-2 border-white text-white hover:bg-white/10 min-w-[200px]"
                asChild
              >
                <a href="#tickets" onClick={() => {
                  const ticketsTab = document.querySelector('[value="tickets"]') as HTMLElement;
                  ticketsTab?.click();
                }}>
                  <Send className="h-5 w-5 mr-2" />
                  Envoyer un Message
                </a>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
