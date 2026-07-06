# Simulateur Frais Reels Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Porter la maquette « frais reels » (calculateur fiscal 6 etapes + accueil, moteur de calcul, localStorage) dans real-fiscal avec Alpine.js + Bootstrap 5.3 servis par AssetMapper.

**Architecture:** Une route Symfony `/` rend un template Twig decoupe en partials ; toute la logique vit cote client : moteur fiscal pur dans `assets/js/engine.js` (teste avec `node --test`), persistence dans `assets/js/storage.js`, orchestration dans un composant `Alpine.data('fraisReels')` (`assets/app.js`).

**Tech Stack:** Symfony 8.1 / PHP 8.4, AssetMapper + importmap (pas de bundler), Alpine.js 3, Bootstrap 5.3 (CSS + JS vendores), node:test, PHPUnit 13 (WebTestCase).

## Global Constraints

- Spec source : `docs/superpowers/specs/2026-07-06-simulateur-frais-reels-design.md` — chiffres fiscaux et structure de donnees font foi ; toute divergence y est reportee.
- Branche : `feat/simulateur-frais-reels` (existe deja, contient la spec). Commits : anglais, imperatif, `type: description`.
- Cle localStorage : `fr2026_sims` (compatibilite maquette). Structure `sim` inchangee vs maquette (voir spec).
- Textes UI : francais AVEC accents (contenu utilisateur) ; commentaires de code : anglais.
- Stimulus/Turbo restent en place, inchanges. Pas de CDN : tout passe par importmap/AssetMapper (exception actee : Google Fonts via `<link>`).
- Qualite : chaque task se termine avec `composer cs`, `composer twig:cs` (si Twig touche), `composer stan` (si PHP touche), `npm run lint`, `npm run format:check` verts. CI check-only.
- Ne PAS commiter : `.claude/` (deja versionne — ne pas le modifier), caches, `node_modules/`, `graphify-out/`.
- Apres `npm run format` : inspecter le diff avant commit.

---

### Task 1: Dependances front + theme Bootstrap

**Files:**
- Modify: `importmap.php` (via commandes, pas a la main), `assets/app.js`, `assets/styles/app.css`, `templates/base.html.twig`

**Interfaces:**
- Consumes: rien
- Produces: Alpine demarre et enregistre un composant vide `fraisReels` ; Bootstrap CSS+JS charges ; variables de theme CSS (`--fr-*`) et classes custom (`.fr-card`, `.fr-info`, `.fr-soft`, `.fr-stepper-item`, `.no-print`, `[x-cloak]`) disponibles pour toutes les tasks UI

- [ ] **Step 1: Installer les paquets front**

```bash
php bin/console importmap:require alpinejs
php bin/console importmap:require bootstrap
php bin/console importmap:require bootstrap/dist/css/bootstrap.min.css
```
Expected: 3 entrees ajoutees a `importmap.php`, fichiers vendores sous `assets/vendor/`.

- [ ] **Step 2: Booter Alpine dans app.js**

Remplacer le contenu de `assets/app.js` par :

```js
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/app.css';
import Alpine from 'alpinejs';

// Placeholder component, replaced by the real one in a later task
Alpine.data('fraisReels', () => ({ screen: 'home' }));

window.Alpine = Alpine;
Alpine.start();
```

Note : `assets/stimulus_bootstrap.js` reste importe par le systeme existant — ne pas y toucher. Si l'actuel `app.js` importe `./stimulus_bootstrap.js` et `./styles/app.css`, CONSERVER ces imports et ajouter les notres (bootstrap + alpine) autour.

- [ ] **Step 3: Google Fonts dans base.html.twig**

Dans `templates/base.html.twig`, ajouter dans `<head>` (avant `{% block stylesheets %}`) :

```twig
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@500;600;700;800&family=Figtree:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap" rel="stylesheet">
```

- [ ] **Step 4: Theme CSS**

Remplacer le contenu de `assets/styles/app.css` par :

```css
/* Frais reels theme: Bootstrap 5.3 overrides + custom components */

:root {
    --fr-acc: oklch(0.5 0.1 165);
    --fr-acc-ink: oklch(0.38 0.09 165);
    --fr-acc-soft: oklch(0.95 0.02 165);
    --fr-acc-mid: oklch(0.88 0.04 165);
    --fr-paper: #faf7f2;
    --fr-ink: #1f1d1a;
    --fr-muted: #8a8378;
    --fr-body: #5b5548;
    --fr-border: #ede7dc;
    --fr-danger: #b3462e;

    --bs-body-bg: var(--fr-paper);
    --bs-body-color: var(--fr-ink);
    --bs-body-font-family: Figtree, sans-serif;
    --bs-border-radius: 12px;
    --bs-border-radius-lg: 16px;
    --bs-border-radius-xl: 20px;
}

[x-cloak] { display: none !important; }

h1, h2, h3, h4, h5, .fr-display { font-family: 'Bricolage Grotesque', sans-serif; font-weight: 800; }

.btn-fr {
    --bs-btn-bg: var(--fr-acc);
    --bs-btn-border-color: var(--fr-acc);
    --bs-btn-color: #fff;
    --bs-btn-hover-bg: oklch(0.55 0.1 165);
    --bs-btn-hover-border-color: oklch(0.55 0.1 165);
    --bs-btn-hover-color: #fff;
    --bs-btn-active-bg: var(--fr-acc-ink);
    --bs-btn-active-color: #fff;
    --bs-btn-border-radius: 14px;
    font-weight: 700;
    box-shadow: 0 4px 14px oklch(0.5 0.1 165 / 0.3);
}
.btn-fr-soft {
    --bs-btn-bg: var(--fr-acc-soft);
    --bs-btn-border-color: var(--fr-acc-soft);
    --bs-btn-color: var(--fr-acc-ink);
    --bs-btn-hover-bg: var(--fr-acc-mid);
    --bs-btn-hover-border-color: var(--fr-acc-mid);
    --bs-btn-hover-color: var(--fr-acc-ink);
    font-weight: 600;
}
.btn-fr-outline {
    --bs-btn-bg: #fff;
    --bs-btn-border-color: #e5dfd6;
    --bs-btn-color: #3e3a32;
    --bs-btn-hover-bg: #fff;
    --bs-btn-hover-border-color: #c9c1b2;
    --bs-btn-hover-color: #3e3a32;
    font-weight: 600;
}
.btn-fr-danger-ghost {
    --bs-btn-bg: #fff;
    --bs-btn-border-color: #f0ddd5;
    --bs-btn-color: var(--fr-danger);
    --bs-btn-hover-bg: #fbefea;
    --bs-btn-hover-border-color: #f0ddd5;
    --bs-btn-hover-color: var(--fr-danger);
    font-weight: 600;
}

.fr-card { background: #fff; border: 1px solid var(--fr-border); border-radius: 20px; }
.fr-soft { background: var(--fr-acc-soft); border-radius: 16px; color: var(--fr-acc-ink); }
.fr-panel { background: var(--fr-paper); border-radius: 14px; }
.fr-muted { color: var(--fr-muted); }
.fr-body-text { color: var(--fr-body); }
.fr-ink { color: var(--fr-acc-ink); }
.fr-amount { font-family: 'Bricolage Grotesque', sans-serif; font-weight: 800; color: var(--fr-acc-ink); }

.fr-empty { border: 1.5px dashed #ded7ca; border-radius: 18px; color: var(--fr-muted); }

.fr-info { background: #fdf6e9; border: 1px solid #f0e4c8; border-radius: 16px; color: #5c4e2e; }
.fr-info-icon { width: 26px; height: 26px; border-radius: 8px; background: #eab84c; color: #fff; display: grid; place-items: center; font: 800 14px 'Bricolage Grotesque', sans-serif; flex: none; }

.fr-warn { background: #fbefea; border: 1px solid #f0ddd5; border-radius: 12px; color: #8a3b26; }

.fr-chip {
    background: #fff; border: 1.5px dashed #d8d0c2; border-radius: 999px;
    padding: 8px 16px; font-weight: 600; font-size: 13px; color: var(--fr-body); cursor: pointer;
}
.fr-chip:hover { border-color: var(--fr-acc); color: var(--fr-acc-ink); background: var(--fr-acc-soft); }

.fr-stepper-item { flex: 1; cursor: pointer; padding: 10px 4px 12px; border-radius: 12px; text-align: center; transition: background 0.2s; }
.fr-stepper-item:hover { background: var(--fr-acc-soft); }
.fr-stepper-item .bar { height: 4px; border-radius: 2px; margin: 9px 18px 0; background: #e5dfd6; }
.fr-stepper-item.done .bar, .fr-stepper-item.active .bar { background: var(--fr-acc); }
.fr-stepper-item.active { background: var(--fr-acc-soft); }

.fr-badge { border-radius: 999px; padding: 5px 12px; font-weight: 600; font-size: 12px; background: var(--fr-acc-soft); color: var(--fr-acc-ink); }
.fr-badge.off { background: #f2eee6; color: var(--fr-muted); }

.fr-seg { background: #efeae1; border-radius: 12px; padding: 4px; gap: 4px; display: inline-flex; }
.fr-seg button { border: none; border-radius: 9px; padding: 9px 18px; font-weight: 600; font-size: 13.5px; cursor: pointer; background: transparent; color: var(--fr-muted); }
.fr-seg button.on { background: #fff; color: var(--fr-ink); box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08); }

.form-control, .form-select { border: 1.5px solid #e5dfd6; font-weight: 600; }
.form-control:focus, .form-select:focus { border-color: var(--fr-acc); box-shadow: 0 0 0 3px oklch(0.5 0.1 165 / 0.12); }
.form-range::-webkit-slider-thumb { background: var(--fr-acc); }
.form-range::-moz-range-thumb { background: var(--fr-acc); }
input[type='checkbox'] { accent-color: var(--fr-acc); }

.fr-verdict { border-radius: 20px; color: #fff; }
.fr-verdict.win { background: var(--fr-acc); }
.fr-verdict.lose { background: var(--fr-danger); }
.fr-verdict.na { background: var(--fr-muted); }
.fr-verdict .cell { background: rgba(255, 255, 255, 0.14); border-radius: 12px; }

@keyframes fr-fade-up { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
.fr-fade { animation: fr-fade-up 0.3s ease; }

@media print {
    .no-print { display: none !important; }
    body { --bs-body-bg: #fff; }
}
```

- [ ] **Step 5: Verifier**

```bash
php bin/console debug:asset-map | grep -iE "bootstrap|alpine" | head -10
npm run lint && npm run format:check
composer cs
```
Expected: pas d'erreur ; des entrees bootstrap et alpinejs apparaissent dans l'asset map. Si `format:check` echoue sur app.css/app.js : lancer `npm run format`, inspecter le diff, re-checker.

- [ ] **Step 6: Commit**

