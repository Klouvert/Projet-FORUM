# Feature Dev — Règles pour ce projet

## Avant de coder

1. Lire `CURRENT_STATE.md` — vérifier la phase et les problèmes ouverts
2. Lire les fichiers concernés avec `Read` — ne jamais supposer leur contenu
3. Si la tâche touche `TreeCanvas.tsx` ou le mindmap : lire `SKILLS/phase2-mindmap.md`

## Périmètre des modifications

- Modifications minimales et localisées — ne pas refactorer ce qui n'est pas dans la tâche
- Backend : ne pas modifier les migrations SQLite existantes — créer une nouvelle migration
- Frontend : `VITE_API_URL` doit pointer sur `http://localhost:5215/api`
- Ne pas mélanger une tâche backend et une tâche frontend dans le même commit

## Ordre de travail standard

1. Backend : modèle → migration → controller → DTO
2. Frontend : types → hook (`useTree.ts`) → composant → modale si besoin
3. Tester manuellement le flux complet avant de proposer le commit

## Commits

Format : `type(scope): message`

Types : `feat`, `fix`, `refactor`, `chore`, `style`

Exemples :
- `feat(ideas): ajouter endpoint de suppression d'idée`
- `fix(treecanvas): corriger la position du tronc sur petit écran`
- `chore: mettre à jour CURRENT_STATE.md`

Proposer un commit après chaque étape fonctionnelle. Ne pas enchaîner deux tâches sans checkpoint git.

## Validation entre phases

Ne pas démarrer la phase suivante sans confirmation explicite de l'utilisateur.
