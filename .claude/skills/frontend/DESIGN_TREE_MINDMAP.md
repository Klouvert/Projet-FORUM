# 🌳 Mindmap Organique — Spécification Fonctionnelle & Visuelle

## 🎯 Objectif
Transformer le graphe actuel en un mindmap organique, où chaque idée pousse comme une branche d'arbre vivante.
Le rendu doit être naturel, fluide, lisible et cohérent avec la métaphore :
Idée → Bourgeon → Fleur → Fruit → Feuille → Branche qui grandit.

## 🌱 1. Tronc (origine du mindmap)
Le tronc est une image ou un SVG placé comme point d'origine.

- Style : texture douce, couleurs naturelles, ombres légères.
- Le tronc ne bouge pas ; les branches partent de lui.
- Le tronc doit être cohérent avec le style des branches.

## 🌿 2. Branches organiques (liens du mindmap)
Les branches remplacent les liens D3 actuels.

Caractéristiques :
- Courbes de Bézier (pas de segments droits).
- Épaisseur variable selon la maturité de l'idée.
- Couleur évolutive : brun → vert doux.
- Légère asymétrie pour un rendu naturel.
- Transitions fluides lors de la croissance.

## 🌸 3. États visuels des idées (bourgeon → fleur → fruit → feuille)
Chaque idée possède un état visuel inspiré des images fournies.

États :
- Bourgeon : petit, discret, couleur douce.
- Fleur : pétales visibles, style proche de l'image fournie.
- Fruit : forme ronde, couleur saturée.
- Feuille : forme simple, verte, finale.

Effets — à chaque changement d'état :
- la branche s'allonge légèrement,
- l'épaisseur augmente,
- la couleur évolue,
- le nœud visuel change avec une transition douce.

## 🌬️ 4. Animations
- Croissance de la branche : 0.2–0.3s, easing naturel.
- Apparition des nœuds : fade + scale.
- Optionnel : légère oscillation ("sway") pour un effet vivant.
- Les animations doivent rester subtiles et non intrusives.

## 🎨 5. Style général
- Couleurs naturelles (bruns, verts, roses doux).
- Contours doux, ombres légères.
- Pas de style cartoon exagéré.
- Pas de style hyper‑réaliste.

## 🧱 6. Intégration technique
- Utilisation de D3 pour les courbes et transitions.
- Memoization pour éviter les recalculs inutiles.
- Optimisation des performances lors des animations.
- Compatibilité avec le layout actuel du TreeCanvas.

## 🧭 7. Roadmap Mindmap (pour implémentation)

**Phase 2.1 — Fondations visuelles**
- Intégrer le tronc.
- Définir la palette et les styles de base.
- Préparer le layout pour accueillir l'arbre.

**Phase 2.2 — Branches organiques**
- Remplacer les liens par des courbes de Bézier.
- Ajouter épaisseur variable + couleur évolutive.
- Implémenter la croissance progressive.

**Phase 2.3 — Nœuds visuels**
- Créer les 4 états visuels.
- Ajouter transitions et animations.
- Synchroniser avec la croissance des branches.

**Phase 2.4 — Finalisation**
- Ajouter la légende.
- Ajuster les interactions (hover, sélection).
- Optimiser les performances.

## 📌 8. Règle importante pour Claude
Claude doit toujours se référer à ce fichier pour toute modification du TreeCanvas, du mindmap, des branches, ou des états visuels.
