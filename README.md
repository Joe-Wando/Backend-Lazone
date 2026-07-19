# La Zone — Backend

API REST pour la plateforme de réservation de tickets de cinéma **La Zone**.

Projet d'examen final — Licence 2 Génie Informatique, 2025-2026.

- Frontend : https://github.com/Joe-Wando/La-Zone
- Démo frontend : https://la-zone-navy.vercel.app
- Backendf : https://github.com/Joe-Wando/La-zone-backend

## Stack technique

- NestJS + TypeScript
- PostgreSQL + TypeORM
- Authentification JWT + RBAC
- API externe : TMDB
- Docker

## Équipe

| Nom | Rôle |
|---|---|
| Jonathan Wando | Chef de projet — auth, users, configuration, documentation|
| Coumba BA | Films, cinémas, salles, séances |
| Précieux NZINOUNOU | Réservations, tickets |

## Installation

Prérequis : Node.js, Docker Desktop.

```bash
git clone https://github.com/Joe-Wando/La-Zone-Backend.git
cd La-Zone-Backend
npm install
cp .env.example .env   # puis remplir les valeurs
docker compose up -d
npm run start:dev
```

L'API démarre sur http://localhost:3000

## Conventions Git

Branches :
- `main` — versions stables uniquement
- `develop` — branche d'intégration
- `feature/xxx` — une branche par fonctionnalité

Aucun push direct sur `develop` : passer par une Pull Request.

Format des commits (Conventional Commits) :

| Préfixe | Usage |
|---|---|
| `feat` | nouvelle fonctionnalité |
| `fix` | correction de bug |
| `docs` | documentation |
| `refactor` | réorganisation du code |
| `test` | tests |
| `chore` | configuration, dépendances |

Exemple : `feat: ajout du guard RBAC`