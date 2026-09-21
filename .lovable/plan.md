# Plan : animations Framer Motion sur la page d’accueil

## Objectif
Rendre la page d’accueil plus fluide et vivante avec des animations discrètes, sans modifier son contenu ni ralentir la navigation.

## Modifications prévues
- Utiliser la bibliothèque Framer Motion déjà installée dans le projet.
- Animer progressivement le logo, le titre, les bénéfices et les boutons lors de l’ouverture de la page.
- Faire apparaître les blocs principaux au défilement, une seule fois, avec un léger décalage entre les éléments.
- Ajouter des réactions sobres aux boutons et cartes lors du survol ou du clic.
- Respecter automatiquement le réglage système « réduire les animations » pour l’accessibilité.
- Vérifier le rendu sur ordinateur et mobile, ainsi que l’absence d’erreurs dans la page.

## Détails techniques
- Centraliser les variantes d’animation dans un petit composant réutilisable.
- Employer `motion`, `whileInView`, `viewport` et `useReducedMotion`.
- Conserver les couleurs, textes, liens et fonctions actuels.
