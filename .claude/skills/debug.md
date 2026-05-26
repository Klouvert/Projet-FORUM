# Debug — Procédure de diagnostic

## Ordre de vérification

1. **Backend up ?** → `curl http://localhost:5215/api/tree` (doit retourner JSON)
2. **DB cohérente ?** → vérifier les migrations appliquées
3. **Frontend connecté ?** → vérifier `VITE_API_URL` dans `.env` ou `appsettings`
4. **Auth valide ?** → token dans `localStorage` → decoder sur jwt.io

## Commandes backend utiles

```bash
# Lancer le backend
cd ArbreIntelligence && dotnet run

# Vérifier les migrations appliquées
dotnet ef migrations list

# Réappliquer depuis zéro (dev uniquement)
rm arbre_intelligence.db && dotnet run
```

## Commandes frontend utiles

```bash
cd frontend && npm run dev

# Vérifier les dépendances
npm ls

# Rebuild propre
rm -rf node_modules && npm install
```

## Erreurs fréquentes

| Symptôme | Cause probable | Action |
|---|---|---|
| `401 Unauthorized` sur toutes les routes | Token expiré ou absent | Re-login, vérifier `localStorage.getItem('token')` |
| CORS error | Backend CORS mal configuré | Vérifier `appsettings.Development.json` → `AllowedOrigins` |
| Arbre vide au chargement | Seed data absent | Vérifier `SeedData.cs`, relancer avec DB vide |
| Migration en conflit | Deux migrations avec même timestamp | `dotnet ef migrations remove` puis recréer |
| D3 ne rend rien | `useEffect` sans données | Vérifier que le fetch a renvoyé des nœuds non vides |

## En cas de régression

```bash
git status
git diff
git restore .   # annuler les modifs non commitées
```
