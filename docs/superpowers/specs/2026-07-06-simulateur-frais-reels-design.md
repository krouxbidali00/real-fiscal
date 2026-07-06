# Spec : Simulateur de frais reels (Alpine + Bootstrap 5.3)

> Date : 2026-07-06
> Statut : valide
> Portee : real-fiscal — premiere fonctionnalite metier du projet
> Reference : maquette HTML fournie (« Frais Reels 2026 »), regles fiscales portees telles quelles

## Contexte et objectif

Porter la maquette « frais reels » (calculateur d'aide a la declaration de revenus : repas, trajets, materiel, abonnements, comparaison avec l'abattement de 10 %) dans le projet Symfony real-fiscal, avec Alpine.js et Bootstrap 5.3.

Decisions de cadrage validees :

- **Client-only, parite maquette** : moteur de calcul en JS, simulations en localStorage. Aucun backend metier, pas de compte, la BDD reste dormante.
- **Alpine + Stimulus cohabitent** : alpinejs et bootstrap ajoutes via importmap (vendores par AssetMapper, pas de CDN) ; Stimulus/Turbo et leurs controleurs recette restent en place, inchanges.
- **Rendu fidele a la maquette** : Bootstrap comme socle + surcouche CSS (palette vert sauge, polices Bricolage Grotesque/Figtree via Google Fonts, radius augmentes).
- **Structure modules ES + partials Twig** : moteur pur testable, storage isole, un composant Alpine, un partial Twig par ecran.

## Perimetre fonctionnel (parite maquette)

### Accueil
- Hero + rappel des 4 points cles + bouton « Nouvelle simulation ».
- Liste « Mes simulations » : nom, date de modification, total deductible ; actions Reprendre / Dupliquer / Supprimer (confirmation avant suppression). Etat vide avec message dedie.

### Wizard 6 etapes
Stepper cliquable (etapes accessibles librement), navigation Precedent/Continuer, nom de simulation editable dans la barre du haut.

