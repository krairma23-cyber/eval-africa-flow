import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { 
  Bell, 
  Check, 
  X, 
  Settings,
  Mail,
  MessageSquare,
  AlertTriangle,
  Info,
  CheckCircle,
  Trash2,
  MailOpen
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { logError } from "@/lib/logger";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  created_at: string;
  action_url?: string;
}

interface NotificationSettings {
  email_notifications: boolean;
  push_notifications: boolean;
  assessment_reminders: boolean;
  report_notifications: boolean;
  system_updates: boolean;
  marketing_emails: boolean;
}

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [settings, setSettings] = useState<NotificationSettings>({
    email_notifications: true,
    push_notifications: true,
    assessment_reminders: true,
    report_notifications: true,
    system_updates: true,
    marketing_emails: false
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchNotifications();
    fetchSettings();
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setNotifications(data || []);
    } catch (error) {
      await logError('Failed to fetch notifications', error, {
        component: 'Notifications',
        action: 'FETCH_NOTIFICATIONS'
      });
      toast({
        title: "Erreur",
        description: "Impossible de charger les notifications",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setSettings({
          email_notifications: data.email_notifications,
          push_notifications: data.push_notifications,
          assessment_reminders: data.assessment_reminders,
          report_notifications: data.report_notifications,
          system_updates: data.system_updates,
          marketing_emails: data.marketing_emails,
        });
      }
    } catch (error) {
      await logError('Failed to fetch settings', error, {
        component: 'Notifications',
        action: 'FETCH_SETTINGS'
      });
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(notifications.map(notif => 
        notif.id === notificationId ? { ...notif, read: true } : notif
      ));
      
      toast({
        title: "Notification marquée comme lue",
      });
    } catch (error) {
      await logError('Failed to mark notification as read', error, {
        component: 'Notifications',
        action: 'MARK_READ'
      });
    }
  };

  const markAsUnread = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: false })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(notifications.map(notif => 
        notif.id === notificationId ? { ...notif, read: false } : notif
      ));
      
      toast({
        title: "Notification marquée comme non lue",
      });
    } catch (error) {
      await logError('Failed to mark notification as unread', error, {
        component: 'Notifications',
        action: 'MARK_UNREAD'
      });
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(notifications.filter(notif => notif.id !== notificationId));
      
      toast({
        title: "Notification supprimée",
      });
    } catch (error) {
      await logError('Failed to delete notification', error, {
        component: 'Notifications',
        action: 'DELETE'
      });
    }
  };

  const markAllAsRead = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false);

      if (error) throw error;

      setNotifications(notifications.map(notif => ({ ...notif, read: true })));
      
      toast({
        title: "Toutes les notifications marquées comme lues",
      });
    } catch (error) {
      await logError('Failed to mark all as read', error, {
        component: 'Notifications',
        action: 'MARK_ALL_READ'
      });
    }
  };

  const updateSettings = async (key: keyof NotificationSettings, value: boolean) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const newSettings = { ...settings, [key]: value };
      
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          ...newSettings,
        });

      if (error) throw error;

      setSettings(newSettings);
      
      toast({
        title: "Paramètres mis à jour",
        description: "Vos préférences de notification ont été sauvegardées",
      });
    } catch (error) {
      await logError('Failed to update settings', error, {
        component: 'Notifications',
        action: 'UPDATE_SETTINGS'
      });
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour les paramètres",
        variant: "destructive",
      });
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'error': return <X className="h-5 w-5 text-red-500" />;
      default: return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success': return 'border-l-green-500';
      case 'warning': return 'border-l-yellow-500';
      case 'error': return 'border-l-red-500';
      default: return 'border-l-blue-500';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return `Il y a ${Math.floor(diffInHours * 60)} minutes`;
    } else if (diffInHours < 24) {
      return `Il y a ${Math.floor(diffInHours)} heures`;
    } else {
      return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted animate-pulse rounded" />
        <div className="space-y-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Bell className="h-8 w-8" />
            Notifications
            {unreadCount > 0 && (
              <Badge variant="destructive">{unreadCount}</Badge>
            )}
          </h1>
          <p className="text-muted-foreground">
            Gérez vos notifications et préférences
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={markAllAsRead}>
            <Check className="h-4 w-4 mr-2" />
            Tout marquer comme lu
          </Button>
        </div>
      </div>

      <Tabs defaultValue="notifications" className="space-y-6">
        <TabsList>
          <TabsTrigger value="notifications">
            Notifications {unreadCount > 0 && `(${unreadCount})`}
          </TabsTrigger>
          <TabsTrigger value="settings">Paramètres</TabsTrigger>
        </TabsList>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notifications récentes</CardTitle>
              <CardDescription>
                Vos dernières notifications et alertes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {notifications.length === 0 ? (
                  <div className="text-center py-8">
                    <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="font-semibold mb-2">Aucune notification</h3>
                    <p className="text-muted-foreground">
                      Vous n'avez aucune notification pour le moment
                    </p>
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div 
                      key={notification.id} 
                      className={`border-l-4 ${getNotificationColor(notification.type)} p-4 rounded-lg ${
                        notification.read ? 'bg-muted/30' : 'bg-card'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          {getNotificationIcon(notification.type)}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className={`font-medium ${!notification.read ? 'font-semibold' : ''}`}>
                                {notification.title}
                              </h3>
                              {!notification.read && (
                                <div className="w-2 h-2 bg-primary rounded-full" />
                              )}
                            </div>
                            <p className="text-muted-foreground text-sm mb-2">
                              {notification.message}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span>{formatDate(notification.created_at)}</span>
                              {notification.action_url && (
                                <Button variant="link" size="sm" className="h-auto p-0 text-xs">
                                  Voir détails
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 ml-4">
                          {notification.read ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markAsUnread(notification.id)}
                            >
                              <MailOpen className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markAsRead(notification.id)}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          )}
                          
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="text-destructive">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Supprimer la notification</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Cette action est irréversible. La notification sera définitivement supprimée.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deleteNotification(notification.id)}>
                                  Supprimer
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Préférences de notification
              </CardTitle>
              <CardDescription>
                Configurez comment et quand vous souhaitez être notifié
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Notifications par email
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Recevoir des notifications importantes par email
                    </p>
                  </div>
                  <Switch
                    checked={settings.email_notifications}
                    onCheckedChange={(value) => updateSettings('email_notifications', value)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="flex items-center gap-2">
                      <Bell className="h-4 w-4" />
                      Notifications push
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Recevoir des notifications push dans le navigateur
                    </p>
                  </div>
                  <Switch
                    checked={settings.push_notifications}
                    onCheckedChange={(value) => updateSettings('push_notifications', value)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Rappels d'évaluations</Label>
                    <p className="text-sm text-muted-foreground">
                      Rappels pour les évaluations à venir et à corriger
                    </p>
                  </div>
                  <Switch
                    checked={settings.assessment_reminders}
                    onCheckedChange={(value) => updateSettings('assessment_reminders', value)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Notifications de bulletins</Label>
                    <p className="text-sm text-muted-foreground">
                      Être notifié quand les bulletins sont prêts ou modifiés
                    </p>
                  </div>
                  <Switch
                    checked={settings.report_notifications}
                    onCheckedChange={(value) => updateSettings('report_notifications', value)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Mises à jour système</Label>
                    <p className="text-sm text-muted-foreground">
                      Notifications sur les nouvelles fonctionnalités et mises à jour
                    </p>
                  </div>
                  <Switch
                    checked={settings.system_updates}
                    onCheckedChange={(value) => updateSettings('system_updates', value)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Emails marketing</Label>
                    <p className="text-sm text-muted-foreground">
                      Recevoir des emails sur les nouveautés et promotions
                    </p>
                  </div>
                  <Switch
                    checked={settings.marketing_emails}
                    onCheckedChange={(value) => updateSettings('marketing_emails', value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Canaux de notification</CardTitle>
              <CardDescription>
                Choisissez comment recevoir vos notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <Mail className="h-5 w-5 text-primary" />
                    <div>
                      <h3 className="font-medium">Email</h3>
                      <p className="text-sm text-muted-foreground">
                        Notifications par email
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <MessageSquare className="h-5 w-5 text-accent" />
                    <div>
                      <h3 className="font-medium">Dans l'application</h3>
                      <p className="text-sm text-muted-foreground">
                        Notifications dans EvalScol
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}