```bash
git add importmap.php assets/ symfony.lock composer.json composer.lock templates/base.html.twig 2>/dev/null || git add importmap.php assets/ templates/base.html.twig
git status --short
git commit -m "feat: add alpine and bootstrap via importmap with sage theme"
```

---

### Task 2: Controleur + route + shell du template (TDD)

**Files:**
- Create: `src/Controller/SimulateurController.php`, `templates/simulateur/index.html.twig`
- Test: `tests/Controller/SimulateurControllerTest.php`

**Interfaces:**
- Consumes: composant Alpine `fraisReels` (placeholder Task 1)
- Produces: route `/` (`app_home`) ; `templates/simulateur/index.html.twig` avec le div racine `x-data="fraisReels"` dans lequel les tasks 5-8 incluront les partials

- [ ] **Step 1: Ecrire le test fonctionnel (rouge)**

Creer `tests/Controller/SimulateurControllerTest.php` :

```php
<?php

declare(strict_types=1);

namespace App\Tests\Controller;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

final class SimulateurControllerTest extends WebTestCase
{
    public function testHomePageRendersAlpineApp(): void
    {
        $client = self::createClient();
        $client->request('GET', '/');

        self::assertResponseIsSuccessful();
        self::assertSelectorExists('[x-data="fraisReels"]');
    }
}
```

- [ ] **Step 2: Verifier l'echec**

Run: `php bin/phpunit --filter SimulateurControllerTest`
Expected: FAIL (404 — aucune route `/`).

- [ ] **Step 3: Implementer le controleur**

Creer `src/Controller/SimulateurController.php` :

```php
<?php

declare(strict_types=1);

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

final class SimulateurController extends AbstractController
{
    #[Route('/', name: 'app_home')]
    public function index(): Response
    {
        return $this->render('simulateur/index.html.twig');
    }
}
```

Creer `templates/simulateur/index.html.twig` :

```twig
{% extends 'base.html.twig' %}

{% block title %}Frais réels — calculez vos frais déductibles{% endblock %}

{% block body %}
<div x-data="fraisReels" x-cloak style="min-height: 100vh">

    {# ==== Barre du haut ==== #}
    <div class="no-print d-flex align-items-center justify-content-between gap-3 px-4 py-3 mx-auto" style="max-width: 980px">
        <div role="button" @click="goHome()">
            <div class="fr-display fs-5 lh-1">frais r<span style="color: var(--fr-acc)">é</span>els</div>
            <div class="fr-muted small mt-1">Déclaration <span x-text="sim ? sim.annee : '2026'"></span> · revenus <span x-text="Y.rev"></span></div>
        </div>
        <template x-if="screen === 'wizard'">
            <input x-model="sim.name" aria-label="Nom de la simulation" class="form-control text-end border-0 bg-transparent" style="max-width: 260px">
        </template>
    </div>

    {# Les ecrans (home / wizard) seront inclus ici par les tasks suivantes #}

    {# ==== Pied de page baremes ==== #}
    <div class="mx-auto px-4 pb-4 small fr-muted" style="max-width: 980px">
        Outil d'aide au calcul, sans valeur contractuelle. Barèmes officiels de l'année de déclaration choisie
        (<span x-text="sim ? sim.annee : '2026'"></span>, revenus <span x-text="Y.rev"></span>) :
        repas au foyer <span x-text="eur2(Y.foyer)"></span>, plafond <span x-text="eur2(Y.plafond)"></span>,
        abattement 10 % de <span x-text="eur(Y.min)"></span> à <span x-text="eur(Y.max)"></span>,
        barème kilométrique DGFiP. Vérifiez votre situation sur impots.gouv.fr.
    </div>
</div>
{% endblock %}
```

ATTENTION : ce template reference `Y`, `eur`, `eur2`, `goHome` qui n'existent que dans le composant complet (Task 4). Pour que la page fonctionne des maintenant, completer le placeholder de `assets/app.js` :

```js
Alpine.data('fraisReels', () => ({
    screen: 'home',
    sim: null,
    Y: { rev: 2025, foyer: 5.45, plafond: 21.1, min: 509, max: 14555 },
    eur: (n) => `${n} €`,
    eur2: (n) => `${n} €`,
    goHome() { this.screen = 'home'; },
}));
```

- [ ] **Step 4: Verifier le vert + qualite**

```bash
php bin/phpunit --filter SimulateurControllerTest   # PASS
composer test && composer cs && composer stan && composer twig:cs
npm run lint && npm run format:check
```
Expected: tout vert.

- [ ] **Step 5: Commit**

```bash
git add src/Controller/SimulateurController.php templates/simulateur/index.html.twig tests/Controller/SimulateurControllerTest.php assets/app.js
git commit -m "feat: add simulateur route with alpine mount point"
```

---

### Task 3: Moteur fiscal engine.js (TDD node --test)

**Files:**
- Create: `assets/js/engine.js`
- Test: `assets/js/engine.test.js`
- Modify: `package.json` (script `test`), `eslint.config.mjs` (globals Node pour `*.test.js`)

**Interfaces:**
- Consumes: rien (module pur)
- Produces (exports exacts, consommes par Task 4) :
  - `num(v): number` — parse tolerant (virgule, espaces, null)
  - `eur(n): string` / `eur2(n): string` — format fr-FR arrondi / deux decimales, suffixe ` €`
  - `ANNEES: string[]` — `['2024','2025','2026']`
  - `yearCfg(annee): { foyer, plafond, min, max, rev }`
  - `blankSim(): object` — simulation vierge (structure spec)
  - `kmBareme(veh, cv, d): { v: number, f: string }`
  - `calc(sim): { repas, km, kmAn, kmFormule, jKm, mat, abos, total, net, abatt, joursEff, Y, matDed(it), aboPct(it) }`

- [ ] **Step 1: Script npm test + eslint globals**

Dans `package.json`, ajouter dans `scripts` :

```json
"test": "node --test assets/js/"
```

Dans `eslint.config.mjs`, ajouter APRES le bloc `files: ['assets/**/*.js']` et AVANT `prettier` :

```js
{
    files: ['assets/**/*.test.js'],
    languageOptions: {
        globals: { ...globals.node },
    },
},
```

- [ ] **Step 2: Ecrire les tests (rouge)**

Creer `assets/js/engine.test.js` :

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { num, yearCfg, blankSim, kmBareme, calc, ANNEES } from './engine.js';

function simWith(patch) {
    const sim = blankSim();
    return { ...sim, ...patch, profil: { ...sim.profil, ...(patch.profil || {}) }, repas: { ...sim.repas, ...(patch.repas || {}) }, km: { ...sim.km, ...(patch.km || {}) } };
}

test('num: parsing tolerant', () => {
    assert.equal(num('12,50'), 12.5);
    assert.equal(num('1 200'), 1200);
    assert.equal(num(''), 0);
    assert.equal(num(null), 0);
    assert.equal(num('abc'), 0);
});

test('yearCfg: baremes par annee et fallback', () => {
    assert.deepEqual(yearCfg('2024'), { foyer: 5.2, plafond: 20.2, min: 495, max: 14171, rev: 2023 });
    assert.deepEqual(yearCfg('2025'), { foyer: 5.35, plafond: 20.7, min: 504, max: 14426, rev: 2024 });
    assert.deepEqual(yearCfg('2026'), { foyer: 5.45, plafond: 21.1, min: 509, max: 14555, rev: 2025 });
    assert.equal(yearCfg('1999').rev, 2025);
    assert.deepEqual(ANNEES, ['2024', '2025', '2026']);
});

test('repas simple: (min(cout,plafond) - foyer - emp) x jours', () => {
    const c = calc(simWith({ repas: { jours: '135', cout: '12,50', emp: '' } }));
    assert.ok(Math.abs(c.repas - 135 * (12.5 - 5.45)) < 1e-9); // 951.75
});

test('repas: plafond applique et plancher zero', () => {
    const haut = calc(simWith({ repas: { jours: '10', cout: '30', emp: '' } }));
    assert.ok(Math.abs(haut.repas - 10 * (21.1 - 5.45)) < 1e-9);
    const bas = calc(simWith({ repas: { jours: '10', cout: '4', emp: '' } }));
    assert.equal(bas.repas, 0);
    const emp = calc(simWith({ repas: { jours: '10', cout: '12', emp: '8' } }));
    assert.equal(emp.repas, 0); // 12 - 5.45 - 8 < 0
});

test('repas: jours vides -> suggestion (joursSem - joursTT) x 45', () => {
    const c = calc(simWith({ profil: { joursSem: '5', joursTT: '2' }, repas: { jours: '', cout: '10', emp: '' } }));
    assert.equal(c.joursEff, 135);
});

test('repas detail: somme des mois', () => {
    const sim = blankSim();
    sim.repas.mode = 'detail';
    sim.repas.mois[0] = { jours: '10', cout: '12,45' }; // perDay 7 (2026)
    sim.repas.mois[1] = { jours: '5', cout: '10,45' }; // perDay 5
    const c = calc(sim);
    assert.ok(Math.abs(c.repas - (70 + 25)) < 1e-9);
});

test('kmBareme voiture 5CV: trois tranches', () => {
    assert.ok(Math.abs(kmBareme('voiture', '5', 4000).v - 4000 * 0.636) < 1e-9);
    assert.ok(Math.abs(kmBareme('voiture', '5', 10000).v - (10000 * 0.357 + 1395)) < 1e-9);
    assert.ok(Math.abs(kmBareme('voiture', '5', 25000).v - 25000 * 0.427) < 1e-9);
});

test('kmBareme moto et cyclo', () => {
    assert.ok(Math.abs(kmBareme('moto', '3', 2000).v - 2000 * 0.468) < 1e-9);
    assert.ok(Math.abs(kmBareme('cyclo', '0', 5000).v - (5000 * 0.079 + 711)) < 1e-9);
});

test('calc km: distance x 2 x AR x jours + autres, electrique +20%, arrondi', () => {
    const c = calc(simWith({ km: { veh: 'voiture', cv: '5', dist: '12', ar: '1', jours: '135', autres: '' } }));
    assert.equal(c.kmAn, 3240);
    assert.equal(c.km, Math.round(3240 * 0.636)); // 2061
    const e = calc(simWith({ km: { veh: 'voiture', cv: '5', dist: '12', ar: '1', jours: '135', autres: '', elec: true } }));
    assert.equal(e.km, Math.round(3240 * 0.636 * 1.2));
});

test('materiel: bascule 500 EUR et fenetre de 3 ans', () => {
    const sim = blankSim(); // annee 2026 -> rev 2025
    sim.materiel = [
        { id: 'a', label: 'PC', prix: '899', annee: '2025', pct: '70' }, // amorti: 899/3*0.7
        { id: 'b', label: 'Souris', prix: '400', annee: '2025', pct: '50' }, // one shot: 200
        { id: 'c', label: 'Ecran', prix: '400', annee: '2024', pct: '50' }, // deja deduit: 0
        { id: 'd', label: 'Chaise', prix: '600', annee: '2022', pct: '100' }, // hors fenetre: 0
        { id: 'e', label: 'Bureau', prix: '600', annee: '2023', pct: '100' }, // amorti (rev-2): 200
    ];
    const c = calc(sim);
    assert.ok(Math.abs(c.mat - ((899 / 3) * 0.7 + 200 + 0 + 0 + 200)) < 1e-9);
});