1. **Profil** : annee de declaration (2024/2025/2026, barèmes ajustes), salaire net imposable, jours travailles/semaine, dont jours de teletravail (decimaux acceptes). Cartes derivees : prorata teletravail (`joursTT/7`), abattement 10 %.
2. **Repas** : deux modes — saisie rapide (jours sur site pre-suggere `(joursSem − joursTT) × 45`, cout moyen, participation employeur) ou mois par mois (12 lignes jours + cout, participation globale). Total et formule affiches.
3. **Trajets** : vehicule (voiture / moto > 50 cm3 / cyclomoteur), puissance fiscale, electrique (+20 %), distance aller (alerte reglementaire si > 40 km), allers-retours par jour (1 ou 2), jours de trajet (pre-rempli avec jours sur site), autres deplacements pro en km/an. Total + formule du bareme applique.
4. **Materiel** : presets (Ordinateur 70 %, Ecran 70 %, Telephone 50 %, Bureau 80 %, Chaise 80 %, Clavier/souris 70 %), lignes editables (libelle, prix TTC, annee d'achat parmi les 3 dernieres annees de revenus, slider % pro), badge de regime (deduit en une fois / amorti 3 ans / deja deduit / a completer), suppression de ligne. Correction vs maquette : l'annee d'achat par defaut d'une nouvelle ligne est l'annee de revenus de la declaration choisie (la maquette codait « 2025 » en dur, invalide pour une declaration 2024).
5. **Abonnements** : presets (Box internet et Electricite au prorata teletravail par defaut, Forfait mobile 50 %, Loyer avec calcul par surfaces, Abonnement IA 80 %, Logiciels 100 %), lignes editables (libelle, montant mensuel, nb de mois, slider % pro sauf loyer), cas loyer : surfaces bureau/logement, part pro calculee affichee avec formule.
6. **Synthese** : detail par categorie, total frais reels, saisie allocation teletravail (soustraite, plancher 0), carte verdict (3 etats : salaire manquant / frais reels gagnants / abattement gagnant, montants et gain affiches), carte « case 1AK » si frais reels gagnants, bouton imprimer (`window.print`, classes no-print).

### Retire (YAGNI)
- Selecteur de palette et toggle pedagogie de la maquette (props d'editeur, pas des fonctionnalites utilisateur) : palette vert sauge fixe, encarts pedagogiques toujours affiches.

## Architecture

| Unite | Role | Depend de |
|-------|------|-----------|
| `src/Controller/SimulateurController.php` | Route `/` (`app_home`), rend le template. Zero logique metier. | — |
| `templates/simulateur/index.html.twig` | Layout de l'app, point de montage `x-data="fraisReels"`, stepper, navigation | partials |
| `templates/simulateur/_home.html.twig` etc. (7 partials) | Un ecran par fichier : `_home`, `_step_profil`, `_step_repas`, `_step_trajets`, `_step_materiel`, `_step_abos`, `_step_synthese` | state Alpine |
| `assets/js/engine.js` | Moteur fiscal pur (aucune dependance DOM/Alpine) : parsing, formatage, baremes, `calc(sim)` | — |
| `assets/js/storage.js` | Persistence localStorage : `loadAll`, `persist`, cle **`fr2026_sims`** (compat maquette) | — |
| `assets/app.js` | `Alpine.data('fraisReels', ...)` : state, getters (delegent au moteur), actions ; `Alpine.start()` | engine, storage |
| `assets/styles/app.css` | Surcouche Bootstrap : variables (couleurs, radius, fonts), classes custom (stepper, verdict, badges), regles print | Bootstrap CSS |
| `templates/base.html.twig` | Ajout Google Fonts (Bricolage Grotesque, Figtree) | — |

Importmap : `alpinejs`, `bootstrap` (JS + CSS). Tout vendore par AssetMapper.

## Moteur fiscal (regles portees de la maquette, chiffres exacts)

### Configuration par annee de declaration
| Declaration | Revenus | Repas foyer | Plafond repas | Abattement min | Abattement max |
|------|------|------|------|------|------|
| 2024 | 2023 | 5,20 € | 20,20 € | 495 € | 14 171 € |
| 2025 | 2024 | 5,35 € | 20,70 € | 504 € | 14 426 € |
| 2026 | 2025 | 5,45 € | 21,10 € | 509 € | 14 555 € |

### Bareme kilometrique (identique declarations 2024-2026)
Trois tranches par vehicule : `d ≤ b1` → `d × a` ; `b1 < d ≤ b2` → `d × b + c` ; `d > b2` → `d × e`.

- **Voiture** (tranches 5 000 / 20 000 km) — par CV `[a, b, c, e]` : 3 CV `[0.529, 0.316, 1065, 0.370]` ; 4 CV `[0.606, 0.340, 1330, 0.407]` ; 5 CV `[0.636, 0.357, 1395, 0.427]` ; 6 CV `[0.665, 0.374, 1457, 0.447]` ; 7 CV+ `[0.697, 0.394, 1515, 0.470]`.
- **Moto** (3 000 / 6 000 km) : 1-2 CV `[0.395, 0.099, 891, 0.248]` ; 3-5 CV `[0.468, 0.082, 1158, 0.275]` ; > 5 CV `[0.606, 0.079, 1583, 0.343]`.
- **Cyclomoteur** (3 000 / 6 000 km) : `[0.315, 0.079, 711, 0.198]`.
- Vehicule electrique : total × 1,20. Km annuels = `distance × 2 × allersRetours × joursTrajet + autresKm`, arrondis. Resultat arrondi a l'euro.

### Regles de calcul
- **Repas/jour** : `max(0, min(cout, plafond) − foyer − participationEmployeur)`. Mode simple : × jours (defaut auto si champ vide). Mode detail : somme des 12 mois.
- **Materiel** (par ligne) : prix ≤ 0 → 0 ; prix ≤ 500 € → deduit `prix × pct` uniquement si annee d'achat = annee de revenus ; prix > 500 € → `(prix/3) × pct` si annee d'achat dans `[revenus−2, revenus]`.
- **Abonnements** (par ligne) : `mensuel × mois × pct/100`. Ligne loyer : `pct = min(100, (surfBureau/surfLogement) × (joursTT/7) × 100)` (0 si surface logement absente).
- **Total net** : `max(0, total − allocationTeletravail)`.
- **Abattement** : `clamp(salaire × 0,10, min, max)` si salaire > 0, sinon 0.
- **Verdict** : abattement = 0 → « renseignez votre salaire » ; net > abattement → frais reels gagnants (gain affiche, mention allocation si > 0) ; sinon → rester a l'abattement (perte affichee).
- Parsing tolerant : virgule decimale, espaces ; formatage `fr-FR` (eur arrondi, eur2 a deux decimales).

### Structure d'une simulation (inchangee vs maquette)
```json
{
  "name": "Simulation du 06/07/2026",
  "annee": "2026",
  "profil": { "salaire": "", "joursSem": "5", "joursTT": "2" },
  "repas": { "mode": "simple", "jours": "", "cout": "", "emp": "", "mois": [{ "jours": "", "cout": "" }, "…× 12"] },
  "km": { "veh": "voiture", "cv": "5", "cvMoto": "3", "elec": false, "dist": "", "ar": "1", "jours": "", "autres": "" },
  "materiel": [{ "id": "", "label": "", "prix": "", "annee": "2025", "pct": "70" }],
  "abos": [{ "id": "", "label": "", "mensuel": "", "mois": "12", "pct": "50", "kind": "", "surfB": "", "surfL": "" }],
  "alloc": ""
}
```
Historique localStorage (cle `fr2026_sims`) : tableau d'entrees `{ id, name, updated, total, sim }`, migration douce a l'ouverture (champs manquants completes comme dans la maquette).

## UI / theme

- Bootstrap 5.3 : grille, formulaires (`form-control`, `form-select`, `form-range`, `input-group`), boutons, badges — surcharges par variables CSS (`--bs-primary` vert sauge `oklch(0.5 0.1 165)`, `--bs-border-radius` augmentes, `--bs-body-bg #FAF7F2`, `--bs-body-font-family` Figtree ; titres en Bricolage Grotesque).
- Classes custom pour : stepper du wizard, cartes verdict (fond colore plein), badges pastel de regime, encarts pedagogiques jaunes, etats vides en pointilles.
- Impression : classe `no-print` + `@media print` (le recap de synthese doit sortir proprement en PDF).
- Responsive : les grilles multi-colonnes passent en 1 colonne sous le breakpoint `md`.

## Tests

- **Moteur fiscal** (le cœur du risque) : tests unitaires avec le runner natif Node (`node --test`, zero dependance). Fichier `assets/js/engine.test.js`. Cas couverts : repas (plafond, participation, mode detail), km (3 tranches × vehicules, electrique, arrondis), materiel (bascule 500 €, annees hors fenetre), loyer (surfaces, plafond 100 %), abattement (min/max/clamp), verdict (3 etats), parsing virgule. Script npm `test` = `node --test assets/js/*.test.js`.
- **PHP** : `tests/Controller/SimulateurControllerTest.php` (WebTestCase, browser-kit deja present) : `GET /` → 200, presence de `x-data="fraisReels"`.
- **CI** : le job `js-lint` devient `js-checks` : `npm ci` → `npm run lint` → `npm run format:check` → `npm test`. Le job `php-tests` couvre le nouveau test fonctionnel sans changement.
- eslint : `engine.test.js` utilise `node:test` → le bloc de config eslint doit ajouter les globals Node pour les fichiers `*.test.js`.

## Validation

- Branche `feat/simulateur-frais-reels`, PR vers `master`, CI verte requise.
- Verification manuelle : creation d'une simulation complete, rechargement de page (persistence), duplication/suppression, impression, comparaison des montants avec la maquette sur un jeu de valeurs fixe.

## Hors perimetre

- Comptes utilisateurs, persistance serveur, API, i18n, SEO, accessibilite avancee.
- Suppression de Stimulus/Turbo (cohabitation actee).
- Export des simulations (hors impression navigateur).
