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
  AlertCircle,
  Filter
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

interface Ticket {
  id: string;
  subject: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  created_at: string;
  updated_at: string;
  category: string;
}

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  views: number;
}

export default function Support() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
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
      // Simulate support data
      const mockTickets: Ticket[] = [
        {
          id: '1',
          subject: 'Problème de connexion',
          description: 'Impossible de me connecter à mon compte',
          status: 'open',
          priority: 'high',
          created_at: '2024-02-20',
          updated_at: '2024-02-20',
          category: 'technique'
        },
        {
          id: '2',
          subject: 'Question sur la facturation',
          description: 'Comment changer mon plan d\'abonnement ?',
          status: 'resolved',
          priority: 'medium',
          created_at: '2024-02-18',
          updated_at: '2024-02-19',
          category: 'facturation'
        }
      ];

      const mockFAQs: FAQ[] = [
        {
          id: '1',
          question: 'Comment créer une évaluation ?',
          answer: 'Pour créer une évaluation, rendez-vous dans la section "Évaluations" et cliquez sur "Nouvelle évaluation".',
          category: 'general',
          views: 1250
        },
        {
          id: '2',
          question: 'Comment inviter des enseignants ?',
          answer: 'Dans la section "Utilisateurs", cliquez sur "Inviter" et saisissez les emails des enseignants.',
          category: 'general',
          views: 890
        },
        {
          id: '3',
          question: 'Problèmes de paiement',
          answer: 'Si vous rencontrez des problèmes de paiement, vérifiez vos informations bancaires dans la section Facturation.',
          category: 'facturation',
          views: 654
        }
      ];

      setTickets(mockTickets);
      setFaqs(mockFAQs);
    } catch (error) {
      console.error('Error fetching support data:', error);
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
      const ticket: Ticket = {
        id: Date.now().toString(),
        subject: newTicket.subject,
        description: newTicket.description,
        status: 'open',
        priority: newTicket.priority as 'low' | 'medium' | 'high' | 'urgent',
        created_at: new Date().toISOString().split('T')[0],
        updated_at: new Date().toISOString().split('T')[0],
        category: newTicket.category
      };

      setTickets([ticket, ...tickets]);
      setNewTicket({ subject: "", description: "", category: "general", priority: "medium" });
      
      toast({
        title: "Ticket créé",
        description: "Votre demande de support a été soumise avec succès",
      });
    } catch (error) {
      console.error('Error creating ticket:', error);
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
              <CardTitle>Questions fréquentes</CardTitle>
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
                  <p><strong>Support général:</strong></p>
                  <p className="text-muted-foreground">support@evalscol.com</p>
                </div>
                <div className="space-y-2">
                  <p><strong>Support technique:</strong></p>
                  <p className="text-muted-foreground">tech@evalscol.com</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  Réponse sous 24h en moyenne
                </div>
                <Button asChild>
                  <a href="mailto:support@evalscol.com">
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
                  <p><strong>France:</strong></p>
                  <p className="text-muted-foreground">+33 1 23 45 67 89</p>
                </div>
                <div className="space-y-2">
                  <p><strong>Horaires:</strong></p>
                  <p className="text-muted-foreground">Lun-Ven: 9h-18h</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  Support disponible maintenant
                </div>
                <Button asChild>
                  <a href="tel:+33123456789">
                    <Phone className="h-4 w-4 mr-2" />
                    Appeler maintenant
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Chat en direct</CardTitle>
              <CardDescription>
                Discutez directement avec notre équipe support
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">Chat indisponible</h3>
                <p className="text-muted-foreground mb-4">
                  Le chat en direct sera bientôt disponible
                </p>
                <Button disabled>
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Démarrer un chat
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resources" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
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
                  <Button variant="outline" className="w-full justify-start">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Guide de démarrage
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Manuel utilisateur
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Documentation API
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
                  <Button variant="outline" className="w-full justify-start">
                    <Video className="h-4 w-4 mr-2" />
                    Configuration initiale
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Video className="h-4 w-4 mr-2" />
                    Créer des évaluations
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Video className="h-4 w-4 mr-2" />
                    Générer des bulletins
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
                <div className="flex items-center justify-between">
                  <span>API EvalScol</span>
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Opérationnel
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Base de données</span>
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Opérationnel
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Assistant IA</span>
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Opérationnel
                  </Badge>
                </div>
                <Button variant="outline" className="w-full">
                  Voir l'état complet
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
