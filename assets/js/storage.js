// localStorage persistence. Key kept from the original mock for data compatibility.
const KEY = 'fr2026_sims';

export function loadHistory() {
    try {
        const parsed = JSON.parse(localStorage.getItem(KEY) || '[]');
        return Array.isArray(parsed) ? parsed : [];
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
