/**
 * 카운트다운을 시작한다.
 *
 * @param {number|string} target 밀리초 타임스탬프, 또는 Date가 파싱할 수 있는 문자열.
 *        타임존이 중요한 값은 members.js의 toKstMidnight()로 만든 타임스탬프를 넘길 것.
 * @param {string} elementId 남은 시간을 그릴 요소의 id
 * @param {Object} [options]
 * @param {Function} [options.onComplete] 목표 시각에 도달했을 때 한 번 호출된다
 */
export function initCountdown(target, elementId, options = {}) {
    const targetDate = typeof target === 'number' ? target : new Date(target).getTime();

    if (Number.isNaN(targetDate)) {
        console.error(`[timer] 목표 시각을 해석할 수 없다: ${target}`);
        return;
    }

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
