import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, Bell, Shield, Smartphone, HelpCircle, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";

export default function ParentGuide() {
  const navigate = useNavigate();

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(59, 130, 246);
    doc.text("Guide du Portail Parent", pageWidth / 2, 20, { align: "center" });
    
    doc.setFontSize(16);
    doc.setTextColor(100, 100, 100);
    doc.text("EvalScol Africa", pageWidth / 2, 30, { align: "center" });
    
    let yPos = 45;
    
    // Sections
    sections.forEach((section, index) => {
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
      
      doc.setFontSize(14);
      doc.setTextColor(59, 130, 246);
      doc.text(`${index + 1}. ${section.title}`, 15, yPos);
      yPos += 8;
      
      doc.setFontSize(10);
      doc.setTextColor(60, 60, 60);
      section.steps.forEach((step, stepIndex) => {
        const lines = doc.splitTextToSize(`  ${stepIndex + 1}. ${step}`, pageWidth - 30);
        lines.forEach((line: string) => {
          if (yPos > 280) {
            doc.addPage();
            yPos = 20;
          }
          doc.text(line, 20, yPos);
          yPos += 5;
        });
      });
      yPos += 5;
    });
    
    // FAQ Section
    if (yPos > 240) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.setFontSize(16);
    doc.setTextColor(59, 130, 246);
    doc.text("Questions Fréquentes (FAQ)", 15, yPos);
    yPos += 10;
    
    faqs.forEach((faq, index) => {
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
      
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      const questionLines = doc.splitTextToSize(`Q${index + 1}: ${faq.question}`, pageWidth - 30);
      questionLines.forEach((line: string) => {
        doc.text(line, 15, yPos);
        yPos += 5;
      });
      
      doc.setFontSize(10);
      doc.setTextColor(60, 60, 60);
      const answerLines = doc.splitTextToSize(`R: ${faq.answer}`, pageWidth - 30);
      answerLines.forEach((line: string) => {
        if (yPos > 280) {
          doc.addPage();
          yPos = 20;
        }
        doc.text(line, 15, yPos);
        yPos += 5;
      });
      yPos += 5;
    });
    
    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `EvalScol Africa - evalscolafrica@siteteck.com - Page ${i}/${pageCount}`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: "center" }
      );
    }
    
    doc.save("Guide_Portail_Parent_EvalScol.pdf");
  };

  const sections = [
    {
      icon: Smartphone,
      title: "Accéder au Portail",
      steps: [
        "Rendez-vous sur le portail parent EvalScol",
        "Utilisez l'email et le mot de passe fournis par l'école",
        "Cliquez sur 'Se connecter' pour accéder aux bulletins",
      ]
    },
    {
      icon: FileText,
      title: "Consulter les Bulletins",
      steps: [
        "Après connexion, vous verrez tous les bulletins disponibles",
        "Cliquez sur un bulletin pour voir les détails",
        "Consultez les notes par matière et les appréciations",
      ]
    },
    {
      icon: Download,
      title: "Télécharger les Rapports",
      steps: [
        "Cliquez sur le bouton 'Télécharger PDF' sur chaque bulletin",
        "Le rapport sera téléchargé sur votre appareil",
        "Vous pouvez l'imprimer ou le conserver numériquement",
      ]
    },
    {
      icon: Bell,
      title: "Recevoir des Notifications",
      steps: [
        "Activez les notifications dans les paramètres",
        "Recevez des alertes pour les nouveaux bulletins",
        "Soyez informé des événements importants de l'école",
      ]
    },
    {
      icon: Shield,
      title: "Sécurité et Confidentialité",
      steps: [
        "Vos données sont protégées par authentification sécurisée",
        "Ne partagez jamais votre mot de passe",
        "Déconnectez-vous après chaque session sur appareil partagé",
      ]
    },
    {
      icon: HelpCircle,
      title: "Aide et Support",
      steps: [
        "Consultez la FAQ pour les questions courantes",
        "Contactez l'administration de l'école en cas de problème",
        "Signalez tout problème technique au support EvalScol",
      ]
    },
  ];

  const faqs = [
    {
      question: "Comment obtenir mes identifiants ?",
      answer: "Les identifiants sont fournis par l'administration de votre école. Contactez-les si vous ne les avez pas reçus."
    },
    {
      question: "Que faire si j'ai oublié mon mot de passe ?",
      answer: "Utilisez la fonction 'Mot de passe oublié' sur la page de connexion ou contactez l'école pour réinitialiser votre mot de passe."
    },
    {
      question: "Puis-je consulter les bulletins sur mon téléphone ?",
      answer: "Oui, le portail parent est accessible depuis n'importe quel appareil : ordinateur, tablette ou smartphone."
    },
    {
      question: "Les bulletins sont-ils disponibles immédiatement ?",
      answer: "Les bulletins sont publiés par l'école selon le calendrier scolaire. Vous recevrez une notification dès qu'un nouveau bulletin est disponible."
    },
    {
      question: "Comment contacter les enseignants ?",
      answer: "Utilisez les coordonnées fournies dans le bulletin ou contactez directement l'administration de l'école."
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <header className="mb-12">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/")}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour à l'accueil
          </Button>
          
          <div className="text-center">
            <img 
              src="/logo.png" 
              alt="EvalScol Logo" 
              className="h-20 w-auto mx-auto mb-4"
            />
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Guide Parent EvalScol
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Tout ce que vous devez savoir pour suivre la scolarité de votre enfant sur le portail parent
            </p>
          </div>
        </header>

        {/* Quick Access */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <Card className="p-6 bg-primary/5 border-primary/20">
            <h3 className="font-semibold text-lg mb-3">Accès Rapide</h3>
            <div className="space-y-3">
              <Button 
                className="w-full justify-start" 
                onClick={() => navigate("/parent-portal")}
              >
                <FileText className="h-4 w-4 mr-2" />
                Accéder au Portail Parent
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => navigate("/parent-portal")}
              >
                <Smartphone className="h-4 w-4 mr-2" />
                Voir la Démo Interactive
              </Button>
            </div>
          </Card>

          <Card className="p-6 bg-accent/5 border-accent/20">
            <h3 className="font-semibold text-lg mb-3">Ressources</h3>
            <div className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={handleDownloadPDF}
              >
                <Download className="h-4 w-4 mr-2" />
                Télécharger le Guide PDF
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => navigate("/support")}
              >
                <HelpCircle className="h-4 w-4 mr-2" />
                Support Technique
              </Button>
            </div>
          </Card>
        </div>

        {/* Instructions Step by Step */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6 text-center">Guide d'Utilisation</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sections.map((section, index) => (
              <Card key={index} className="p-6">
                <div className="flex items-start gap-3 mb-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <section.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{section.title}</h3>
                  </div>
                </div>
                <ol className="space-y-2">
                  {section.steps.map((step, stepIndex) => (
                    <li key={stepIndex} className="flex items-start gap-2 text-sm">
                      <span className="font-semibold text-primary min-w-[20px]">{stepIndex + 1}.</span>
                      <span className="text-muted-foreground">{step}</span>
                    </li>
                  ))}
                </ol>
              </Card>
            ))}
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6 text-center">FAQ</h2>
          <div className="space-y-4 max-w-3xl mx-auto">
            {faqs.map((faq, index) => (
              <Card key={index} className="p-6">
                <h3 className="font-semibold text-lg mb-2 flex items-start gap-2">
                  <HelpCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  {faq.question}
                </h3>
                <p className="text-muted-foreground ml-7">{faq.answer}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* Contact Section */}
        <Card className="p-8 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Besoin d'Aide Supplémentaire ?</h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Notre équipe de support est disponible pour répondre à toutes vos questions concernant 
              l'utilisation du portail parent EvalScol.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button 
                size="lg"
                onClick={() => navigate("/support")}
              >
                Contacter le Support
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => window.open("mailto:evalscolafrica@siteteck.com?subject=Question Parent")}
              >
                Envoyer un Message
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
