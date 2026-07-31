# La Zone — Backend

API REST pour la plateforme de réservation de tickets de cinéma **La Zone**.

Projet d'examen final — Licence 2 Génie Informatique, 2025-2026.

- Frontend : https://github.com/Joe-Wando/La-Zone
- Démo frontend : https://la-zone-navy.vercel.app
- Backend : https://github.com/Joe-Wando/La-zone-backend

## Stack technique

- NestJS + TypeScript
- PostgreSQL + TypeORM
- Redis (cache TMDB + révocation JWT)
- Authentification JWT + RBAC
- API externe : TMDB
- Paiement : NabooPay
- Monitoring : Prometheus + Grafana
- Docker

## Équipe

| Nom | Rôle |
|---|---|
| Jonathan Wando | Chef de projet — auth, users, films, cinémas, salles, séances, réservations, tickets, paiement, monitoring |
| Coumba BA | Documentation |
| Précieux NZINOUNOU | Tests |

## Installation

Prérequis : Node.js, Docker Desktop.

```bash
git clone https://github.com/Joe-Wando/La-Zone-Backend.git
cd La-Zone-Backend
npm install
cp .env.example .env   # puis remplir les valeurs
docker compose up -d postgres redis prometheus grafana
npm run start:dev
```

L'API démarre sur http://localhost:3000

Documentation Swagger interactive : http://localhost:3000/api

## Tests

```bash
npm run test        # tests unitaires
npm run test:e2e    # tests end-to-end
```

## Documentation

Voir le dossier [`docs/`](./docs) — diagrammes d'architecture des modules, entité-relation, flux d'authentification JWT, et présentation du projet (réalisés par Coumba BA).

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