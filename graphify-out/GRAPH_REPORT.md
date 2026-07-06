# Graph Report - .  (2026-07-07)

## Corpus Check
- Corpus is ~45,314 words - fits in a single context window. You may not need a graph.

## Summary
- 314 nodes · 364 edges · 42 communities (25 shown, 17 thin omitted)
- Extraction: 91% EXTRACTED · 9% INFERRED · 0% AMBIGUOUS · INFERRED: 32 edges (avg confidence: 0.89)
- Token cost: 261,027 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Composant Alpine Simulateur|Composant Alpine Simulateur]]
- [[_COMMUNITY_Dependances Composer Symfony|Dependances Composer Symfony]]
- [[_COMMUNITY_Manifeste Composer Autoload|Manifeste Composer Autoload]]
- [[_COMMUNITY_Taches SDD Simulateur|Taches SDD Simulateur]]
- [[_COMMUNITY_Specs Simulateur Frais Reels|Specs Simulateur Frais Reels]]
- [[_COMMUNITY_Toolchain Node Lint|Toolchain Node Lint]]
- [[_COMMUNITY_CI Setup et Smoke Test|CI Setup et Smoke Test]]
- [[_COMMUNITY_Scripts Composer Qualite|Scripts Composer Qualite]]
- [[_COMMUNITY_Polyfills Symfony Remplaces|Polyfills Symfony Remplaces]]
- [[_COMMUNITY_Doctrine PostgreSQL|Doctrine PostgreSQL]]
- [[_COMMUNITY_Config Plugins Composer|Config Plugins Composer]]
- [[_COMMUNITY_Framework Securite Session|Framework Securite Session]]
- [[_COMMUNITY_Messenger Mailer Notifier|Messenger Mailer Notifier]]
- [[_COMMUNITY_Controleur Simulateur|Controleur Simulateur]]
- [[_COMMUNITY_Kernel Symfony|Kernel Symfony]]
- [[_COMMUNITY_Config Reference|Config Reference]]
- [[_COMMUNITY_Test Fonctionnel Controleur|Test Fonctionnel Controleur]]
- [[_COMMUNITY_Routes et Services|Routes et Services]]
- [[_COMMUNITY_CSRF et Logout|CSRF et Logout]]
- [[_COMMUNITY_Logging Monolog|Logging Monolog]]
- [[_COMMUNITY_Validation Property Info|Validation Property Info]]
- [[_COMMUNITY_Routes Profiler|Routes Profiler]]
- [[_COMMUNITY_Override Mailpit|Override Mailpit]]
- [[_COMMUNITY_Config AssetMapper|Config AssetMapper]]
- [[_COMMUNITY_Debug Dump|Debug Dump]]
- [[_COMMUNITY_Traduction|Traduction]]
- [[_COMMUNITY_Config Twig|Config Twig]]
- [[_COMMUNITY_README Projet|README Projet]]
- [[_COMMUNITY_Routes Erreurs|Routes Erreurs]]
- [[_COMMUNITY_Journal SDD|Journal SDD]]
- [[_COMMUNITY_Job CI PHP Lint|Job CI PHP Lint]]
- [[_COMMUNITY_Job CI PHP Tests|Job CI PHP Tests]]

## God Nodes (most connected - your core abstractions)
1. `require` - 40 edges
2. `calc()` - 19 edges
3. `require-dev` - 13 edges
4. `saveHistory()` - 12 edges
5. `Spec : simulateur de frais reels (Alpine + Bootstrap 5.3)` - 12 edges
6. `replace` - 11 edges
7. `Simulateur Frais Reels Implementation Plan (10 tasks)` - 11 edges
8. `num()` - 10 edges
9. `scripts` - 10 edges
10. `Task 4 Brief: storage.js + composant Alpine fraisReels complet` - 10 edges

## Surprising Connections (you probably didn't know these)
- `kmBareme()` --implements--> `Bareme kilometrique DGFiP (3 tranches par vehicule, +20 % electrique)`  [INFERRED]
  assets/js/engine.js → docs/superpowers/specs/2026-07-06-simulateur-frais-reels-design.md
- `Simulateur de frais reels (feature, route /)` --references--> `calc()`  [INFERRED]
  CLAUDE.md → assets/js/engine.js
- `saveHistory()` --implements--> `Persistence localStorage cle fr2026_sims`  [INFERRED]
  assets/js/storage.js → docs/superpowers/specs/2026-07-06-simulateur-frais-reels-design.md
- `Pattern deep-persist via Alpine.effect` --references--> `saveHistory()`  [EXTRACTED]
  docs/superpowers/plans/2026-07-06-simulateur-frais-reels.md → assets/js/storage.js
