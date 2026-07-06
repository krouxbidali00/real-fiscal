import { test } from 'node:test';
import assert from 'node:assert/strict';
import { num, yearCfg, blankSim, kmBareme, calc, ANNEES } from './engine.js';

function simWith(patch) {
    const sim = blankSim();
    return {
        ...sim,
        ...patch,
        profil: { ...sim.profil, ...(patch.profil || {}) },
        repas: { ...sim.repas, ...(patch.repas || {}) },
        km: { ...sim.km, ...(patch.km || {}) },
    };
}

test('num: parsing tolerant', () => {
    assert.equal(num('12,50'), 12.5);
    assert.equal(num('1 200'), 1200);
    assert.equal(num(''), 0);
    assert.equal(num(null), 0);
    assert.equal(num('abc'), 0);
});

test('yearCfg: baremes par annee et fallback', () => {
    assert.deepEqual(yearCfg('2024'), {
        foyer: 5.2,
        plafond: 20.2,
        min: 495,
        max: 14171,
        rev: 2023,
    });
    assert.deepEqual(yearCfg('2025'), {
        foyer: 5.35,
        plafond: 20.7,
        min: 504,
        max: 14426,
        rev: 2024,
    });
    assert.deepEqual(yearCfg('2026'), {
        foyer: 5.45,
        plafond: 21.1,
        min: 509,
        max: 14555,
        rev: 2025,
    });
    assert.equal(yearCfg('1999').rev, 2025);
    assert.deepEqual(ANNEES, ['2024', '2025', '2026']);
});

test('repas simple: (min(cout,plafond) - foyer - emp) x jours', () => {
    const c = calc(
        simWith({ repas: { jours: '135', cout: '12,50', emp: '' } }),
    );
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
    const c = calc(
        simWith({
            profil: { joursSem: '5', joursTT: '2' },
            repas: { jours: '', cout: '10', emp: '' },
        }),
    );
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
    assert.ok(
        Math.abs(kmBareme('voiture', '5', 10000).v - (10000 * 0.357 + 1395)) <
            1e-9,
    );
    assert.ok(
        Math.abs(kmBareme('voiture', '5', 25000).v - 25000 * 0.427) < 1e-9,
    );
});

test('kmBareme moto et cyclo', () => {
    assert.ok(Math.abs(kmBareme('moto', '3', 2000).v - 2000 * 0.468) < 1e-9);
    assert.ok(
        Math.abs(kmBareme('cyclo', '0', 5000).v - (5000 * 0.079 + 711)) < 1e-9,
    );
});

test('calc km: distance x 2 x AR x jours + autres, electrique +20%, arrondi', () => {
    const c = calc(
        simWith({
            km: {
                veh: 'voiture',
                cv: '5',
                dist: '12',
                ar: '1',
                jours: '135',
                autres: '',
            },
        }),
    );
    assert.equal(c.kmAn, 3240);
    assert.equal(c.km, Math.round(3240 * 0.636)); // 2061
    const e = calc(
        simWith({
            km: {
                veh: 'voiture',
                cv: '5',
                dist: '12',
                ar: '1',
                jours: '135',
                autres: '',
                elec: true,
            },
        }),
    );
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
        {
            id: 'a',
            label: 'Box',
            mensuel: '39,99',
            mois: '12',
            pct: '29',
            kind: '',
            surfB: '',
            surfL: '',
        },
        {
            id: 'b',
            label: 'Loyer',
            mensuel: '800',
            mois: '12',
            pct: '0',
            kind: 'loyer',
            surfB: '10',
            surfL: '65',
        },
        {
            id: 'c',
            label: 'Loyer sans surface',
            mensuel: '800',
            mois: '12',
            pct: '0',
            kind: 'loyer',
            surfB: '10',
            surfL: '',
        },
    ];
    const c = calc(sim);
    const loyerPct = Math.min(100, (10 / 65) * (2 / 7) * 100);
    assert.ok(
        Math.abs(
            c.abos - (39.99 * 12 * 0.29 + (800 * 12 * loyerPct) / 100 + 0),
        ) < 1e-9,
    );
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
    sim.km = {
        ...sim.km,
        veh: 'voiture',
        cv: '5',
        dist: '12',
        ar: '1',
        jours: '',
        autres: '',
    };
    sim.materiel = [
        { id: 'm', label: 'Ordinateur', prix: '899', annee: '2025', pct: '70' },
    ];
    sim.abos = [
        {
            id: 'a',
            label: 'Box internet',
            mensuel: '39,99',
            mois: '12',
            pct: '29',
            kind: '',
            surfB: '',
            surfL: '',
        },
    ];
    const c = calc(sim);
    assert.ok(Math.abs(c.repas - 951.75) < 1e-9);
    assert.equal(c.km, 2061);
    assert.ok(Math.abs(c.mat - 209.76666666666665) < 1e-6);
    assert.ok(Math.abs(c.abos - 139.1652) < 1e-9);
    assert.equal(Math.round(c.total), 3362);
    assert.equal(c.abatt, 3500); // abattement gagne dans ce scenario
});
