# Graph Report - .  (2026-07-06)

## Corpus Check
- Corpus is ~12,265 words - fits in a single context window. You may not need a graph.

## Summary
- 155 nodes · 133 edges · 31 communities (17 shown, 14 thin omitted)
- Extraction: 86% EXTRACTED · 14% INFERRED · 0% AMBIGUOUS · INFERRED: 18 edges (avg confidence: 0.87)
- Token cost: 89,149 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Composer Runtime Dependencies|Composer Runtime Dependencies]]
- [[_COMMUNITY_Composer Package Manifest|Composer Package Manifest]]
- [[_COMMUNITY_Symfony Polyfill Replacements|Symfony Polyfill Replacements]]
- [[_COMMUNITY_Doctrine Database Stack|Doctrine Database Stack]]
- [[_COMMUNITY_Composer Dev Dependencies|Composer Dev Dependencies]]
- [[_COMMUNITY_Security and Session|Security and Session]]
- [[_COMMUNITY_Async Messaging and Notifications|Async Messaging and Notifications]]
- [[_COMMUNITY_Composer Plugin Config|Composer Plugin Config]]
- [[_COMMUNITY_Composer Auto Scripts|Composer Auto Scripts]]
- [[_COMMUNITY_Symfony Kernel|Symfony Kernel]]
- [[_COMMUNITY_Config Reference Stubs|Config Reference Stubs]]
- [[_COMMUNITY_Stimulus Asset Bootstrap|Stimulus Asset Bootstrap]]
- [[_COMMUNITY_Autowiring and Route Attributes|Autowiring and Route Attributes]]
- [[_COMMUNITY_CSRF and Logout Routes|CSRF and Logout Routes]]
- [[_COMMUNITY_Monolog Logging|Monolog Logging]]
- [[_COMMUNITY_Validation and Property Info|Validation and Property Info]]
- [[_COMMUNITY_Web Profiler Routes|Web Profiler Routes]]
- [[_COMMUNITY_Mailpit Dev Mailer|Mailpit Dev Mailer]]
- [[_COMMUNITY_AssetMapper Config|AssetMapper Config]]
- [[_COMMUNITY_VarDumper Server|VarDumper Server]]
- [[_COMMUNITY_Translation Config|Translation Config]]
- [[_COMMUNITY_Twig Config|Twig Config]]
- [[_COMMUNITY_Project README|Project README]]
- [[_COMMUNITY_Dev Error Pages|Dev Error Pages]]

## God Nodes (most connected - your core abstractions)
1. `require` - 40 edges
2. `replace` - 11 edges
3. `require-dev` - 8 edges
4. `config` - 4 edges
5. `allow-plugins` - 4 edges
6. `scripts` - 4 edges
7. `auto-scripts` - 4 edges
8. `Kernel` - 4 edges
9. `PostgreSQL Database Service` - 4 edges
10. `Doctrine ORM Mapping` - 4 edges

## Surprising Connections (you probably didn't know these)
- `Doctrine DBAL Connection` --references--> `PostgreSQL Database Service`  [INFERRED]
  config/packages/doctrine.yaml → compose.yaml
- `Doctrine ORM Mapping` --references--> `PostgreSQL Database Service`  [INFERRED]
  config/packages/doctrine.yaml → compose.yaml
- `Dev Database Port Override` --references--> `PostgreSQL Database Service`  [EXTRACTED]
  compose.override.yaml → compose.yaml
- `Validator Configuration (auto-mapping hint, not_compromised_password off in test)` --semantically_similar_to--> `Property Info Constructor Extractor`  [INFERRED] [semantically similar]
  config/packages/validator.yaml → config/packages/property_info.yaml
- `Attribute Controller Route Import` --conceptually_related_to--> `App Namespace Autowiring`  [INFERRED]
  config/routes.yaml → config/services.yaml

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Development-Only Tooling and Overrides** — routes_framework_errors, routes_web_profiler_wdt, routes_web_profiler_profiler, packages_debug_dump_destination, compose_override_database, compose_override_mailer [INFERRED 0.85]
- **Doctrine PostgreSQL Persistence Stack** — compose_database, packages_doctrine_dbal, packages_doctrine_orm, packages_doctrine_migrations_doctrine_migrations, packages_doctrine_cache_pools [INFERRED 0.85]
- **Test Environment Overrides (when@test)** — packages_framework_session, packages_security_password_hashers, packages_twig_twig_config, packages_validator_validation, packages_web_profiler_profiler, packages_monolog_handlers [EXTRACTED 1.00]
- **Asynchronous Email/Notification Delivery Flow** — packages_mailer_mailer_dsn, packages_messenger_async_transport, packages_messenger_message_routing, packages_notifier_channel_policy [INFERRED 0.85]
- **Environment-Variable-Driven Configuration (%env())** — packages_framework_framework_core, packages_mailer_mailer_dsn, packages_messenger_async_transport, packages_routing_default_uri [EXTRACTED 1.00]