test('abos: mensuel x mois x pct, loyer par surfaces plafonne a 100', () => {
    const sim = blankSim(); // joursTT defaut 2
    sim.abos = [
        { id: 'a', label: 'Box', mensuel: '39,99', mois: '12', pct: '29', kind: '', surfB: '', surfL: '' },
        { id: 'b', label: 'Loyer', mensuel: '800', mois: '12', pct: '0', kind: 'loyer', surfB: '10', surfL: '65' },
        { id: 'c', label: 'Loyer sans surface', mensuel: '800', mois: '12', pct: '0', kind: 'loyer', surfB: '10', surfL: '' },
    ];
    const c = calc(sim);
    const loyerPct = Math.min(100, (10 / 65) * (2 / 7) * 100);
    assert.ok(Math.abs(c.abos - (39.99 * 12 * 0.29 + 800 * 12 * loyerPct / 100 + 0)) < 1e-9);
    assert.ok(Math.abs(c.aboPct(sim.abos[1]) - loyerPct) < 1e-9);
});

test('abattement: 10% clamp min/max, 0 sans salaire', () => {
    assert.equal(calc(simWith({ profil: { salaire: '35 000' } })).abatt, 3500);
    assert.equal(calc(simWith({ profil: { salaire: '3000' } })).abatt, 509);
    assert.equal(calc(simWith({ profil: { salaire: '200000' } })).abatt, 14555);
    assert.equal(calc(simWith({ profil: { salaire: '' } })).abatt, 0);
});

test('total net: allocation soustraite, plancher 0', () => {
    const sim = simWith({ repas: { jours: '10', cout: '12,45', emp: '' } }); // repas 70
    sim.alloc = '30';
    assert.equal(calc(sim).net, 40);
    sim.alloc = '500';
    assert.equal(calc(sim).net, 0);
});

test('scenario E2E de reference (decl 2026)', () => {
    const sim = blankSim();
    sim.profil = { salaire: '35000', joursSem: '5', joursTT: '2' };
    sim.repas = { ...sim.repas, jours: '', cout: '12,50', emp: '' };
    sim.km = { ...sim.km, veh: 'voiture', cv: '5', dist: '12', ar: '1', jours: '', autres: '' };
    sim.materiel = [{ id: 'm', label: 'Ordinateur', prix: '899', annee: '2025', pct: '70' }];
    sim.abos = [{ id: 'a', label: 'Box internet', mensuel: '39,99', mois: '12', pct: '29', kind: '', surfB: '', surfL: '' }];
    const c = calc(sim);
    assert.ok(Math.abs(c.repas - 951.75) < 1e-9);
    assert.equal(c.km, 2061);
    assert.ok(Math.abs(c.mat - 209.76666666666665) < 1e-6);
    assert.ok(Math.abs(c.abos - 139.1652) < 1e-9);
    assert.equal(Math.round(c.total), 3362);
    assert.equal(c.abatt, 3500); // abattement gagne dans ce scenario
});
```

- [ ] **Step 3: Verifier l'echec**

Run: `npm test`
Expected: FAIL — `Cannot find module ... engine.js`.

- [ ] **Step 4: Implementer engine.js**

Creer `assets/js/engine.js` :

```js
// Pure fiscal engine: no DOM, no Alpine. Rules ported from the validated spec.

export const ANNEES = ['2024', '2025', '2026'];

const YEAR_CFG = {
    2024: { foyer: 5.2, plafond: 20.2, min: 495, max: 14171, rev: 2023 },
    2025: { foyer: 5.35, plafond: 20.7, min: 504, max: 14426, rev: 2024 },
    2026: { foyer: 5.45, plafond: 21.1, min: 509, max: 14555, rev: 2025 },
};

// Per vehicle: distance brackets [b1, b2] and per-cv rates [a, b, c, e]:
// d <= b1 -> d*a ; b1 < d <= b2 -> d*b + c ; d > b2 -> d*e
const KM_TABLES = {
    voiture: {
        br: [5000, 20000],
        r: {
            3: [0.529, 0.316, 1065, 0.37],
            4: [0.606, 0.34, 1330, 0.407],
            5: [0.636, 0.357, 1395, 0.427],
            6: [0.665, 0.374, 1457, 0.447],
            7: [0.697, 0.394, 1515, 0.47],
        },
    },
    moto: {
        br: [3000, 6000],
        r: { 1: [0.395, 0.099, 891, 0.248], 3: [0.468, 0.082, 1158, 0.275], 6: [0.606, 0.079, 1583, 0.343] },
    },
    cyclo: { br: [3000, 6000], r: { 0: [0.315, 0.079, 711, 0.198] } },
};

export function num(v) {
    const n = parseFloat(
        String(v ?? '')
            .replace(/\s/g, '')
            .replace(',', '.'),
    );
    return Number.isNaN(n) ? 0 : n;
}

export function eur(n) {
    return `${n.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €`;
}

