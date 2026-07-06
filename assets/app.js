import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/app.css';
import './stimulus_bootstrap.js';
import Alpine from 'alpinejs';
import {
    ANNEES,
    num,
    eur,
    eur2,
    yearCfg,
    blankSim,
    calc,
} from './js/engine.js';
import { loadHistory, saveHistory } from './js/storage.js';

const LABELS = [
    'Profil',
    'Repas',
    'Trajets',
    'Matériel',
    'Abonnements',
    'Synthèse',
];
const MOIS = [
    'Janvier',
    'Février',
    'Mars',
    'Avril',
    'Mai',
    'Juin',
    'Juillet',
    'Août',
    'Septembre',
    'Octobre',
    'Novembre',
    'Décembre',
];
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
            h.id === this.simId
                ? {
                      ...h,
                      name: this.sim.name,
                      updated: Date.now(),
                      total: totals.net,
                      sim: JSON.parse(snapshot),
                  }
                : h,
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
                text: "Indiquez votre salaire net imposable à l'étape 1 pour comparer vos frais réels avec l'abattement forfaitaire de 10 %.",
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
            title: "Restez à l'abattement de 10 %",
            text: `Vos frais réels nets (${eur(c.net)}) restent sous l'abattement automatique (${eur(c.abatt)}). Ne cochez pas l'option frais réels : vous y perdriez ${eur(c.abatt - c.net)}.`,
            cls: 'lose',
        };
    },

    fmtDate(ts) {
        return new Date(ts).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
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
        this.hist = [
            { id, name: sim.name, updated: Date.now(), total: 0, sim },
            ...this.hist,
        ];
        saveHistory(this.hist);
        this.simId = id;
        this.sim = sim;
        this.screen = 'wizard';
        this.step = 0;
    },
    openSim(id) {
        const entry = this.hist.find((h) => h.id === id);
        if (!entry || !entry.sim) return;
        const sim = JSON.parse(JSON.stringify(entry.sim));
        // Soft migration for entries saved by older versions of the data shape.
        if (!sim.repas.mois)
            sim.repas.mois = Array.from({ length: 12 }, () => ({
                jours: '',
                cout: '',
            }));
        if (!sim.annee) sim.annee = '2026';
        if (!sim.km) sim.km = blankSim().km;
        this.simId = id;
        this.sim = sim;
        this.screen = 'wizard';
        this.step = 0;
    },
    dupSim(id) {
        const entry = this.hist.find((h) => h.id === id);
        if (!entry || !entry.sim) return;
        const sim = JSON.parse(JSON.stringify(entry.sim));
        sim.name = `${entry.name} (copie)`;
        this.hist = [
            {
                id: `sim_${Date.now()}`,
                name: sim.name,
                updated: Date.now(),
                total: entry.total,
                sim,
            },
            ...this.hist,
        ];
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
            if (an === this.Y.rev)
                return { label: 'Déduit en une fois', off: false };
            return { label: `Déjà déduit en ${an}`, off: true };
        }
        if (an < this.Y.rev - 2)
            return { label: 'Amortissement terminé', off: true };
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
        const perDay = Math.max(
            0,
            Math.min(num(m.cout), this.Y.plafond) - this.Y.foyer - emp,
        );
        return eur2(num(m.jours) * perDay);
    },
}));

window.Alpine = Alpine;
Alpine.start();
