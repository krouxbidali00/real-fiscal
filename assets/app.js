import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/app.css';
import './stimulus_bootstrap.js';
import Alpine from 'alpinejs';

// Placeholder component, replaced by the real one in a later task
Alpine.data('fraisReels', () => ({ screen: 'home' }));

window.Alpine = Alpine;
Alpine.start();