- `Task 3 Brief: Moteur fiscal engine.js (TDD node --test)` --references--> `blankSim()`  [EXTRACTED]
  .superpowers/sdd/task-3-brief.md → assets/js/engine.js

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Doctrine PostgreSQL Persistence Stack** — compose_database, packages_doctrine_dbal, packages_doctrine_orm, packages_doctrine_migrations_doctrine_migrations, packages_doctrine_cache_pools [INFERRED 0.85]
- **Test Environment Overrides (when@test)** — packages_framework_session, packages_security_password_hashers, packages_twig_twig_config, packages_validator_validation, packages_web_profiler_profiler, packages_monolog_handlers [EXTRACTED 1.00]
- **Environment-Variable-Driven Configuration (%env())** — packages_framework_framework_core, packages_mailer_mailer_dsn, packages_messenger_async_transport, packages_routing_default_uri [EXTRACTED 1.00]
- **Asynchronous Email/Notification Delivery Flow** — packages_mailer_mailer_dsn, packages_messenger_async_transport, packages_messenger_message_routing, packages_notifier_channel_policy [INFERRED 0.85]
- **Development-Only Tooling and Overrides** — routes_framework_errors, routes_web_profiler_wdt, routes_web_profiler_profiler, packages_debug_dump_destination, compose_override_database, compose_override_mailer [INFERRED 0.85]
- **SDD plan 2026-07-06 simulateur-frais-reels (10 tasks tracked in progress log)** — sdd_progress_sdd_log, sdd_task_1_brief_front_deps_theme, sdd_task_2_brief_controller_route_shell, sdd_task_3_brief_fiscal_engine_tdd, sdd_task_4_brief_storage_alpine_component, sdd_task_5_brief_home_screen, sdd_task_6_brief_wizard_profil_repas, sdd_task_7_brief_trajets_materiel, sdd_task_8_brief_abos_synthese, sdd_task_9_brief_ci_js_checks_docs, sdd_task_10_brief_e2e_browser_pr [EXTRACTED 1.00]
- **Simulator UI composition: index.html.twig shell including home + 6 wizard step partials** — sdd_task_2_brief_controller_route_shell, sdd_task_5_brief_home_screen, sdd_task_6_brief_wizard_profil_repas, sdd_task_7_brief_trajets_materiel, sdd_task_8_brief_abos_synthese [EXTRACTED 1.00]
- **French frais reels fiscal rule set implemented by the pure engine** — sdd_task_3_brief_pure_fiscal_engine, sdd_task_3_brief_bareme_kilometrique, sdd_task_3_brief_amortissement_materiel, sdd_task_4_brief_prorata_teletravail, sdd_task_4_brief_verdict_comparison [INFERRED 0.85]
- **Regles du moteur fiscal (baremes annuels, km, materiel, abattement)** — specs_2026_07_06_simulateur_frais_reels_design_moteur_fiscal, specs_2026_07_06_simulateur_frais_reels_design_bareme_kilometrique, specs_2026_07_06_simulateur_frais_reels_design_year_cfg, specs_2026_07_06_simulateur_frais_reels_design_regle_materiel, specs_2026_07_06_simulateur_frais_reels_design_abattement_verdict [EXTRACTED 1.00]
- **Pipeline CI qualite (spec, plan, workflow, parite locale)** — specs_2026_07_06_ci_setup_design_three_parallel_jobs, specs_2026_07_06_ci_setup_design_local_ci_parity, plans_2026_07_06_ci_setup_plan, claude_ci_workflow [INFERRED 0.85]
- **Chaine documentaire du simulateur : spec -> plan -> feature livree** — specs_2026_07_06_simulateur_frais_reels_design_spec, plans_2026_07_06_simulateur_frais_reels_plan, claude_simulateur_frais_reels [INFERRED 0.85]

## Communities (42 total, 17 thin omitted)

### Community 0 - "Composant Alpine Simulateur"
Cohesion: 0.06
Nodes (29): ABO_PRESETS, c(), delSim(), dupSim(), jSem(), jTT(), LABELS, loyerFormule() (+21 more)

### Community 1 - "Dependances Composer Symfony"
Cohesion: 0.05
Nodes (40): require, doctrine/doctrine-bundle, doctrine/doctrine-migrations-bundle, doctrine/orm, ext-ctype, ext-iconv, php, phpdocumentor/reflection-docblock (+32 more)

### Community 2 - "Manifeste Composer Autoload"
Cohesion: 0.07
Nodes (29): autoload, autoload-dev, psr-4, psr-4, conflict, symfony/symfony, extra, symfony (+21 more)

### Community 3 - "Taches SDD Simulateur"
Cohesion: 0.10
Nodes (29): calc(), kmBareme(), Task 10 Brief: Validation navigateur E2E + PR, Task 1 Brief: Dependances front + theme Bootstrap, Task 1 Report: Alpine + Bootstrap via importmap, sage theme, Task 2 Brief: Controleur + route + shell du template (TDD), Task 2 Report: SimulateurController + route / + Alpine mount point, Regle materiel: deduction one-shot <= 500 EUR, amortissement 3 ans au-dela (+21 more)