export function eur2(n) {
    return `${n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;
}

export function yearCfg(annee) {
    return YEAR_CFG[annee] || YEAR_CFG['2026'];
}

export function blankSim() {
    return {
        name: `Simulation du ${new Date().toLocaleDateString('fr-FR')}`,
        annee: '2026',
        profil: { salaire: '', joursSem: '5', joursTT: '2' },
        repas: { mode: 'simple', jours: '', cout: '', emp: '', mois: Array.from({ length: 12 }, () => ({ jours: '', cout: '' })) },
        km: { veh: 'voiture', cv: '5', cvMoto: '3', elec: false, dist: '', ar: '1', jours: '', autres: '' },
        materiel: [],
        abos: [],
        alloc: '',
    };
}

export function kmBareme(veh, cv, d) {
    const t = KM_TABLES[veh] || KM_TABLES.voiture;
    const r = t.r[cv] || Object.values(t.r)[0];
    const dk = d.toLocaleString('fr-FR');
    if (d <= t.br[0]) return { v: d * r[0], f: `${dk} km à ${String(r[0]).replace('.', ',')}` };
    if (d <= t.br[1]) return { v: d * r[1] + r[2], f: `(${dk} km à ${String(r[1]).replace('.', ',')}) + ${r[2]} €` };
    return { v: d * r[3], f: `${dk} km à ${String(r[3]).replace('.', ',')}` };
}

export function calc(sim) {
    const Y = yearCfg(sim.annee);
    const emp = num(sim.repas.emp);
    const perDay = (cout) => Math.max(0, Math.min(num(cout), Y.plafond) - Y.foyer - emp);

    const jSem = num(sim.profil.joursSem) || 5;
    const jTT = Math.min(num(sim.profil.joursTT), jSem);
    const joursAuto = Math.max(0, Math.round((jSem - jTT) * 45));
    const joursEff = String(sim.repas.jours ?? '').trim() === '' ? joursAuto : num(sim.repas.jours);

    const repas =
        sim.repas.mode === 'simple'
            ? joursEff * perDay(sim.repas.cout)
            : sim.repas.mois.reduce((t, m) => t + num(m.jours) * perDay(m.cout), 0);

    const matDed = (it) => {
        const prix = num(it.prix);
        const pct = num(it.pct) / 100;
        const an = parseInt(it.annee, 10) || Y.rev;
        if (prix <= 0) return 0;
        if (prix <= 500) return an === Y.rev ? prix * pct : 0;
        return an >= Y.rev - 2 && an <= Y.rev ? (prix / 3) * pct : 0;
    };
    const mat = sim.materiel.reduce((t, it) => t + matDed(it), 0);

    const aboPct = (it) => {
        if (it.kind === 'loyer') {
            const sB = num(it.surfB);
            const sL = num(it.surfL);
            return sL > 0 ? Math.min(100, (sB / sL) * (jTT / 7) * 100) : 0;
        }
        return num(it.pct);
    };
    const abos = sim.abos.reduce((t, it) => t + (num(it.mensuel) * num(it.mois) * aboPct(it)) / 100, 0);

    const k = sim.km || {};
    const jKm = String(k.jours ?? '').trim() === '' ? joursAuto : num(k.jours);
    const kmAn = Math.round(num(k.dist) * 2 * (num(k.ar) || 1) * jKm + num(k.autres));
    const cvKey = k.veh === 'moto' ? k.cvMoto || '3' : k.veh === 'cyclo' ? '0' : k.cv || '5';
    let km = 0;
    let kmFormule = '';
    if (kmAn > 0) {
        const b = kmBareme(k.veh || 'voiture', cvKey, kmAn);
        km = b.v;
        kmFormule = b.f;
        if (k.elec) {
            km *= 1.2;
            kmFormule += ' × 1,20 (électrique)';
        }
    }
    km = Math.round(km);

    const total = repas + km + mat + abos;
    const net = Math.max(0, total - num(sim.alloc));
    const sal = num(sim.profil.salaire);
    const abatt = sal > 0 ? Math.min(Math.max(sal * 0.1, Y.min), Y.max) : 0;

    return { repas, km, kmAn, kmFormule, jKm, mat, abos, total, net, abatt, joursEff, Y, matDed, aboPct };
}
```

- [ ] **Step 5: Verifier le vert + qualite**

```bash
npm test              # PASS: 13 tests
npm run lint && npm run format:check
```
Si `format:check` rale : `npm run format`, inspecter le diff (forme uniquement), re-checker. Les tests DOIVENT re-passer apres tout reformatage.

- [ ] **Step 6: Commit**

```bash
git add assets/js/engine.js assets/js/engine.test.js package.json eslint.config.mjs
git commit -m "feat: add pure fiscal engine with node test suite"
```

---

### Task 4: storage.js + composant Alpine complet

**Files:**
- Create: `assets/js/storage.js`
- Modify: `assets/app.js` (remplace le placeholder par le composant complet)

**Interfaces:**
- Consumes: tous les exports de `assets/js/engine.js` (Task 3)
- Produces (membres du composant `fraisReels`, consommes par les templates des tasks 5-8) :
  - state : `screen` ('home'|'wizard'), `step` (0-5), `simId`, `sim`, `hist`
  - constantes : `labels[6]`, `MOIS[12]`, `MAT_PRESETS`, `ABO_PRESETS`, `ANNEES`
  - helpers : `num`, `eur`, `eur2`, `fmtDate(ts)`
  - getters : `c` (resultat calc), `Y`, `jSem`, `jTT`, `prorata`, `joursSiteSuggest`, `fraisGagnent`, `verdict` (`{ title, text, cls }`)
  - actions : `goHome()`, `newSim()`, `openSim(id)`, `dupSim(id)`, `delSim(id)`, `prev()`, `next()`, `goStep(i)`, `addMat(preset)`, `delMat(i)`, `addAbo(preset)`, `delAbo(i)`, `print()`
  - methodes d'affichage : `matRegime(it)` → `{ label, off }`, `aboPctEff(it)`, `loyerFormule(it)`, `repasDedMois(m)`

- [ ] **Step 1: storage.js**

Creer `assets/js/storage.js` :

```js
// localStorage persistence. Key kept from the original mock for data compatibility.
const KEY = 'fr2026_sims';

export function loadHistory() {
    try {
        return JSON.parse(localStorage.getItem(KEY) || '[]');
    } catch {
        return [];
    }
}

export function saveHistory(hist) {
    try {
        localStorage.setItem(KEY, JSON.stringify(hist));
    } catch {
        // Storage unavailable (private mode, quota): the app keeps working in memory.
    }
}
```

- [ ] **Step 2: Composant complet dans app.js**

Remplacer le contenu de `assets/app.js` par (conserver l'import `stimulus_bootstrap` s'il existait) :

```js
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/app.css';
import Alpine from 'alpinejs';
import { ANNEES, num, eur, eur2, yearCfg, blankSim, calc } from './js/engine.js';
import { loadHistory, saveHistory } from './js/storage.js';

const LABELS = ['Profil', 'Repas', 'Trajets', 'Matériel', 'Abonnements', 'Synthèse'];
const MOIS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
const MAT_PRESETS = [
    { label: 'Ordinateur', pct: '70' },
    { label: 'Écran', pct: '70' },
    { label: 'Téléphone', pct: '50' },
    { label: 'Bureau', pct: '80' },
    { label: 'Chaise', pct: '80' },
    { label: 'Clavier / souris', pct: '70' },
];
const ABO_PRESETS = [
    { label: 'Box internet', home: true },
    { label: 'Forfait mobile', pct: '50' },
    { label: 'Électricité', home: true },
    { label: 'Loyer', kind: 'loyer' },
    { label: 'Abonnement IA', pct: '80' },
    { label: 'Logiciels', pct: '100' },
];

Alpine.data('fraisReels', () => ({
    screen: 'home',
    step: 0,
    simId: null,
    sim: null,
    hist: loadHistory(),

    labels: LABELS,
    MOIS,
    MAT_PRESETS,
    ABO_PRESETS,
    ANNEES,

    num,
    eur,
    eur2,

    init() {
        // Deep-persist: stringify touches every nested key, so the effect
        // re-runs on any sim mutation (x-model writes included).
        Alpine.effect(() => {
            if (!this.sim || !this.simId) return;
            const snapshot = JSON.stringify(this.sim);
            this.syncHist(snapshot);
        });
    },

    syncHist(snapshot) {
        const totals = calc(this.sim);
        this.hist = this.hist.map((h) =>
            h.id === this.simId ? { ...h, name: this.sim.name, updated: Date.now(), total: totals.net, sim: JSON.parse(snapshot) } : h,
        );
        saveHistory(this.hist);
    },

    get c() {
        return calc(this.sim || blankSim());
    },
    get Y() {
        return yearCfg(this.sim ? this.sim.annee : '2026');
    },
    get jSem() {
        return this.sim ? num(this.sim.profil.joursSem) || 5 : 5;
    },
    get jTT() {
        return this.sim ? Math.min(num(this.sim.profil.joursTT), this.jSem) : 0;
    },
    get prorata() {
        return Math.round((this.jTT / 7) * 100);
    },
    get joursSiteSuggest() {
        return Math.max(0, Math.round((this.jSem - this.jTT) * 45));
    },
    get fraisGagnent() {
        const c = this.c;
        return c.abatt > 0 ? c.net > c.abatt : c.total > 0;
    },
    get verdict() {
        const c = this.c;
        const alloc = num(this.sim ? this.sim.alloc : '');
        if (c.abatt <= 0) {
            return {
                title: 'Renseignez votre salaire',
                text: 'Indiquez votre salaire net imposable à l’étape 1 pour comparer vos frais réels avec l’abattement forfaitaire de 10 %.',
                cls: 'na',
            };
        }
        if (this.fraisGagnent) {
            const gain = eur(c.net - c.abatt);
            return {
                title: 'Les frais réels sont avantageux',
                text:
                    alloc > 0
                        ? `Après déduction de l'allocation télétravail reçue (${eur(alloc)}), vos frais réels dépassent l'abattement de 10 % de ${gain}. Optez pour les frais réels.`
                        : `Vos frais réels dépassent l'abattement de 10 % de ${gain}. Optez pour les frais réels.`,
                cls: 'win',
            };
        }
        return {
            title: 'Restez à l’abattement de 10 %',
            text: `Vos frais réels nets (${eur(c.net)}) restent sous l'abattement automatique (${eur(c.abatt)}). Ne cochez pas l'option frais réels : vous y perdriez ${eur(c.abatt - c.net)}.`,
            cls: 'lose',
        };
    },

    fmtDate(ts) {
        return new Date(ts).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
    },

    goHome() {
        this.screen = 'home';
    },
    goStep(i) {
        this.step = i;
    },
    prev() {
        this.step = Math.max(0, this.step - 1);
    },
    next() {
        if (this.step < 5) this.step += 1;
        else this.screen = 'home';
    },
    print() {
        window.print();
    },

    newSim() {
        const sim = blankSim();
        const id = `sim_${Date.now()}`;
        this.hist = [{ id, name: sim.name, updated: Date.now(), total: 0, sim }, ...this.hist];
        saveHistory(this.hist);
        this.simId = id;
        this.sim = sim;
        this.screen = 'wizard';
        this.step = 0;
    },
    openSim(id) {
        const entry = this.hist.find((h) => h.id === id);
        if (!entry) return;
        const sim = JSON.parse(JSON.stringify(entry.sim));
        // Soft migration for entries saved by older versions of the data shape.
        if (!sim.repas.mois) sim.repas.mois = Array.from({ length: 12 }, () => ({ jours: '', cout: '' }));
        if (!sim.annee) sim.annee = '2026';
        if (!sim.km) sim.km = blankSim().km;
        this.simId = id;
        this.sim = sim;
        this.screen = 'wizard';
        this.step = 0;
    },
    dupSim(id) {
        const entry = this.hist.find((h) => h.id === id);
        if (!entry) return;
        const sim = JSON.parse(JSON.stringify(entry.sim));
        sim.name = `${entry.name} (copie)`;
        this.hist = [{ id: `sim_${Date.now()}`, name: sim.name, updated: Date.now(), total: entry.total, sim }, ...this.hist];
        saveHistory(this.hist);
    },
    delSim(id) {
        const entry = this.hist.find((h) => h.id === id);
        if (!entry) return;
        if (!confirm(`Supprimer « ${entry.name} » ?`)) return;
        this.hist = this.hist.filter((h) => h.id !== id);
        saveHistory(this.hist);
    },

    addMat(preset) {
        this.sim.materiel.push({
            id: `m${Date.now()}${Math.random()}`,
            label: preset.label,
            prix: '',
            annee: String(this.Y.rev),
            pct: preset.pct,
        });
    },
    delMat(i) {
        this.sim.materiel.splice(i, 1);
    },
    matRegime(it) {
        const prix = num(it.prix);
        const an = parseInt(it.annee, 10) || this.Y.rev;
        if (prix <= 0) return { label: 'à compléter', off: true };
        if (prix <= 500) {
            if (an === this.Y.rev) return { label: 'Déduit en une fois', off: false };
            return { label: `Déjà déduit en ${an}`, off: true };
        }
        if (an < this.Y.rev - 2) return { label: 'Amortissement terminé', off: true };
        return { label: `Amorti sur 3 ans (${an}–${an + 2})`, off: false };
    },

    addAbo(preset) {
        this.sim.abos.push({
            id: `a${Date.now()}${Math.random()}`,
            label: preset.label,
            mensuel: '',
            mois: '12',
            pct: preset.home ? String(this.prorata) : preset.pct || '50',
            kind: preset.kind || '',
            surfB: '',
            surfL: '',
        });
    },
    delAbo(i) {
        this.sim.abos.splice(i, 1);
    },
    aboPctEff(it) {
        return this.c.aboPct(it);
    },
    loyerFormule(it) {
        return `(${num(it.surfB) || '?'} m² ÷ ${num(it.surfL) || '?'} m²) × ${this.jTT.toLocaleString('fr-FR')} j télétravail / 7`;
    },
    repasDedMois(m) {
        const emp = num(this.sim.repas.emp);
        const perDay = Math.max(0, Math.min(num(m.cout), this.Y.plafond) - this.Y.foyer - emp);
        return eur2(num(m.jours) * perDay);
    },
}));

