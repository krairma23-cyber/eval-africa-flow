-- Insert FAQ entries for EvalScol
INSERT INTO support_faqs (question, answer, category, published, views) VALUES
('Comment créer une évaluation ?', 'Pour créer une évaluation, rendez-vous dans la section "Évaluations" et cliquez sur "Nouvelle évaluation". Remplissez les informations requises comme le titre, la date, la matière et le type d''évaluation.', 'evaluations', true, 1250),

('Comment ajouter un nouvel élève ?', 'Accédez à la section "Élèves" et cliquez sur le bouton "Ajouter un élève". Complétez le formulaire avec les informations de l''élève (nom, prénom, date de naissance, etc.) puis enregistrez.', 'students', true, 980),

('Comment inscrire un élève dans une classe ?', 'Allez dans "Élèves", sélectionnez l''élève concerné, puis cliquez sur "Inscrire". Choisissez la classe et l''année académique appropriées.', 'students', true, 750),

('Comment attribuer une matière à un enseignant ?', 'Dans la section "Classes", sélectionnez une classe, puis cliquez sur "Attribuer un enseignant". Choisissez la matière et l''enseignant à assigner.', 'teachers', true, 620),

('Comment saisir les notes des élèves ?', 'Rendez-vous dans "Évaluations", sélectionnez l''évaluation souhaitée, puis cliquez sur "Saisir les notes". Entrez les notes pour chaque élève et enregistrez.', 'evaluations', true, 1100),

('Comment générer un bulletin de notes ?', 'Dans la section "Rapports", sélectionnez "Bulletins", choisissez la période et la classe, puis cliquez sur "Générer". Le bulletin sera créé au format PDF.', 'reports', true, 890),

('Puis-je exporter les données en Excel ?', 'Oui, la plupart des sections offrent un bouton "Exporter" qui vous permet de télécharger les données au format Excel (.xlsx) ou CSV.', 'general', true, 540),

('Comment gérer les paiements des élèves ?', 'Accédez à la section "Élèves", sélectionnez un élève, puis cliquez sur "Gérer les paiements". Vous pouvez y enregistrer les paiements et voir l''historique.', 'payments', true, 720),

('Comment créer un emploi du temps ?', 'Dans la section "Emploi du temps", cliquez sur "Nouveau cours". Sélectionnez la classe, la matière, l''enseignant, le jour et l''heure du cours.', 'schedule', true, 480),

('Comment ajouter une nouvelle matière ?', 'Rendez-vous dans "Matières" et cliquez sur "Ajouter une matière". Renseignez le nom, le code et le coefficient de la matière.', 'subjects', true, 410),

('Les parents peuvent-ils consulter les notes ?', 'Oui, si le portail parent est activé, les parents peuvent se connecter avec leurs identifiants pour consulter les notes, absences et bulletins de leurs enfants.', 'parents', true, 680),

('Comment marquer les absences des élèves ?', 'Dans la liste des élèves, utilisez les boutons "Présent" ou "Absent" pour marquer l''assiduité. Vous pouvez aussi gérer les absences depuis la fiche de l''élève.', 'attendance', true, 590),

('Comment modifier une évaluation existante ?', 'Dans "Évaluations", trouvez l''évaluation concernée et cliquez sur le bouton "Modifier". Apportez vos modifications puis enregistrez les changements.', 'evaluations', true, 370),

('Puis-je supprimer un élève par erreur ?', 'Non, le système ne permet pas de supprimer définitivement un élève. Vous pouvez uniquement désinscrire un élève, ce qui conserve son historique dans la base de données.', 'students', true, 290),

('Comment configurer les trimestres/semestres ?', 'Dans "Paramètres", accédez à "Périodes scolaires". Vous pouvez y créer et configurer vos trimestres ou semestres avec leurs dates de début et de fin.', 'general', true, 330),

('Comment ajouter un nouvel enseignant ?', 'Allez dans "Enseignants" et cliquez sur "Ajouter un enseignant". Complétez les informations personnelles et professionnelles puis enregistrez.', 'teachers', true, 420),

('Le système est-il accessible sur mobile ?', 'Oui, EvalScol est entièrement responsive et fonctionne parfaitement sur smartphones et tablettes via votre navigateur web.', 'technique', true, 510),

('Comment imprimer un relevé de notes ?', 'Dans "Rapports", sélectionnez le type de relevé souhaité, choisissez les critères (élève, période, classe) puis cliquez sur "Imprimer" ou "Télécharger PDF".', 'reports', true, 460),

('Puis-je personnaliser les types d''évaluations ?', 'Oui, dans "Paramètres", section "Types d''évaluations", vous pouvez créer vos propres types (interrogation, devoir, examen, etc.) avec leurs coefficients.', 'evaluations', true, 280),

('Comment contacter le support technique ?', 'Vous pouvez créer un ticket de support directement depuis cette page, nous envoyer un email à support@evalscol.com, ou nous appeler au +33 1 23 45 67 89.', 'support', true, 650);