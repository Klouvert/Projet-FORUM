# Arbre Intelligence — Project Reference

## Mission

Forum délibératif visuel : les idées poussent comme un arbre. Le tronc porte les valeurs communes, les branches représentent les domaines, les nœuds représentent les idées à différents stades de maturité.

## Scope

- Dépôt d'idées structurées par domaine et niveau de maturité
- Vote, argumentation, amendement des idées
- Visualisation en mindmap organique (D3.js)
- Authentification utilisateur (JWT)

## Stack

| Couche | Technologie |
|---|---|
| Backend | .NET 10, ASP.NET Core, EF Core, Identity |
| Base de données | SQLite (dev) / PostgreSQL (prod) |
| Frontend | React 19, TypeScript, Vite, Axios, D3.js |
| Auth | JWT Bearer, `IdentityCore` |
| Backend URL | `http://localhost:5215` |
| Frontend URL | `http://localhost:5173` |
| Env var frontend | `VITE_API_URL=http://localhost:5215/api` |

## Architecture backend

**Entités :** `Idea`, `Branch`, `TrunkValue`, `Argument`, `Amendment`, `*Vote`

**Enums :**
- `IdeaLevel` : `Bud` (0) / `Flower` (1) / `Fruit` (2) / `Leaf` (3)
- `IdeaDomain` : `Ecology` / `Social` / `Economy` / `Culture`

**Controllers :** `TreeController`, `IdeasController`, `AuthController`, `BranchesController`, `AmendmentsController`, `ArgumentsController`

**DbContext :** `IdentityDbContext<ApplicationUser, IdentityRole<Guid>, Guid>`

**Migrations :** `Migrations/Sqlite/` — `InitialCreate` + `AddIdeaDomain`

**Règles backend :**
- `[Authorize]` sur toutes les routes d'écriture
- Validation : titre ≤ 200, contenu ≤ 2000, branche ≤ 100 chars
- Retour d'erreur : `{ error: "..." }`
- Dev : `EnsureCreated` (SQLite) / Prod : `Migrate` (PostgreSQL)

## Architecture frontend

**Auth :** `AuthContext` + `useAuth` — token dans `localStorage`

**Composants clés :**
- `TreeCanvas.tsx` — D3, AbortController, ErrorBanner
- `useTree.ts` — voteIdea, voteArgument, addArgument, addAmendment, createIdea, promoteIdea, createBranch
- `VoteSlider` — états async (Envoi… / ✓ / ✗)
- Modales : `BourGeonModal`, `FleurModal`, `FruitModal`, `FeuilleModal`, `CreateIdeaModal`
- `SearchPanel`, `Sidebar`, `ErrorBoundary`

## Conventions botaniques

| Niveau | Enum | Label FR | Emoji |
|---|---|---|---|
| 0 | `IdeaLevel.Bud` | Bourgeon | 🌱 |
| 1 | `IdeaLevel.Flower` | Fleur | 🌸 |
| 2 | `IdeaLevel.Fruit` | Fruit | 🍊 |
| 3 | `IdeaLevel.Leaf` | Feuille | 🍃 |

Termes interdits : `Seed`, `Sprout`, `Canopy` (hors contexte botanique explicite).

## Priorités produit

1. Corriger le fonctionnel cassé
2. Connecter API ↔ UI
3. Améliorer l'UX
4. Affiner le visuel

Ne pas lancer de refonte visuelle lourde avant que les flux API/UI soient stables.

## Phases

| Phase | Titre | État |
|---|---|---|
| 1 | Backend complet + stabilité frontend | ✅ Complète |
| 2 | UI visuelle — mindmap organique | ✅ Complète |
| 3 | Déploiement Azure | ⏳ À venir |
| 4 | Préparation contributeurs (README, CONTRIBUTING, docker-compose) | ⏳ À venir |