window.Alpine = Alpine;
Alpine.start();
```

- [ ] **Step 3: Verifier**

```bash
node --check assets/app.js && node --check assets/js/storage.js
npm test && npm run lint && npm run format:check
php bin/phpunit --filter SimulateurControllerTest
```
Expected: tout vert (le test fonctionnel passe toujours : le composant expose bien `Y`, `eur`, `eur2`, `goHome`).

- [ ] **Step 4: Commit**

```bash
git add assets/js/storage.js assets/app.js
git commit -m "feat: add alpine component with storage and fiscal state"
```

---

### Task 5: Ecran d'accueil

**Files:**
- Create: `templates/simulateur/_home.html.twig`
- Modify: `templates/simulateur/index.html.twig` (inclusion)

**Interfaces:**
- Consumes: `screen`, `hist`, `newSim()`, `openSim(id)`, `dupSim(id)`, `delSim(id)`, `eur`, `fmtDate(ts)`, `Y`
- Produces: ecran d'accueil complet

- [ ] **Step 1: Creer le partial**

Creer `templates/simulateur/_home.html.twig` :

```twig
<div class="mx-auto px-4 pb-5 fr-fade" style="max-width: 980px">

    <div class="fr-card p-4 p-lg-5 row g-5 align-items-center mx-0">
        <div class="col-lg-7">
            <span class="fr-badge d-inline-flex mb-3">Barèmes officiels, déclarations 2024 à 2026</span>
            <h1 class="mb-3" style="font-size: clamp(28px, 4vw, 40px); text-wrap: pretty">Vos frais réels, calculés simplement.</h1>
            <p class="fr-body-text mb-4" style="text-wrap: pretty">
                Repas, trajets, matériel de télétravail, abonnements : l'assistant applique les règles fiscales
                à votre place, compare avec l'abattement de 10 % et vous donne le montant exact à reporter case 1AK.
            </p>
            <button class="btn btn-fr btn-lg px-4" @click="newSim()">Nouvelle simulation</button>
        </div>
        <div class="col-lg-5 d-flex flex-column gap-2">
            {% for point in [
                'Frais de repas et de trajet, au barème de l\'année choisie',
                'Matériel : amortissement automatique au-delà de 500 €',
                'Abonnements et loyer : prorata usage pro / perso calculé',
                'Verdict : frais réels ou abattement 10 % ?'
            ] %}
                <div class="fr-panel d-flex gap-3 align-items-center p-3">
                    <div class="fr-display d-grid place-items-center flex-none" style="width: 34px; height: 34px; border-radius: 10px; background: var(--fr-acc-mid); color: var(--fr-acc-ink); display: grid; place-items: center">{{ loop.index }}</div>
                    <div class="fw-medium" style="font-size: 14px">{{ point }}</div>
                </div>
            {% endfor %}
        </div>
    </div>

    <div class="mt-5">
        <div class="d-flex align-items-baseline justify-content-between mb-3">
            <h2 class="fs-4 m-0">Mes simulations</h2>
            <div class="fr-muted small" x-text="hist.length + (hist.length > 1 ? ' simulations enregistrées' : ' simulation enregistrée')"></div>
        </div>

        <div x-show="hist.length === 0" class="fr-empty p-5 text-center fw-medium">
            Aucune simulation pour l'instant. Elles seront enregistrées ici automatiquement, et resteront modifiables.
        </div>

        <div class="d-flex flex-column gap-2">
            <template x-for="row in hist" :key="row.id">
                <div class="fr-card d-flex align-items-center gap-3 px-4 py-3" style="border-radius: 16px">
                    <div class="flex-grow-1 min-w-0" role="button" @click="openSim(row.id)">
                        <div class="fw-bold" x-text="row.name"></div>
                        <div class="fr-muted small mt-1">Modifiée le <span x-text="fmtDate(row.updated)"></span></div>
                    </div>
                    <div class="text-end me-2">
                        <div class="fr-amount fs-6" x-text="eur(row.total || 0)"></div>
                        <div class="fr-muted" style="font-size: 11.5px">frais déductibles</div>
                    </div>
                    <div class="d-flex gap-2">
                        <button class="btn btn-fr-soft btn-sm" @click="openSim(row.id)">Reprendre</button>
                        <button class="btn btn-fr-outline btn-sm" title="Dupliquer" @click="dupSim(row.id)">Dupliquer</button>
                        <button class="btn btn-fr-danger-ghost btn-sm" title="Supprimer" @click="delSim(row.id)">Supprimer</button>
                    </div>
                </div>
            </template>
        </div>
    </div>
