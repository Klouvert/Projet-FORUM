# Review — Checklist pour ce projet

## Backend

- [ ] Les routes d'écriture ont `[Authorize]`
- [ ] Les DTOs valident : titre ≤ 200, contenu ≤ 2000, branche ≤ 100 chars
- [ ] Les erreurs retournent `{ error: "..." }` (pas d'exception non gérée)
- [ ] Les nouvelles entités sont dans `AppDbContext` + migration créée
- [ ] Pas de `EnsureCreated` ajouté (réservé au `Program.cs` existant)
- [ ] Les `IdeaLevel` et `IdeaDomain` utilisent les enums — pas de string libre

## Frontend

- [ ] Pas de `console.error` dans le code livré
- [ ] Les fetch utilisent `AbortController` si dans un `useEffect`
- [ ] Les états async affichent un feedback (chargement / succès / erreur)
- [ ] Les modales ferment correctement après action réussie
- [ ] `useTree.ts` est le seul point d'entrée vers l'API — pas d'`axios` direct dans les composants
- [ ] Les labels botaniques utilisent la table de `PROJECT.md` (Bourgeon / Fleur / Fruit / Feuille)

## Mindmap / TreeCanvas

- [ ] Toute modification du TreeCanvas est conforme à `SKILLS/phase2-mindmap.md`
- [ ] Les transitions D3 durent 0.2–0.3s avec easing naturel
- [ ] Les animations sont subtiles — pas d'effet cartoon

## Git

- [ ] Un seul sujet par commit
- [ ] Message au format `type(scope): message`
- [ ] `CURRENT_STATE.md` mis à jour si la session se termine
