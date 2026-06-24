export function initCountdown(targetDateString, elementId, options = {}) {
    const targetDate = new Date(targetDateString).getTime();
    let intervalId;
    let didComplete = false;

    function update() {
        const now = new Date().getTime();
        const distance = Math.max(targetDate - now, 0);

        const d = Math.floor(distance / (1000 * 60 * 60 * 24));
        const h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((distance % (1000 * 60)) / 1000);

        const clockEl = document.getElementById(elementId);

        if (clockEl) {
            clockEl.innerHTML = `${d}d ${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        }

        if (distance === 0 && !didComplete) {
            didComplete = true;
            options.onComplete?.();
        }

        if (distance === 0 && intervalId) {
            clearInterval(intervalId);
        }
    }

    update();
    intervalId = setInterval(update, 1000);
}

export function getDDayString(targetDateString) {
    const targetDate = new Date(targetDateString);
    targetDate.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const distance = targetDate.getTime() - today.getTime();
    const d = Math.ceil(distance / (1000 * 60 * 60 * 24));

    return d > 0 ? `D-${d}` : d === 0 ? 'D-Day' : `D+${Math.abs(d)}`;
}