</div>
```

- [ ] **Step 2: Inclure dans index.html.twig**

Dans `templates/simulateur/index.html.twig`, remplacer le commentaire `{# Les ecrans ... #}` par :

```twig
    <template x-if="screen === 'home'">
        {{ include('simulateur/_home.html.twig') }}
    </template>
```

ATTENTION Alpine : `<template x-if>` exige UN SEUL element racine — le partial `_home` commence bien par un unique `<div>`.

- [ ] **Step 3: Verifier**

```bash
composer twig:cs && php bin/phpunit && npm run lint
symfony server:start -d --port=8321 2>/dev/null || true
curl -s http://127.0.0.1:8321/ | grep -c "Nouvelle simulation"
symfony server:stop 2>/dev/null || true
```
Expected: twig:cs OK, phpunit OK, `curl | grep -c` ≥ 1 (le HTML source contient l'accueil).

- [ ] **Step 4: Commit**

```bash
git add templates/simulateur/
git commit -m "feat: add simulator home screen with history list"
```

---

### Task 6: Shell wizard + etapes Profil et Repas

**Files:**
- Create: `templates/simulateur/_step_profil.html.twig`, `templates/simulateur/_step_repas.html.twig`
- Modify: `templates/simulateur/index.html.twig` (shell wizard : stepper + navigation + inclusions)

**Interfaces:**
- Consumes: `sim`, `step`, `labels`, `goStep`, `prev`, `next`, `ANNEES`, `Y`, `c`, `prorata`, `joursSiteSuggest`, `eur`, `eur2`, `MOIS`, `repasDedMois`
- Produces: navigation du wizard operationnelle ; etapes 1-2 fonctionnelles

- [ ] **Step 1: Shell wizard dans index.html.twig**

Apres le `<template x-if="screen === 'home'">…</template>`, ajouter :

```twig
    <template x-if="screen === 'wizard'">
        <div class="mx-auto px-4 pb-5" style="max-width: 980px">

            {# Stepper #}
            <div class="no-print d-flex gap-1 mb-4">
                <template x-for="(label, i) in labels" :key="i">
                    <div class="fr-stepper-item" :class="{ active: step === i, done: i < step }" @click="goStep(i)">
                        <div class="fw-bold" style="font-size: 12px; letter-spacing: 0.4px" :style="step === i ? 'color: var(--fr-acc)' : 'color: #b8b0a1'">ÉTAPE <span x-text="i + 1"></span></div>
                        <div class="fw-semibold mt-1" style="font-size: 13.5px" :style="step === i ? 'color: var(--fr-acc-ink)' : i < step ? 'color: #3e3a32' : 'color: #a39b8d'" x-text="label"></div>
                        <div class="bar"></div>
                    </div>
                </template>
            </div>

            {{ include('simulateur/_step_profil.html.twig') }}
            {{ include('simulateur/_step_repas.html.twig') }}
            {# Les etapes 3 a 6 seront incluses ici par les tasks suivantes #}

            {# Navigation #}
            <div class="no-print d-flex justify-content-between mt-4">
                <button class="btn btn-fr-outline px-4 py-2" :style="step === 0 ? 'visibility: hidden' : ''" @click="prev()">
                    ← <span x-text="step > 0 ? labels[step - 1] : ''"></span>
                </button>
                <button class="btn btn-fr px-4 py-2" @click="next()" x-text="step < 5 ? 'Continuer : ' + labels[step + 1] : 'Terminer'"></button>
            </div>
        </div>
    </template>
```

- [ ] **Step 2: Etape Profil**

Creer `templates/simulateur/_step_profil.html.twig` :

```twig
<div x-show="step === 0" class="fr-fade">
    <h2 class="fs-3 mb-2">Votre situation</h2>
    <p class="fr-body-text mb-4" style="max-width: 640px; text-wrap: pretty">
        Ces informations servent à calculer le prorata télétravail et à comparer vos frais réels
        avec l'abattement forfaitaire de 10 %.
    </p>

    <div class="fr-card p-4">
        <div class="mb-4">
            <label class="form-label fw-semibold">Année de déclaration</label>
            <div class="d-flex gap-2 flex-wrap">
                <template x-for="a in ANNEES" :key="a">
                    <button type="button" class="btn text-start px-4 py-2"
                            :class="sim.annee === a ? 'btn-fr' : 'btn-fr-outline'"
                            @click="sim.annee = a">
                        <span class="d-block fr-display fs-6" x-text="a"></span>
                        <span class="d-block small opacity-75" x-text="'revenus ' + (parseInt(a, 10) - 1)"></span>
                    </button>
                </template>
            </div>
            <div class="form-text fr-muted">Tous les barèmes (repas, kilométrique, abattement) s'ajustent automatiquement.</div>
        </div>

        <div class="mb-4">
            <label class="form-label fw-semibold">Salaire net imposable annuel</label>
            <div class="input-group" style="max-width: 320px">
                <input type="text" inputmode="decimal" class="form-control" placeholder="35 000" x-model="sim.profil.salaire">
                <span class="input-group-text">€</span>
            </div>
            <div class="form-text fr-muted">Ligne « salaires » de votre déclaration, avant abattement. Sert uniquement à la comparaison.</div>
        </div>

        <div class="row g-4">
            <div class="col-md-6">
                <label class="form-label fw-semibold">Jours travaillés par semaine</label>
                <input type="text" inputmode="decimal" class="form-control" style="max-width: 120px" x-model="sim.profil.joursSem">
            </div>
            <div class="col-md-6">
                <label class="form-label fw-semibold">Dont jours de télétravail par semaine</label>
                <input type="text" inputmode="decimal" class="form-control" style="max-width: 120px" x-model="sim.profil.joursTT">
                <div class="form-text fr-muted">Les demi-journées comptent : 2,5 par exemple.</div>
            </div>
        </div>

        <div class="row g-3 mt-2">
            <div class="col-md-6">
                <div class="fr-soft p-3 h-100">
                    <div class="fw-semibold small" style="letter-spacing: 0.3px">PRORATA TÉLÉTRAVAIL ESTIMÉ</div>
                    <div class="fr-amount fs-4 mt-1" x-text="prorata + ' %'"></div>
                    <div class="small mt-1" style="color: #4a5b52">Proposé par défaut pour vos abonnements liés au domicile, ajustable poste par poste.</div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="fr-panel p-3 h-100">
                    <div class="fw-semibold small fr-muted" style="letter-spacing: 0.3px">VOTRE ABATTEMENT 10 %</div>
                    <div class="fr-display fs-4 mt-1" x-text="c.abatt > 0 ? eur(c.abatt) : 'à renseigner'"></div>
                    <div class="small fr-body-text mt-1">C'est la barre à dépasser pour que les frais réels soient avantageux.</div>
                </div>
            </div>
        </div>
    </div>

    <div class="fr-info d-flex gap-3 p-3 mt-3">
        <div class="fr-info-icon">i</div>
        <div class="small" style="line-height: 1.6; text-wrap: pretty">
            <strong>Comment ça marche ?</strong> Par défaut, le fisc déduit automatiquement 10 % de votre salaire
            (minimum <span x-text="eur(Y.min)"></span>, plafond <span x-text="eur(Y.max)"></span> pour les revenus
            <span x-text="Y.rev"></span>). Opter pour les frais réels remplace cet abattement : cela ne vaut le coup
            que si le total de vos frais justifiés le dépasse. Conservez tous vos justificatifs 3 ans.
        </div>
    </div>
</div>
```

- [ ] **Step 3: Etape Repas**

Creer `templates/simulateur/_step_repas.html.twig` :

```twig
<div x-show="step === 1" class="fr-fade">
    <h2 class="fs-3 mb-2">Frais de repas</h2>
    <p class="fr-body-text mb-3" style="max-width: 680px; text-wrap: pretty">
        Déductibles uniquement pour les jours travaillés <strong>sur site</strong>, quand vous ne pouvez pas rentrer
        déjeuner chez vous. Les jours de télétravail n'ouvrent pas droit à déduction.
    </p>

    <div class="no-print fr-seg mb-3">
        <button type="button" :class="{ on: sim.repas.mode === 'simple' }" @click="sim.repas.mode = 'simple'">Saisie rapide</button>
        <button type="button" :class="{ on: sim.repas.mode === 'detail' }" @click="sim.repas.mode = 'detail'">Mois par mois</button>
    </div>

    <div x-show="sim.repas.mode === 'simple'" class="fr-card p-4">
        <div class="row g-4">
            <div class="col-md-4">
                <label class="form-label fw-semibold">Jours sur site avec repas payé</label>
                <input type="text" inputmode="numeric" class="form-control" :placeholder="joursSiteSuggest" x-model="sim.repas.jours">
                <div class="form-text fr-muted">Calculé automatiquement : (jours travaillés − jours de télétravail) × 45 semaines. Modifiable.</div>
            </div>
            <div class="col-md-4">
                <label class="form-label fw-semibold">Coût moyen d'un repas</label>
                <div class="input-group">
                    <input type="text" inputmode="decimal" class="form-control" placeholder="12,50" x-model="sim.repas.cout">
                    <span class="input-group-text">€</span>
                </div>
                <div class="form-text fr-muted">Plafonné à <span x-text="eur2(Y.plafond)"></span> par le fisc.</div>
            </div>
            <div class="col-md-4">
                <label class="form-label fw-semibold">Participation employeur / jour</label>
                <div class="input-group">
                    <input type="text" inputmode="decimal" class="form-control" placeholder="0" x-model="sim.repas.emp">
                    <span class="input-group-text">€</span>
                </div>
                <div class="form-text fr-muted">Part patronale du titre-restaurant, subvention cantine…</div>
            </div>
        </div>
    </div>

    <div x-show="sim.repas.mode === 'detail'" class="fr-card p-4">
        <div class="fw-semibold small fr-muted pb-2 border-bottom" style="display: grid; grid-template-columns: 110px 1fr 1fr 110px; gap: 10px 16px; letter-spacing: 0.3px">
            <div>MOIS</div><div>JOURS SUR SITE</div><div>COÛT MOYEN (€)</div><div class="text-end">DÉDUIT</div>
        </div>
        <template x-for="(m, i) in sim.repas.mois" :key="i">
            <div class="py-2 border-bottom" style="display: grid; grid-template-columns: 110px 1fr 1fr 110px; gap: 10px 16px; align-items: center; border-color: #f7f3ec !important">
                <div class="fw-semibold small" x-text="MOIS[i]"></div>
                <input type="text" inputmode="numeric" class="form-control form-control-sm" placeholder="0" x-model="m.jours">
                <input type="text" inputmode="decimal" class="form-control form-control-sm" placeholder="0" x-model="m.cout">
                <div class="text-end fw-bold fr-ink small" x-text="repasDedMois(m)"></div>
            </div>
        </template>
        <div class="d-flex align-items-center gap-2 pt-3 small fr-muted">
            Participation employeur / jour :
            <input type="text" inputmode="decimal" class="form-control form-control-sm" style="width: 90px" placeholder="0" x-model="sim.repas.emp"> €
        </div>
    </div>

    <div class="fr-soft d-flex justify-content-between align-items-center flex-wrap gap-3 p-3 px-4 mt-3">
        <div class="fw-semibold" x-text="sim.repas.mode === 'simple'
            ? (c.joursEff > 0 && num(sim.repas.cout) > 0
                ? c.joursEff + ' jours à ' + eur2(Math.max(0, Math.min(num(sim.repas.cout), Y.plafond) - Y.foyer - num(sim.repas.emp))) + ' déductibles par repas'
                : 'Total repas déductibles')
            : 'Total repas déductibles (12 mois)'"></div>
        <div class="fr-amount fs-4" x-text="eur(c.repas)"></div>
    </div>

    <div class="fr-info d-flex gap-3 p-3 mt-3">
        <div class="fr-info-icon">i</div>
        <div class="small" style="line-height: 1.6; text-wrap: pretty">
            <strong>La règle :</strong> par repas, vous déduisez la dépense (plafonnée à <span x-text="eur2(Y.plafond)"></span>)
            moins la valeur d'un repas pris au foyer (<span x-text="eur2(Y.foyer)"></span>), moins toute participation de
            l'employeur. Soit au maximum <span x-text="eur2(Y.plafond - Y.foyer)"></span> par jour. Sans justificatifs mais
            avec l'impossibilité prouvée de rentrer chez vous, la déduction est limitée à <span x-text="eur2(Y.foyer)"></span> par jour.
        </div>
    </div>
</div>
```

- [ ] **Step 4: Verifier**

```bash
composer twig:cs && php bin/phpunit && npm run lint && npm run format:check
symfony server:start -d --port=8321 2>/dev/null || true
curl -s http://127.0.0.1:8321/ | grep -c "Votre situation"
symfony server:stop 2>/dev/null || true
```
Expected: tout vert, grep ≥ 1.

- [ ] **Step 5: Commit**

```bash
git add templates/simulateur/
git commit -m "feat: add wizard shell with profil and repas steps"
```

---

### Task 7: Etapes Trajets et Materiel

**Files:**
- Create: `templates/simulateur/_step_trajets.html.twig`, `templates/simulateur/_step_materiel.html.twig`
- Modify: `templates/simulateur/index.html.twig` (inclusions apres `_step_repas`)

**Interfaces:**
- Consumes: `sim.km`, `sim.materiel`, `c` (`kmAn`, `kmFormule`, `jKm`, `km`, `mat`, `matDed`, `Y`), `num`, `eur`, `MAT_PRESETS`, `addMat`, `delMat`, `matRegime`, `joursSiteSuggest`
- Produces: etapes 3-4 fonctionnelles

- [ ] **Step 1: Etape Trajets**

Creer `templates/simulateur/_step_trajets.html.twig` :

```twig
<div x-show="step === 2" class="fr-fade">
    <h2 class="fs-3 mb-2">Frais kilométriques</h2>
    <p class="fr-body-text mb-3" style="max-width: 680px; text-wrap: pretty">
        Trajets domicile-travail avec votre véhicule personnel, calculés selon le barème kilométrique officiel
        applicable à la déclaration <span x-text="sim.annee"></span>. Le barème couvre carburant, entretien,
        assurance et dépréciation du véhicule.
    </p>

    <div class="fr-card p-4">
        <div class="d-flex align-items-center gap-3 flex-wrap mb-4">
            <div class="fr-seg">
                <button type="button" :class="{ on: sim.km.veh === 'voiture' }" @click="sim.km.veh = 'voiture'">Voiture</button>
                <button type="button" :class="{ on: sim.km.veh === 'moto' }" @click="sim.km.veh = 'moto'">Moto (&gt; 50 cm³)</button>
                <button type="button" :class="{ on: sim.km.veh === 'cyclo' }" @click="sim.km.veh = 'cyclo'">Cyclomoteur (≤ 50 cm³)</button>
            </div>
            <label class="d-flex align-items-center gap-2 fw-semibold small" role="button">
                <input type="checkbox" x-model="sim.km.elec" style="width: 17px; height: 17px">
                Véhicule électrique <span class="fw-normal fr-muted">(majoration de 20 %)</span>
            </label>
        </div>

        <div class="row g-3">
            <div class="col-md-3" x-show="sim.km.veh === 'voiture'">
                <label class="form-label fw-semibold">Puissance fiscale</label>
                <select class="form-select" x-model="sim.km.cv">
                    <option value="3">3 CV et moins</option>
                    <option value="4">4 CV</option>
                    <option value="5">5 CV</option>
                    <option value="6">6 CV</option>
                    <option value="7">7 CV et plus</option>
                </select>
            </div>
            <div class="col-md-3" x-show="sim.km.veh === 'moto'">
                <label class="form-label fw-semibold">Puissance fiscale</label>
                <select class="form-select" x-model="sim.km.cvMoto">
                    <option value="1">1 ou 2 CV</option>
                    <option value="3">3, 4 ou 5 CV</option>
                    <option value="6">Plus de 5 CV</option>
                </select>
            </div>
            <div class="col-md-3">
                <label class="form-label fw-semibold">Distance domicile-travail (aller)</label>
                <div class="input-group">
                    <input type="text" inputmode="decimal" class="form-control" placeholder="12" x-model="sim.km.dist">
                    <span class="input-group-text">km</span>
                </div>
            </div>
            <div class="col-md-3">
                <label class="form-label fw-semibold">Allers-retours par jour</label>
                <select class="form-select" x-model="sim.km.ar">
                    <option value="1">1 aller-retour</option>
                    <option value="2">2 allers-retours</option>
                </select>
            </div>
            <div class="col-md-3">
                <label class="form-label fw-semibold">Jours de trajet dans l'année</label>
                <input type="text" inputmode="numeric" class="form-control" :placeholder="c.jKm" x-model="sim.km.jours">
                <div class="form-text fr-muted">Pré-rempli avec vos jours sur site. Modifiable.</div>
            </div>
        </div>

        <div class="mt-3" style="max-width: 320px">
            <label class="form-label fw-semibold">Autres déplacements professionnels (facultatif)</label>
            <div class="input-group">
                <input type="text" inputmode="numeric" class="form-control" placeholder="0" x-model="sim.km.autres">
                <span class="input-group-text">km/an</span>
            </div>
        </div>

        <div x-show="num(sim.km.dist) > 40" class="fr-warn small p-3 mt-3" style="line-height: 1.55; text-wrap: pretty">
            Au-delà de 40 km entre le domicile et le travail, la fraction excédentaire n'est déductible que si vous
            justifiez de circonstances particulières (mutation du conjoint, précarité de l'emploi...). Sans justification,
            ramenez la distance saisie à 40 km et détaillez votre situation dans la rubrique « informations » de la déclaration.
        </div>
    </div>

    <div class="fr-soft d-flex justify-content-between align-items-center flex-wrap gap-3 p-3 px-4 mt-3">
        <div>
            <div class="fw-semibold"><span x-text="c.kmAn.toLocaleString('fr-FR')"></span> km retenus sur l'année</div>
            <div class="small mt-1" style="color: #4a5b52">Barème appliqué : <span x-text="c.kmFormule || 'Complétez les champs ci-dessus'"></span></div>
        </div>
        <div class="fr-amount fs-4" x-text="eur(c.km)"></div>
    </div>

    <div class="fr-info d-flex gap-3 p-3 mt-3">
        <div class="fr-info-icon">i</div>
        <div class="small" style="line-height: 1.6; text-wrap: pretty">
            <strong>Le barème :</strong> identique pour les déclarations 2024, 2025 et 2026, il dépend de la puissance
            fiscale (carte grise, champ P.6) et du kilométrage annuel. Les véhicules électriques bénéficient d'une
            majoration de 20 %. Un seul aller-retour quotidien est admis, sauf contraintes justifiées (horaires atypiques,
            raisons de santé, personne à charge nécessitant votre présence).
        </div>
    </div>
</div>
```

- [ ] **Step 2: Etape Materiel**

Creer `templates/simulateur/_step_materiel.html.twig` :

```twig
<div x-show="step === 3" class="fr-fade">
    <h2 class="fs-3 mb-2">Matériel &amp; équipement</h2>
    <p class="fr-body-text mb-3" style="max-width: 680px; text-wrap: pretty">
        Ordinateur, écran, bureau, chaise… achetés pour le télétravail ou votre profession.
        Seule la part d'usage professionnel est déductible.
    </p>

    <div class="no-print d-flex gap-2 flex-wrap mb-3">
        <template x-for="p in MAT_PRESETS" :key="p.label">
            <button type="button" class="fr-chip" @click="addMat(p)">+ <span x-text="p.label"></span></button>
        </template>
    </div>

    <div x-show="sim.materiel.length === 0" class="fr-empty p-4 text-center fw-medium">
        Ajoutez un équipement avec les boutons ci-dessus, ou passez cette étape si vous n'avez rien acheté.
    </div>

    <div class="d-flex flex-column gap-2">
        <template x-for="(it, i) in sim.materiel" :key="it.id">
            <div class="fr-card p-3 px-4" style="border-radius: 16px">
                <div class="row g-3 align-items-end">
                    <div class="col-md-6">
                        <label class="form-label small fw-semibold fr-muted mb-1" style="letter-spacing: 0.3px">ÉQUIPEMENT</label>
                        <input type="text" class="form-control" placeholder="Ordinateur portable" x-model="it.label">
                    </div>
                    <div class="col-md-3">
                        <label class="form-label small fw-semibold fr-muted mb-1" style="letter-spacing: 0.3px">PRIX TTC (€)</label>
                        <input type="text" inputmode="decimal" class="form-control" placeholder="899" x-model="it.prix">
                    </div>
                    <div class="col-md-3">
                        <label class="form-label small fw-semibold fr-muted mb-1" style="letter-spacing: 0.3px">ANNÉE D'ACHAT</label>
                        <select class="form-select" x-model="it.annee">
                            <option :value="String(Y.rev)" x-text="Y.rev"></option>
                            <option :value="String(Y.rev - 1)" x-text="Y.rev - 1"></option>
                            <option :value="String(Y.rev - 2)" x-text="Y.rev - 2"></option>
                        </select>
                    </div>
                </div>
                <div class="d-flex align-items-center gap-3 mt-3 flex-wrap">
                    <div class="flex-grow-1 d-flex align-items-center gap-2" style="min-width: 260px">
                        <span class="small fw-semibold fr-muted flex-none" style="letter-spacing: 0.3px">USAGE PRO</span>
                        <input type="range" class="form-range flex-grow-1" min="0" max="100" step="5" x-model="it.pct">
                        <span class="fw-bold small text-end" style="width: 44px" x-text="it.pct + ' %'"></span>
                    </div>
                    <div class="d-flex align-items-center gap-3">
                        <span class="fr-badge" :class="{ off: matRegime(it).off }" x-text="matRegime(it).label"></span>
                        <span class="fr-amount" style="min-width: 90px; text-align: right" x-text="eur(c.matDed(it))"></span>
                        <button type="button" class="no-print btn btn-link btn-sm p-1 fw-semibold" style="color: var(--fr-danger)" @click="delMat(i)">Retirer</button>
                    </div>
                </div>
            </div>
        </template>
    </div>

    <div class="fr-soft d-flex justify-content-between align-items-center gap-3 p-3 px-4 mt-3">
        <div class="fw-semibold">Total matériel déductible en <span x-text="Y.rev"></span></div>
        <div class="fr-amount fs-4" x-text="eur(c.mat)"></div>
    </div>

    <div class="fr-info d-flex gap-3 p-3 mt-3">
        <div class="fr-info-icon">i</div>
        <div class="small" style="line-height: 1.6; text-wrap: pretty">
            <strong>Amortissement :</strong> jusqu'à 500 € HT, le matériel se déduit en une fois l'année de l'achat.
            Au-delà, la déduction s'étale sur 3 ans (un tiers par an) : c'est pourquoi un achat de
            <span x-text="Y.rev - 2"></span> ou <span x-text="Y.rev - 1"></span> peut encore générer une annuité en
            <span x-text="Y.rev"></span>. Le calcul est fait automatiquement ci-dessus.
        </div>
    </div>
</div>
```

- [ ] **Step 3: Inclure dans index.html.twig**

Remplacer `{# Les etapes 3 a 6 ... #}` par :

```twig
            {{ include('simulateur/_step_trajets.html.twig') }}
            {{ include('simulateur/_step_materiel.html.twig') }}
            {# Les etapes 5 et 6 seront incluses ici par la task suivante #}
```

- [ ] **Step 4: Verifier + commit**

```bash
composer twig:cs && php bin/phpunit && npm run lint && npm run format:check
git add templates/simulateur/
git commit -m "feat: add trajets and materiel wizard steps"
```

---

### Task 8: Etapes Abonnements et Synthese

**Files:**
- Create: `templates/simulateur/_step_abos.html.twig`, `templates/simulateur/_step_synthese.html.twig`
- Modify: `templates/simulateur/index.html.twig` (inclusions)

**Interfaces:**
- Consumes: `sim.abos`, `sim.alloc`, `c` (tous champs), `ABO_PRESETS`, `addAbo`, `delAbo`, `aboPctEff`, `loyerFormule`, `verdict`, `fraisGagnent`, `prorata`, `eur`, `num`, `print`
- Produces: wizard complet 6/6

- [ ] **Step 1: Etape Abonnements**

Creer `templates/simulateur/_step_abos.html.twig` :

```twig
<div x-show="step === 4" class="fr-fade">
    <h2 class="fs-3 mb-2">Abonnements &amp; charges</h2>
    <p class="fr-body-text mb-3" style="max-width: 680px; text-wrap: pretty">
        Box internet, forfait mobile, électricité, loyer, outils IA… Pour chaque poste, indiquez la part
        professionnelle. Votre prorata télétravail (<span x-text="prorata + ' %'"></span>) est proposé par défaut
        pour les charges du domicile.
    </p>

    <div class="no-print d-flex gap-2 flex-wrap mb-3">
        <template x-for="p in ABO_PRESETS" :key="p.label">
            <button type="button" class="fr-chip" @click="addAbo(p)">+ <span x-text="p.label"></span></button>
        </template>
    </div>

    <div x-show="sim.abos.length === 0" class="fr-empty p-4 text-center fw-medium">
        Ajoutez un abonnement ou une charge avec les boutons ci-dessus.
    </div>

    <div class="d-flex flex-column gap-2">
        <template x-for="(it, i) in sim.abos" :key="it.id">
            <div class="fr-card p-3 px-4" style="border-radius: 16px">
                <div class="row g-3 align-items-end">
                    <div class="col-md-6">
                        <label class="form-label small fw-semibold fr-muted mb-1" style="letter-spacing: 0.3px">POSTE</label>
                        <input type="text" class="form-control" placeholder="Box internet" x-model="it.label">
                    </div>
                    <div class="col-md-3">
                        <label class="form-label small fw-semibold fr-muted mb-1" style="letter-spacing: 0.3px">MONTANT / MOIS (€)</label>
                        <input type="text" inputmode="decimal" class="form-control" placeholder="39,99" x-model="it.mensuel">
                    </div>
                    <div class="col-md-3">
                        <label class="form-label small fw-semibold fr-muted mb-1" style="letter-spacing: 0.3px">NB DE MOIS</label>
                        <input type="text" inputmode="numeric" class="form-control" placeholder="12" x-model="it.mois">
                    </div>
                </div>

                <div x-show="it.kind === 'loyer'" class="fr-panel d-flex align-items-end gap-3 flex-wrap p-3 mt-3">
                    <div>
                        <label class="form-label small fw-semibold fr-muted mb-1" style="letter-spacing: 0.3px">SURFACE DE L'ESPACE DE TRAVAIL</label>
                        <div class="input-group" style="width: 150px">
                            <input type="text" inputmode="decimal" class="form-control form-control-sm bg-white" placeholder="10" x-model="it.surfB">
                            <span class="input-group-text">m²</span>
                        </div>
                    </div>
                    <div>
                        <label class="form-label small fw-semibold fr-muted mb-1" style="letter-spacing: 0.3px">SURFACE TOTALE DU LOGEMENT</label>
                        <div class="input-group" style="width: 150px">
                            <input type="text" inputmode="decimal" class="form-control form-control-sm bg-white" placeholder="65" x-model="it.surfL">
                            <span class="input-group-text">m²</span>
                        </div>
                    </div>
                    <div class="flex-grow-1" style="min-width: 220px">
                        <div class="small fw-semibold fr-muted" style="letter-spacing: 0.3px">PART PRO CALCULÉE</div>
                        <div class="fw-bold fr-ink mt-1" x-text="(Math.round(aboPctEff(it) * 10) / 10).toLocaleString('fr-FR') + ' %'"></div>
                        <div class="small fr-muted" x-text="loyerFormule(it)"></div>
                    </div>
                </div>

                <div class="d-flex align-items-center gap-3 mt-3 flex-wrap">
                    <div x-show="it.kind !== 'loyer'" class="flex-grow-1 d-flex align-items-center gap-2" style="min-width: 260px">
                        <span class="small fw-semibold fr-muted flex-none" style="letter-spacing: 0.3px">PART PRO</span>
                        <input type="range" class="form-range flex-grow-1" min="0" max="100" step="5" x-model="it.pct">
                        <span class="fw-bold small text-end" style="width: 44px" x-text="it.pct + ' %'"></span>
                    </div>
                    <div x-show="it.kind === 'loyer'" class="flex-grow-1"></div>
                    <div class="d-flex align-items-center gap-3">
                        <span class="fr-amount" style="min-width: 90px; text-align: right" x-text="eur(num(it.mensuel) * num(it.mois) * aboPctEff(it) / 100)"></span>
                        <button type="button" class="no-print btn btn-link btn-sm p-1 fw-semibold" style="color: var(--fr-danger)" @click="delAbo(i)">Retirer</button>
                    </div>
                </div>
            </div>
        </template>
    </div>

    <div class="fr-soft d-flex justify-content-between align-items-center gap-3 p-3 px-4 mt-3">
        <div class="fw-semibold">Total abonnements &amp; charges déductibles</div>
        <div class="fr-amount fs-4" x-text="eur(c.abos)"></div>
    </div>

    <div class="fr-info d-flex gap-3 p-3 mt-3">
        <div class="fr-info-icon">i</div>
        <div class="small" style="line-height: 1.6; text-wrap: pretty">
            <strong>Le prorata :</strong> pour l'électricité ou la box, le fisc admet une quote-part proportionnelle
            à l'usage professionnel ; votre rythme de télétravail (<span x-text="prorata + ' %'"></span> du temps) est
            une base raisonnable. Pour le loyer, la part pro se calcule sur la surface de l'espace de travail rapportée
            à celle du logement, multipliée par le temps de télétravail : renseignez les deux surfaces sur la ligne loyer.
            Pour un abonnement à usage mixte (mobile, IA), estimez honnêtement la part pro : 50 % est courant.
        </div>
    </div>
</div>
```

- [ ] **Step 2: Etape Synthese**

Creer `templates/simulateur/_step_synthese.html.twig` :

```twig
<div x-show="step === 5" class="fr-fade">
    <h2 class="fs-3 mb-2">Synthèse</h2>
    <p class="fr-body-text mb-4" style="max-width: 680px">Voici le détail de vos frais réels et la comparaison avec l'abattement forfaitaire.</p>

    <div class="row g-3 align-items-start">
        <div class="col-lg-6">
            <div class="fr-card p-4">
                <div class="fr-display fs-6 mb-3" style="font-weight: 700">Détail par catégorie</div>
                <div class="d-flex justify-content-between py-2 border-bottom">
                    <div class="fw-medium">Frais de repas</div>
                    <div class="fw-bold" x-text="eur(c.repas)"></div>
                </div>
                <div class="d-flex justify-content-between py-2 border-bottom">
                    <div class="fw-medium">Frais kilométriques <span class="fr-muted small">(<span x-text="c.kmAn.toLocaleString('fr-FR')"></span> km)</span></div>
                    <div class="fw-bold" x-text="eur(c.km)"></div>
                </div>
                <div class="d-flex justify-content-between py-2 border-bottom">
                    <div class="fw-medium">Matériel &amp; équipement <span class="fr-muted small">(<span x-text="sim.materiel.length"></span> poste<span x-show="sim.materiel.length > 1">s</span>)</span></div>
                    <div class="fw-bold" x-text="eur(c.mat)"></div>
                </div>
                <div class="d-flex justify-content-between py-2 border-bottom">
                    <div class="fw-medium">Abonnements &amp; charges <span class="fr-muted small">(<span x-text="sim.abos.length"></span> poste<span x-show="sim.abos.length > 1">s</span>)</span></div>
                    <div class="fw-bold" x-text="eur(c.abos)"></div>
                </div>
                <div class="d-flex justify-content-between align-items-center pt-3">
                    <div class="fr-display" style="font-weight: 700">Total frais réels</div>
                    <div class="fr-amount fs-3" x-text="eur(c.total)"></div>
                </div>

                <div class="mt-3 pt-3" style="border-top: 1.5px dashed #e5dfd6">
                    <label class="form-label fw-semibold">Allocation télétravail reçue de l'employeur en <span x-text="Y.rev"></span></label>
                    <div class="input-group" style="max-width: 200px">
                        <input type="text" inputmode="decimal" class="form-control" placeholder="0" x-model="sim.alloc">
                        <span class="input-group-text">€</span>
                    </div>
                    <div class="form-text fr-muted" style="text-wrap: pretty">Cette allocation couvre déjà une partie de vos frais : elle est automatiquement soustraite du total à déclarer ci-contre.</div>
                </div>
            </div>
        </div>

        <div class="col-lg-6 d-flex flex-column gap-3">
            <div class="fr-verdict p-4" :class="verdict.cls">
                <div class="small fw-semibold" style="letter-spacing: 0.5px; opacity: 0.85">VERDICT</div>
                <div class="fr-display fs-4 my-2" style="text-wrap: pretty" x-text="verdict.title"></div>
                <div class="small" style="line-height: 1.6; opacity: 0.92; text-wrap: pretty" x-text="verdict.text"></div>
                <div class="d-flex gap-2 mt-3">
                    <div class="cell flex-fill p-3">
                        <div class="small fw-semibold" style="opacity: 0.8; letter-spacing: 0.4px; font-size: 11px">FRAIS RÉELS NETS</div>
                        <div class="fr-display fs-5 mt-1" x-text="eur(c.net)"></div>
                    </div>
                    <div class="cell flex-fill p-3">
                        <div class="small fw-semibold" style="opacity: 0.8; letter-spacing: 0.4px; font-size: 11px">ABATTEMENT 10 %</div>
                        <div class="fr-display fs-5 mt-1" x-text="c.abatt > 0 ? eur(c.abatt) : 'à renseigner'"></div>
                    </div>
                </div>
            </div>

            <div x-show="fraisGagnent" class="fr-card p-4">
                <div class="fr-display fs-6 mb-3" style="font-weight: 700">À reporter sur votre déclaration</div>
                <div class="fr-soft d-flex align-items-center gap-3 p-3">
                    <div class="fr-display flex-none text-white px-3 py-2" style="background: var(--fr-acc); border-radius: 10px; font-size: 15px">1AK</div>
                    <div>
                        <div class="fr-amount fs-5" x-text="eur(c.net)"></div>
                        <div class="small" style="color: #4a5b52">Case 1AK (déclarant 1), 1BK pour le déclarant 2.</div>
                    </div>
                </div>
                <div class="small fr-body-text mt-3" style="line-height: 1.6; text-wrap: pretty">
                    Cochez l'option « frais réels » et détaillez le calcul dans la rubrique « informations ».
                    L'allocation télétravail reçue (<span x-text="eur(num(sim.alloc))"></span>) est déjà soustraite
                    de ce montant. Aucun justificatif à joindre, mais conservez-les 3 ans.
                </div>
            </div>

            <button type="button" class="no-print btn btn-fr-outline py-3" @click="print()">Imprimer / enregistrer le récapitulatif en PDF</button>
        </div>
    </div>
</div>
```

- [ ] **Step 3: Inclure dans index.html.twig**

Remplacer `{# Les etapes 5 et 6 ... #}` par :

```twig
            {{ include('simulateur/_step_abos.html.twig') }}
            {{ include('simulateur/_step_synthese.html.twig') }}
```

- [ ] **Step 4: Verifier + commit**

```bash
composer twig:cs && php bin/phpunit && npm run lint && npm run format:check && npm test
git add templates/simulateur/
git commit -m "feat: add abonnements and synthese wizard steps"
```

---

### Task 9: CI js-checks + CLAUDE.md

**Files:**
- Modify: `.github/workflows/ci.yml` (job `js-lint` → `js-checks` avec `npm test`), `CLAUDE.md`

**Interfaces:**
- Consumes: script npm `test` (Task 3)
- Produces: CI executant les tests du moteur fiscal

- [ ] **Step 1: Etendre le job JS**

Dans `.github/workflows/ci.yml`, renommer le job `js-lint` en `js-checks` et ajouter l'etape test :

```yaml
    js-checks:
        runs-on: ubuntu-latest
        steps:
            - uses: actions/checkout@v4
            - uses: actions/setup-node@v4
              with:
                  node-version: 22
                  cache: npm
            - run: npm ci
            - run: npm run lint
            - run: npm run format:check
            - run: npm test
```

Valider : `python3 -c "import yaml; yaml.safe_load(open('.github/workflows/ci.yml')); print('YAML OK')"`

- [ ] **Step 2: Mettre a jour CLAUDE.md**

Dans `CLAUDE.md` :
- Section « Etat du projet » : remplacer la phrase sur l'absence de code metier par : `Premiere fonctionnalite en place : le simulateur de frais reels (route /, 100 % cote client — moteur fiscal assets/js/engine.js, composant Alpine assets/app.js, partials templates/simulateur/). Les simulations vivent en localStorage (cle fr2026_sims), la BDD reste dormante.`
- Bloc de commandes qualite : ajouter la ligne `npm test            # tests du moteur fiscal (node --test)`
- Section « CI et qualite », premiere puce : renommer `js-lint` en `js-checks`, et mentionner qu'il execute aussi `npm test`.
- Section frontend : mentionner Alpine + Bootstrap via importmap, cohabitation avec Stimulus.

- [ ] **Step 3: Verifier + commit**

```bash
npm test
git add .github/workflows/ci.yml CLAUDE.md
git commit -m "ci: run fiscal engine tests in js-checks job"
```

---

### Task 10: Validation navigateur E2E + PR

**Files:** aucun code (verification + operations GitHub) ; corrections mineures autorisees si l'E2E revele un bug (commit dedie)

**Interfaces:**
- Consumes: tout ; le scenario de reference du test `scenario E2E de reference` (Task 3)
- Produces: PR ouverte avec CI verte, comportement verifie dans un vrai navigateur

- [ ] **Step 1: Demarrer le serveur**

```bash
symfony server:start -d --port=8321
```

- [ ] **Step 2: Scenario navigateur**

Avec l'outil navigateur (superpowers-chrome / use_browser), derouler sur `http://127.0.0.1:8321` :

1. Accueil : verifier « Aucune simulation pour l'instant » (ou liste existante), cliquer « Nouvelle simulation ».
2. Etape 1 : annee 2026 selectionnee par defaut ; salaire `35000` → l'abattement affiche `3 500 €` ; jours 5 / TT 2 → prorata `29 %`.
3. Etape 2 : cout repas `12,50` → le bandeau affiche `135 jours à 7,05 € déductibles par repas` et un total de `952 €`.
4. Etape 3 : voiture 5 CV, distance `12`, 1 AR → `3 240 km retenus` et total `2 061 €`.
5. Etape 4 : + Ordinateur, prix `899` → badge `Amorti sur 3 ans (2025–2027)`, deduction `210 €`.
6. Etape 5 : + Box internet, mensuel `39,99` → part pro pre-remplie `29 %`, deduction `139 €`.
7. Etape 6 : total `3 362 €`, verdict rouge « Restez à l'abattement de 10 % » (3 362 < 3 500). Modifier le salaire (etape 1) a `30000` → verdict vert « Les frais réels sont avantageux », carte 1AK affichee avec `3 362 €`.
8. Recharger la page → accueil : la simulation apparait dans la liste avec son total ; « Reprendre » restaure les valeurs.
9. Dupliquer puis supprimer la copie (confirm accepte).

Si un ecart apparait entre ces valeurs et l'ecran : STOP, diagnostiquer (les valeurs sont garanties par `engine.test.js` — un ecart vient du binding template/composant), corriger, commit dedie `fix: ...`, re-derouler.

- [ ] **Step 3: Arreter le serveur, pousser, ouvrir la PR**

```bash
symfony server:stop
git push -u origin feat/simulateur-frais-reels
gh pr create --base master --title "feat: frais reels simulator (Alpine + Bootstrap 5.3)" --body "Implements docs/superpowers/specs/2026-07-06-simulateur-frais-reels-design.md

- Client-only simulator: home + 6-step wizard, localStorage persistence (key fr2026_sims)
- Pure fiscal engine (assets/js/engine.js) covered by node --test (13 tests), run in CI
- Alpine.js + Bootstrap 5.3 via importmap (AssetMapper, no CDN), Stimulus untouched
- Sage-green theme faithful to the validated mock
- WebTestCase on GET /"
gh pr checks --watch
```
Expected: 3 checks verts (`php-lint`, `php-tests`, `js-checks`). Ne pas merger. NOTE : si `gh` n'affiche rien, utiliser `/snap/gh/current/gh` (quirk local connu).
