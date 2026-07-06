# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Etat du projet

Squelette Symfony 8.1 (PHP >= 8.4) avec CI qualite complete en place (PR #2 mergee). Premiere fonctionnalite en place : le simulateur de frais reels (route /, 100 % cote client — moteur fiscal assets/js/engine.js, composant Alpine assets/app.js, partials templates/simulateur/). Les simulations vivent en localStorage (cle fr2026_sims), la BDD reste dormante. Tests : smoke test (boot du Kernel), test fonctionnel du controleur, et 14 tests node du moteur fiscal. `graphify-out/` contient un graphe de connaissances genere, pas du code applicatif. Les specs et plans d'implementation sont archives dans `docs/superpowers/`.

## Commandes

```bash
# Infrastructure (PostgreSQL 16 + Mailpit)
docker compose up -d
docker compose port database 5432   # port hote reel de PostgreSQL (voir gotcha ci-dessous)
docker compose port mailer 8025     # port hote de l'UI Mailpit

# Serveur de dev (Symfony CLI installe)
symfony serve -d

# Dependances
composer install
composer require <package>   # Flex contraint les paquets symfony/* a 8.1.* (extra.symfony.require)

# Tests
php bin/phpunit                                  # toute la suite (ou : composer test)
php bin/phpunit tests/Chemin/VersLeTest.php      # un fichier
php bin/phpunit --filter nomDeLaMethode          # un test precis

# Qualite — memes commandes que la CI (jobs php-lint et js-checks)
composer cs          # php-cs-fixer en check (cs:fix pour corriger)
composer twig:cs     # twig-cs-fixer en check (twig:fix pour corriger)
composer stan        # PHPStan niveau 8
npm run lint         # eslint (lint:fix pour corriger)
npm run format:check # prettier en check (format pour corriger)
npm test             # tests du moteur fiscal (node --test)

# Base de donnees
php bin/console doctrine:database:create
php bin/console make:entity
php bin/console make:migration
php bin/console doctrine:migrations:migrate

# Worker asynchrone (obligatoire pour l'envoi d'emails/notifications)
php bin/console messenger:consume async -vv

# Frontend (AssetMapper — PAS de Node/npm/webpack)
php bin/console importmap:require <package>      # ajouter une dependance JS
```

### Gotcha : port PostgreSQL aleatoire

`compose.override.yaml` publie le port 5432 du conteneur sur un **port hote aleatoire**, alors que `DATABASE_URL` dans `.env` suppose `127.0.0.1:5432`. Apres `docker compose up`, recuperer le port reel avec `docker compose port database 5432` et surcharger `DATABASE_URL` dans `.env.local` (gitignore), ou fixer le mapping dans `compose.override.yaml`.

## Architecture

### Backend

- Kernel micro (`src/Kernel.php`, `MicroKernelTrait`). Autoload PSR-4 : `App\` → `src/`, `App\Tests\` → `tests/`.
- Configuration dans `config/packages/*.yaml` avec des blocs `when@dev` / `when@test` / `when@prod` dans le meme fichier — verifier l'environnement vise avant de modifier une valeur.
- Routes declarees par attributs PHP sur les controleurs (`config/routes.yaml` importe `src/Controller/`). Services autowires/autoconfigures sur tout le namespace `App\` (`config/services.yaml`), a l'exclusion de `Entity/`, `DependencyInjection/` et `Kernel.php` — pas besoin d'enregistrer les services manuellement.
- **Messenger** : transport Doctrine. `SendEmailMessage`, `ChatMessage` et `SmsMessage` sont routes vers le transport `async` — rien ne part sans un worker `messenger:consume async` actif. Echecs vers le transport `failed`, 3 retries avec multiplicateur 2.
- **Securite** : provider d'utilisateurs en memoire (placeholder du squelette), aucune vraie authentification configuree. Le firewall `main` est `lazy`.
- **Mail** : `MAILER_DSN=null://null` par defaut ; le conteneur Mailpit (SMTP 1025, UI 8025) est disponible pour tester en dev.

### Frontend

- AssetMapper + importmap (`importmap.php`) : les dependances JS sont vendorees dans `assets/vendor/` (gitignore), aucun bundler ni etape de build.
- Stimulus : les controleurs dans `assets/controllers/` sont auto-enregistres (convention `xxx_controller.js` → `data-controller="xxx"`). Point d'entree `assets/app.js`.
- Alpine.js et Bootstrap (+ Popper) sont declares dans `importmap.php` au meme titre que Stimulus/Turbo — pas de bundler dedie. Alpine cohabite avec Stimulus : Stimulus reste le mecanisme de controleurs auto-enregistres, Alpine est utilise localement (ex. composant du simulateur) pour de la reactivite fine sans creer de controleur Stimulus dedie.
- Turbo est actif : la protection CSRF des formulaires est **stateless** (jeton par header, genere par `assets/controllers/csrf_protection_controller.js` + config `csrf.yaml`/`ux_turbo.yaml`), pas par session.

### CI et qualite

- `.github/workflows/ci.yml` : 3 jobs paralleles (`php-lint`, `php-tests`, `js-checks`) sur PR et push master, token en lecture seule. `js-checks` execute aussi `npm test` (tests du moteur fiscal), en plus du lint/format. La CI appelle **exactement** les scripts composer/npm ci-dessus — pas de commande divergente a maintenir. En CI tout est check-only ; l'autofix (`cs:fix`, `twig:fix`, `lint:fix`, `format`) est reserve au local.
- Scopes : php-cs-fixer (`@Symfony`) sur `src/` + `tests/` (`migrations/` exclu) ; PHPStan niveau 8 sur `src/` + `tests/` (extension phpstan-symfony) ; twig-cs-fixer sur `templates/` ; eslint/prettier limites a `assets/` (hors `assets/vendor/`). Le toolchain Node sert au lint ET aux tests du moteur fiscal (node --test) — toujours pas de build front (AssetMapper).
- **PIEGE — ne pas re-supprimer** : `Kernel::getAllowedEnvs()` porte un `@phpstan-ignore method.unused`. Ce n'est PAS du code mort : c'est le hook framework qui restreint les valeurs d'`APP_ENV` (appele par `KernelTrait` dans vendor, invisible pour PHPStan). Il a deja ete supprime par erreur une fois pour satisfaire PHPStan — la suppression desactive silencieusement l'enforcement.

### Tests

- PHPUnit 13 en mode strict : `failOnDeprecation`, `failOnNotice` et `failOnWarning` sont actifs — une deprecation fait echouer la suite.
- `APP_ENV=test` force (voir `.env.test`) ; hashers de mots de passe a cout reduit et sessions mockees en test via les blocs `when@test`.
- La suite PHP contient tests/SmokeTest.php (boot du Kernel) et tests/Controller/SimulateurControllerTest.php ; le moteur fiscal JS est couvert par assets/js/engine.test.js (npm test).

### Variables d'environnement

Cascade : `.env` (defauts commites) → `.env.dev` / `.env.test` → `.env.local` (gitignore, pour les surcharges locales : `DATABASE_URL`, `MAILER_DSN`, etc.).

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
