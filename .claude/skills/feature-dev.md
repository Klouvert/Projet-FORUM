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

## Icônes — convention obligatoire

Utiliser **uniquement des icônes Lucide SVG** (`lucide-react`) — jamais d'emojis ni de caractères texte (`×`, `🗑`, etc.) pour les boutons d'action.

Icônes standard :
- Modifier : `<Pencil size={13} />`
- Supprimer (principal, 28×28) : `<Trash2 size={14} />`
- Supprimer (inline dans liste, 24×24) : `<Trash2 size={13} />`

Tailles des boutons :
- Bouton principal (header modal, sidebar) : `width: '28px', height: '28px'`
- Bouton inline (dans liste d'items) : `width: '24px', height: '24px'`
- Toujours : `padding: '0', display: 'inline-flex', alignItems: 'center', justifyContent: 'center'`

Couleurs :
- Modifier : `background: 'var(--bg-card)'`, `border: '1px solid var(--border)'`, `color: 'var(--text-secondary)'`
- Supprimer : `background: 'rgba(229,57,53,0.12)'`, `border: '1px solid #e53935'`, `color: '#e57373'`

## Validation entre phases

Ne pas démarrer la phase suivante sans confirmation explicite de l'utilisateur.