## Communities (31 total, 14 thin omitted)

### Community 0 - "Composer Runtime Dependencies"
Cohesion: 0.05
Nodes (40): require, doctrine/doctrine-bundle, doctrine/doctrine-migrations-bundle, doctrine/orm, ext-ctype, ext-iconv, php, phpdocumentor/reflection-docblock (+32 more)

### Community 1 - "Composer Package Manifest"
Cohesion: 0.12
Nodes (16): autoload, autoload-dev, psr-4, psr-4, conflict, symfony/symfony, extra, symfony (+8 more)

### Community 2 - "Symfony Polyfill Replacements"
Cohesion: 0.18
Nodes (11): replace, symfony/polyfill-ctype, symfony/polyfill-iconv, symfony/polyfill-php72, symfony/polyfill-php73, symfony/polyfill-php74, symfony/polyfill-php80, symfony/polyfill-php81 (+3 more)

### Community 3 - "Doctrine Database Stack"
Cohesion: 0.32
Nodes (8): PostgreSQL Database Service, database_data Volume, Dev Database Port Override, Framework Cache Configuration, Prod Doctrine Cache Pools, Doctrine DBAL Connection, Doctrine Migrations Configuration, Doctrine ORM Mapping

### Community 4 - "Composer Dev Dependencies"
Cohesion: 0.25
Nodes (8): require-dev, phpunit/phpunit, symfony/browser-kit, symfony/css-selector, symfony/debug-bundle, symfony/maker-bundle, symfony/stopwatch, symfony/web-profiler-bundle

### Community 5 - "Security and Session"
Cohesion: 0.25
Nodes (8): Framework Core Configuration (secret, session), Session Configuration (lazy start, mock storage in test), Dev Firewall (security disabled for profiler/wdt/assets/build), Main Firewall (lazy, users_in_memory provider), Password Hashers (auto, reduced cost in test), In-Memory User Provider (users_in_memory), Stateless CSRF Protection (check_header, for Turbo forms/logins), Web Profiler (toolbar in dev, collect disabled in test)

### Community 6 - "Async Messaging and Notifications"
Cohesion: 0.29
Nodes (8): Mailer Transport (MAILER_DSN), Async Messenger Transport (MESSENGER_TRANSPORT_DSN), Failed Messenger Transport (doctrine://default, queue failed), Messenger Message Routing (SendEmailMessage, ChatMessage, SmsMessage to async), Messenger Retry Strategy (max 3 retries, multiplier 2), Notifier Admin Recipients (admin@example.com), Notifier Channel Policy (all urgency levels routed to email), Router Default URI (DEFAULT_URI for non-HTTP URL generation)

### Community 7 - "Composer Plugin Config"
Cohesion: 0.29
Nodes (7): php-http/discovery, symfony/flex, symfony/runtime, config, allow-plugins, bump-after-update, sort-packages

### Community 8 - "Composer Auto Scripts"
Cohesion: 0.29
Nodes (7): assets:install %PUBLIC_DIR%, cache:clear, importmap:install, scripts, auto-scripts, post-install-cmd, post-update-cmd

### Community 9 - "Symfony Kernel"
Cohesion: 0.50
Nodes (3): BaseKernel, MicroKernelTrait, Kernel

## Knowledge Gaps
- **103 isolated node(s):** `app`, `type`, `license`, `minimum-stability`, `prefer-stable` (+98 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **14 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `require` connect `Composer Runtime Dependencies` to `Composer Package Manifest`?**
  _High betweenness centrality (0.228) - this node is a cross-community bridge._
- **Why does `replace` connect `Symfony Polyfill Replacements` to `Composer Package Manifest`?**
  _High betweenness centrality (0.071) - this node is a cross-community bridge._
- **Why does `require-dev` connect `Composer Dev Dependencies` to `Composer Package Manifest`?**
  _High betweenness centrality (0.051) - this node is a cross-community bridge._
- **What connects `app`, `type`, `license` to the rest of the system?**
  _103 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Composer Runtime Dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.05 - nodes in this community are weakly interconnected._
- **Should `Composer Package Manifest` be split into smaller, more focused modules?**
  _Cohesion score 0.11764705882352941 - nodes in this community are weakly interconnected._