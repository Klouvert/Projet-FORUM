---
name: arbre-intelligence
description: Contexte projet pour Arbre Intelligence, backend .NET, frontend React/D3, conventions métier et Git.
---

# Arbre Intelligence

## Contexte

Projet forum visuel en forme d'arbre / mindmap.

## Stack

- Backend: .NET 10, ASP.NET Core, EF Core, Identity
- Base de données: SQLite en développement, PostgreSQL en testing et production
- Frontend: React, TypeScript, Vite, Axios, D3
- Backend local: http://localhost:5215
- Frontend local: http://localhost:5173

## Conventions métier

Les niveaux d'idée sont :
- Bud = Bourgeon
- Leaf = Feuille
- Flower = Fleur
- Fruit = Fruit

Ne pas utiliser Seed, Sprout, Branch, Canopy.

L'application représente une mindmap qui prend la forme d'un arbre.
Le tronc porte les valeurs communes.
Les branches représentent les domaines.
Les nœuds représentent les idées.

## Conventions techniques

- Vérifier les fichiers existants avant de proposer des modifications
- Ne pas supposer le contenu réel d'un fichier sans lecture préalable
- Préférer des modifications minimales et localisées
- Pour le backend, conserver SQLite en dev et PostgreSQL en testing/prod
- Pour le frontend, vérifier que `VITE_API_URL` pointe vers `http://localhost:5215/api`

## Git

Avant une modification importante, suggérer :
```bash
git add .
git commit -m "chore: sauvegarde avant modification"
```

Après une étape fonctionnelle, suggérer un commit adapté :
- feat:
- fix:
- refactor:
- chore:

En cas de casse, rappeler les commandes utiles :
```bash
git status
git diff
git restore .
```

## Priorités produit

Ordre habituel :
1. Corriger le fonctionnel
2. Connecter API et UI
3. Améliorer l'UX
4. Affiner le visuel

Ne pas lancer de refonte visuelle lourde avant que les flux API/UI soient stables.
