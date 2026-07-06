# Spec : Mise en place de la CI qualite

> Date : 2026-07-06
> Statut : valide
> Portee : real-fiscal (squelette Symfony 8.1, PHP 8.4)

## Contexte et objectif

Le projet n'a aucune CI (pas de `.github/`), aucun outil de qualite configure, pas de `package.json`. Objectif : une CI GitHub Actions complete couvrant tests PHPUnit, style PHP, lint Twig, analyse statique et lint/format JS, avec les memes verifications executables en local.

Decisions de cadrage validees :

- Outils PHP : php-cs-fixer + twig-cs-fixer + PHPStan (phpcs ecarte car redondant avec php-cs-fixer ; twigcs ecarte car non maintenu, remplace par twig-cs-fixer).
- JS : prettier + eslint via un package.json minimal (devDependencies uniquement).
- Pas de base de donnees en CI pour l'instant (le service Postgres sera ajoute avec les premiers tests fonctionnels).
- DX locale : scripts composer et npm ; la CI appelle exactement ces scripts.
- Structure : un seul workflow `ci.yml`, 3 jobs paralleles.

## Outillage et configurations

### PHP (composer require-dev)

| Outil | Config | Cible | Regles |
|-------|--------|-------|--------|
| friendsofphp/php-cs-fixer | `.php-cs-fixer.dist.php` | `src/`, `tests/` | ruleset `@Symfony` ; `migrations/` exclu |
| vincentlanglet/twig-cs-fixer | `.twig-cs-fixer.dist.php` | `templates/` | regles par defaut |
| phpstan/phpstan + phpstan/phpstan-symfony + phpstan/extension-installer | `phpstan.dist.neon` | `src/`, `tests/` | niveau 8 |

PHPUnit 13 est deja present (`bin/phpunit`, mode strict via `phpunit.dist.xml`). La suite etant vide, un test smoke est ajoute : `tests/SmokeTest.php` (KernelTestCase, boot du kernel) pour que le job de tests valide reellement quelque chose.

### JS (package.json, devDependencies uniquement)

- `eslint` + `@eslint/js` (flat config `eslint.config.mjs`, regles recommended) + `eslint-config-prettier`.
- `prettier` : `.prettierrc` + `.prettierignore`.
- Cible : `assets/**/*.js`. Exclusions : `assets/vendor/`, `public/assets/`, `var/`.
- `package-lock.json` commite (install reproductible via `npm ci`).

## Workflow CI

Fichier : `.github/workflows/ci.yml`

- Declencheurs : `pull_request` et `push` sur `master`.
- `concurrency` avec annulation des runs obsoletes sur une meme ref.
- 3 jobs paralleles sur `ubuntu-latest` :

| Job | Setup | Etapes |
|-----|-------|--------|
| `php-lint` | shivammathur/setup-php (PHP 8.4, coverage none) + cache composer | `composer cs` puis `composer twig:cs` puis `composer stan` |
| `php-tests` | idem | `composer test` |
| `js-lint` | actions/setup-node (Node 22, cache npm) | `npm ci` puis `npm run lint` puis `npm run format:check` |

En CI, tous les linters sont en mode check-only (jamais d'autofix).

## Scripts locaux

Composer (`composer.json`, section `scripts`) :

```
composer cs           php-cs-fixer fix --dry-run --diff
composer cs:fix       php-cs-fixer fix
composer twig:cs      twig-cs-fixer lint templates
composer twig:fix     twig-cs-fixer lint --fix templates
composer stan         phpstan analyse
composer test         bin/phpunit
```

npm (`package.json`, section `scripts`) :

```
npm run lint          eslint
npm run format:check  prettier --check .
npm run format        prettier --write .
```

## Cas limites

- Caches d'outils (`.php-cs-fixer.cache`, cache PHPStan, etc.) ajoutes au `.gitignore`.
- PHPStan niveau 8 des le depart : indolore sur un `src/` quasi vide, evite une montee de niveau douloureuse plus tard.
- Le test smoke garantit une suite PHPUnit non vide (le comportement de PHPUnit sur suite vide ne bloque pas la CI par surprise).

## Validation

- Branche `chore/setup-ci`, PR vers `master`.
- Chaque outil est verifie localement avant push (une erreur volontaire doit etre detectee, puis corrigee).
- Critere de succes : les 3 jobs passent au vert sur la PR reelle.

## Hors perimetre

- Service PostgreSQL en CI (viendra avec les premiers tests fonctionnels).
- Hooks git locaux (pre-commit).
- Deploiement / release.
