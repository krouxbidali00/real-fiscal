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
        r: {
            1: [0.395, 0.099, 891, 0.248],
            3: [0.468, 0.082, 1158, 0.275],
            6: [0.606, 0.079, 1583, 0.343],
        },
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
        repas: {
            mode: 'simple',
            jours: '',
            cout: '',
            emp: '',
            mois: Array.from({ length: 12 }, () => ({ jours: '', cout: '' })),
        },
        km: {
            veh: 'voiture',
            cv: '5',
            cvMoto: '3',
            elec: false,
            dist: '',
            ar: '1',
            jours: '',
            autres: '',
        },
        materiel: [],
        abos: [],
        alloc: '',
    };
}

export function kmBareme(veh, cv, d) {
    const t = KM_TABLES[veh] || KM_TABLES.voiture;
    const r = t.r[cv] || Object.values(t.r)[0];
    const dk = d.toLocaleString('fr-FR');
    if (d <= t.br[0])
        return {
            v: d * r[0],
            f: `${dk} km à ${String(r[0]).replace('.', ',')}`,
        };
    if (d <= t.br[1])
        return {
            v: d * r[1] + r[2],
            f: `(${dk} km à ${String(r[1]).replace('.', ',')}) + ${r[2]} €`,
        };
    return { v: d * r[3], f: `${dk} km à ${String(r[3]).replace('.', ',')}` };
}

export function calc(sim) {
    const Y = yearCfg(sim.annee);
    const emp = num(sim.repas.emp);
    const perDay = (cout) =>
        Math.max(0, Math.min(num(cout), Y.plafond) - Y.foyer - emp);

    const jSem = num(sim.profil.joursSem) || 5;
    const jTT = Math.min(num(sim.profil.joursTT), jSem);
    const joursAuto = Math.max(0, Math.round((jSem - jTT) * 45));
    const joursEff =
        String(sim.repas.jours ?? '').trim() === ''
            ? joursAuto
            : num(sim.repas.jours);

    const repas =
        sim.repas.mode === 'simple'
            ? joursEff * perDay(sim.repas.cout)
            : sim.repas.mois.reduce(
                  (t, m) => t + num(m.jours) * perDay(m.cout),
                  0,
              );

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
    const abos = sim.abos.reduce(
        (t, it) => t + (num(it.mensuel) * num(it.mois) * aboPct(it)) / 100,
        0,
    );

    const k = sim.km || {};
    const jKm = String(k.jours ?? '').trim() === '' ? joursAuto : num(k.jours);
    const kmAn = Math.round(
        num(k.dist) * 2 * (num(k.ar) || 1) * jKm + num(k.autres),
    );
    const cvKey =
        k.veh === 'moto'
            ? k.cvMoto || '3'
            : k.veh === 'cyclo'
              ? '0'
              : k.cv || '5';
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
    const net = Math.round(Math.max(0, total - num(sim.alloc)));
    const sal = num(sim.profil.salaire);
    const abatt = sal > 0 ? Math.min(Math.max(sal * 0.1, Y.min), Y.max) : 0;

    return {
        repas,
        km,
        kmAn,
        kmFormule,
        jKm,
        mat,
        abos,
        total,
        net,
        abatt,
        joursEff,
        Y,
        matDed,
        aboPct,
    };
}
