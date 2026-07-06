import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/app.css';
import './stimulus_bootstrap.js';
import Alpine from 'alpinejs';

Alpine.data('fraisReels', () => ({
    screen: 'home',
    sim: null,
    Y: { rev: 2025, foyer: 5.45, plafond: 21.1, min: 509, max: 14555 },
    eur: (n) => `${n} €`,
    eur2: (n) => `${n} €`,
    goHome() {
        this.screen = 'home';
    },
}));

window.Alpine = Alpine;
Alpine.start();