### Community 4 - "Specs Simulateur Frais Reels"
Cohesion: 0.10
Nodes (28): Cohabitation Alpine.js / Stimulus, AssetMapper + importmap (pas de bundler ni build front), Persistance localStorage cle fr2026_sims (BDD dormante), Piege Kernel::getAllowedEnvs (@phpstan-ignore method.unused), Messenger : transport async Doctrine, PHPUnit 13 en mode strict, Gotcha : port PostgreSQL aleatoire, CLAUDE.md - guide projet real-fiscal (+20 more)

### Community 5 - "Toolchain Node Lint"
Cohesion: 0.12
Nodes (15): devDependencies, eslint, eslint-config-prettier, @eslint/js, globals, prettier, name, private (+7 more)

### Community 6 - "CI Setup et Smoke Test"
Cohesion: 0.22
Nodes (11): CI GitHub Actions ci.yml (php-lint, php-tests, js-checks), KernelTestCase, CI Qualite Implementation Plan (8 tasks), Parite locale / CI des verifications, PHPStan niveau 8 des le depart, Prettier volontairement scope a assets/, Smoke test tests/SmokeTest.php (boot du Kernel), Spec : mise en place de la CI qualite (+3 more)

### Community 7 - "Scripts Composer Qualite"
Cohesion: 0.15
Nodes (13): assets:install %PUBLIC_DIR%, cache:clear, importmap:install, scripts, auto-scripts, cs, cs:fix, post-install-cmd (+5 more)

### Community 8 - "Polyfills Symfony Remplaces"
Cohesion: 0.18
Nodes (11): replace, symfony/polyfill-ctype, symfony/polyfill-iconv, symfony/polyfill-php72, symfony/polyfill-php73, symfony/polyfill-php74, symfony/polyfill-php80, symfony/polyfill-php81 (+3 more)

### Community 9 - "Doctrine PostgreSQL"
Cohesion: 0.32
Nodes (8): PostgreSQL Database Service, database_data Volume, Dev Database Port Override, Framework Cache Configuration, Prod Doctrine Cache Pools, Doctrine DBAL Connection, Doctrine Migrations Configuration, Doctrine ORM Mapping

### Community 10 - "Config Plugins Composer"
Cohesion: 0.25
Nodes (8): php-http/discovery, phpstan/extension-installer, symfony/flex, symfony/runtime, config, allow-plugins, bump-after-update, sort-packages

### Community 11 - "Framework Securite Session"
Cohesion: 0.25
Nodes (8): Framework Core Configuration (secret, session), Session Configuration (lazy start, mock storage in test), Dev Firewall (security disabled for profiler/wdt/assets/build), Main Firewall (lazy, users_in_memory provider), Password Hashers (auto, reduced cost in test), In-Memory User Provider (users_in_memory), Stateless CSRF Protection (check_header, for Turbo forms/logins), Web Profiler (toolbar in dev, collect disabled in test)

### Community 12 - "Messenger Mailer Notifier"
Cohesion: 0.29
Nodes (8): Mailer Transport (MAILER_DSN), Async Messenger Transport (MESSENGER_TRANSPORT_DSN), Failed Messenger Transport (doctrine://default, queue failed), Messenger Message Routing (SendEmailMessage, ChatMessage, SmsMessage to async), Messenger Retry Strategy (max 3 retries, multiplier 2), Notifier Admin Recipients (admin@example.com), Notifier Channel Policy (all urgency levels routed to email), Router Default URI (DEFAULT_URI for non-HTTP URL generation)

### Community 13 - "Controleur Simulateur"
Cohesion: 0.60
Nodes (3): AbstractController, SimulateurController, Response

### Community 14 - "Kernel Symfony"
Cohesion: 0.50
Nodes (3): BaseKernel, MicroKernelTrait, Kernel

## Knowledge Gaps
- **151 isolated node(s):** `LABELS`, `MOIS`, `MAT_PRESETS`, `ABO_PRESETS`, `YEAR_CFG` (+146 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **17 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `calc()` connect `Taches SDD Simulateur` to `Composant Alpine Simulateur`, `Specs Simulateur Frais Reels`?**
  _High betweenness centrality (0.070) - this node is a cross-community bridge._
- **Why does `require` connect `Dependances Composer Symfony` to `Manifeste Composer Autoload`?**
  _High betweenness centrality (0.065) - this node is a cross-community bridge._
- **Why does `CLAUDE.md - guide projet real-fiscal` connect `Specs Simulateur Frais Reels` to `CI Setup et Smoke Test`?**
  _High betweenness centrality (0.044) - this node is a cross-community bridge._
- **What connects `LABELS`, `MOIS`, `MAT_PRESETS` to the rest of the system?**
  _158 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Composant Alpine Simulateur` be split into smaller, more focused modules?**
  _Cohesion score 0.06462585034013606 - nodes in this community are weakly interconnected._
- **Should `Dependances Composer Symfony` be split into smaller, more focused modules?**
  _Cohesion score 0.05 - nodes in this community are weakly interconnected._
- **Should `Manifeste Composer Autoload` be split into smaller, more focused modules?**
  _Cohesion score 0.06666666666666667 - nodes in this community are weakly interconnected._