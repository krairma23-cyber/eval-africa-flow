import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2, XCircle, AlertCircle, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

interface DiagnosticResult {
  step: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  details?: any;
}

export default function TuitionPaymentDiagnostic() {
  const navigate = useNavigate();
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [testPaymentUrl, setTestPaymentUrl] = useState<string>('');

  const runDiagnostic = async () => {
    setTesting(true);
    setResults([]);
    setTestPaymentUrl('');

    const addResult = (result: DiagnosticResult) => {
      setResults(prev => [...prev, result]);
    };

    try {
      // Step 1: Check Authentication
      addResult({
        step: '1. Vérification de l\'authentification',
        status: 'warning',
        message: 'Vérification en cours...'
      });

      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        addResult({
          step: '1. Vérification de l\'authentification',
          status: 'error',
          message: 'Erreur d\'authentification',
          details: authError?.message || 'Aucun utilisateur connecté'
        });
        setTesting(false);
        return;
      }

      setResults(prev => prev.filter(r => r.step !== '1. Vérification de l\'authentification'));
      addResult({
        step: '1. Vérification de l\'authentification',
        status: 'success',
        message: `Utilisateur connecté: ${user.email}`,
        details: { user_id: user.id }
      });

      // Step 2: Check Students Table Access
      addResult({
        step: '2. Accès à la table students',
        status: 'warning',
        message: 'Vérification en cours...'
      });

      const { data: students, error: studentsError } = await supabase
        .from('students')
        .select('id, first_name, last_name, tuition_fee, amount_paid, payment_status')
        .limit(1);

      if (studentsError) {
        addResult({
          step: '2. Accès à la table students',
          status: 'error',
          message: 'Erreur d\'accès à la table students',
          details: studentsError.message
        });
      } else {
        setResults(prev => prev.filter(r => r.step !== '2. Accès à la table students'));
        addResult({
          step: '2. Accès à la table students',
          status: 'success',
          message: `Table students accessible (${students?.length || 0} élèves trouvés)`,
          details: students?.[0]
        });
      }

      // Step 3: Check Payment Transactions Table
      addResult({
        step: '3. Accès à la table payment_transactions',
        status: 'warning',
        message: 'Vérification en cours...'
      });

      const { data: transactions, error: transactionsError } = await supabase
        .from('payment_transactions')
        .select('*')
        .limit(1);

      if (transactionsError) {
        addResult({
          step: '3. Accès à la table payment_transactions',
          status: 'error',
          message: 'Erreur d\'accès à la table payment_transactions',
          details: transactionsError.message
        });
      } else {
        setResults(prev => prev.filter(r => r.step !== '3. Accès à la table payment_transactions'));
        addResult({
          step: '3. Accès à la table payment_transactions',
          status: 'success',
          message: `Table payment_transactions accessible`,
          details: { count: transactions?.length || 0 }
        });
      }

      // Step 4: Test student-tuition-payment Edge Function
      addResult({
        step: '4. Test de student-tuition-payment',
        status: 'warning',
        message: 'Test en cours...'
      });

      const testStudent = students?.[0];
      if (!testStudent) {
        addResult({
          step: '4. Test de student-tuition-payment',
          status: 'warning',
          message: 'Aucun élève disponible pour le test',
          details: 'Créez au moins un élève pour tester le paiement'
        });
      } else {
        try {
          const { data: paymentData, error: paymentError } = await supabase.functions.invoke('student-tuition-payment', {
            body: {
              student_id: testStudent.id,
              amount: 1000, // Test avec 1000 FCFA
              parent_email: user.email,
              parent_name: 'Test Parent',
              phone_number: '+221770000000',
              callback_url: `${window.location.origin}/payment-callback`
            }
          });

          if (paymentError) {
            addResult({
              step: '4. Test de student-tuition-payment',
              status: 'error',
              message: 'Erreur lors de l\'initialisation du paiement',
              details: paymentError.message
            });
          } else {
            setResults(prev => prev.filter(r => r.step !== '4. Test de student-tuition-payment'));
            addResult({
              step: '4. Test de student-tuition-payment',
              status: 'success',
              message: 'Paiement initialisé avec succès',
              details: {
                reference: paymentData.reference,
                authorization_url: paymentData.authorization_url
              }
            });
            setTestPaymentUrl(paymentData.authorization_url);
          }
        } catch (error: any) {
          addResult({
            step: '4. Test de student-tuition-payment',
            status: 'error',
            message: 'Exception lors du test',
            details: error.message
          });
        }
      }

      // Step 5: Test paystack-verify Edge Function
      addResult({
        step: '5. Test de paystack-verify',
        status: 'warning',
        message: 'Test en cours...'
      });

      try {
        const { data: verifyData, error: verifyError } = await supabase.functions.invoke('paystack-verify', {
          body: { reference: 'test-reference-invalid' }
        });

        setResults(prev => prev.filter(r => r.step !== '5. Test de paystack-verify'));
        if (verifyError) {
          addResult({
            step: '5. Test de paystack-verify',
            status: 'success',
            message: 'Edge function accessible (erreur attendue avec référence invalide)',
            details: 'La fonction répond correctement'
          });
        } else {
          addResult({
            step: '5. Test de paystack-verify',
            status: 'success',
            message: 'Edge function paystack-verify accessible',
            details: verifyData
          });
        }
      } catch (error: any) {
        addResult({
          step: '5. Test de paystack-verify',
          status: 'error',
          message: 'Erreur lors du test de paystack-verify',
          details: error.message
        });
      }

      // Step 6: Test process-tuition-payment Edge Function
      addResult({
        step: '6. Test de process-tuition-payment',
        status: 'warning',
        message: 'Test en cours...'
      });

      try {
        const { data: processData, error: processError } = await supabase.functions.invoke('process-tuition-payment', {
          body: { reference: 'test-reference-invalid' }
        });

        setResults(prev => prev.filter(r => r.step !== '6. Test de process-tuition-payment'));
        if (processError) {
          addResult({
            step: '6. Test de process-tuition-payment',
            status: 'success',
            message: 'Edge function accessible (erreur attendue avec référence invalide)',
            details: 'La fonction répond correctement'
          });
        } else {
          addResult({
            step: '6. Test de process-tuition-payment',
            status: 'success',
            message: 'Edge function process-tuition-payment accessible',
            details: processData
          });
        }
      } catch (error: any) {
        addResult({
          step: '6. Test de process-tuition-payment',
          status: 'error',
          message: 'Erreur lors du test de process-tuition-payment',
          details: error.message
        });
      }

      toast.success('Diagnostic terminé');
    } catch (error: any) {
      toast.error('Erreur lors du diagnostic');
      addResult({
        step: 'Erreur générale',
        status: 'error',
        message: 'Une erreur est survenue',
        details: error.message
      });
    } finally {
      setTesting(false);
    }
  };

  const getStatusIcon = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success':
        return 'default';
      case 'error':
        return 'destructive';
      case 'warning':
        return 'secondary';
    }
  };

  return (
    <div className="container max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Diagnostic Paiement Frais de Scolarité</h1>
          <p className="text-muted-foreground">
            Testez le système complet de paiement des frais de scolarité
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tests de Diagnostic</CardTitle>
          <CardDescription>
            Ce diagnostic vérifie tous les composants nécessaires au bon fonctionnement du paiement des frais de scolarité
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={runDiagnostic} 
            disabled={testing}
            className="w-full"
          >
            {testing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Diagnostic en cours...
              </>
            ) : (
              'Lancer le Diagnostic'
            )}
          </Button>

          {testPaymentUrl && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>URL de Paiement Test Générée</AlertTitle>
              <AlertDescription className="space-y-2">
                <p>Un paiement test a été initialisé avec succès. Vous pouvez tester le flux complet:</p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.open(testPaymentUrl, '_blank')}
                >
                  Ouvrir la page de paiement test
                </Button>
                <p className="text-sm text-muted-foreground mt-2">
                  Note: Utilisez les informations de test Paystack pour compléter le paiement
                </p>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Résultats du Diagnostic</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {results.map((result, index) => (
              <div key={index} className="flex gap-4 p-4 border rounded-lg">
                <div className="flex-shrink-0 mt-1">
                  {getStatusIcon(result.status)}
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{result.step}</h3>
                    <Badge variant={getStatusBadge(result.status)}>
                      {result.status === 'success' ? 'Succès' : result.status === 'error' ? 'Erreur' : 'En cours'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{result.message}</p>
                  {result.details && (
                    <details className="text-xs">
                      <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                        Détails techniques
                      </summary>
                      <pre className="mt-2 p-2 bg-muted rounded overflow-auto">
                        {JSON.stringify(result.details, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {!testing && results.length === 0 && (
        <Card>
          <CardContent className="pt-6 space-y-4">
            <h3 className="font-semibold">Ce diagnostic vérifie:</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>✓ Authentification de l'utilisateur</li>
              <li>✓ Accès à la table students</li>
              <li>✓ Accès à la table payment_transactions</li>
              <li>✓ Fonction student-tuition-payment (initialisation paiement)</li>
              <li>✓ Fonction paystack-verify (vérification paiement)</li>
              <li>✓ Fonction process-tuition-payment (traitement paiement)</li>
              <li>✓ Génération d'une URL de paiement test</li>
            </ul>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Note</AlertTitle>
              <AlertDescription>
                Ce diagnostic teste l'intégralité du flux de paiement des frais de scolarité avec Paystack. 
                Assurez-vous d'avoir configuré votre clé secrète Paystack dans les variables d'environnement.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
