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

// 테스트 리셋 UI를 페이지에 추가하는 함수 (테스트 브랜치 전용)
function injectTestResetButton() {
    if (document.getElementById('svt-test-reset-panel')) {
        return;
    }
    const panel = document.createElement('div');
    panel.id = 'svt-test-reset-panel';
    panel.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: rgba(0, 0, 0, 0.85);
        color: #fff;
        padding: 12px;
        border-radius: 8px;
        font-family: system-ui, -apple-system, sans-serif;
        font-size: 12px;
        z-index: 9999;
        display: flex;
        flex-direction: column;
        gap: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.5);
        border: 1px solid rgba(255, 255, 255, 0.15);
    `;

    const title = document.createElement('div');
    title.textContent = '🧪 테스트 도구 (test 브랜치)';
    title.style.fontWeight = 'bold';
    title.style.borderBottom = '1px solid #444';
    title.style.paddingBottom = '6px';

    const desc = document.createElement('div');
    desc.textContent = '정한(1분), 원우(2분), 우지(3분), 호시(4분) 뒤 완료';
    desc.style.color = '#ccc';

    const btn = document.createElement('button');
    btn.textContent = '테스트 상태 초기화 (처음부터 다시)';
    btn.style.cssText = `
        background: #2F6FE4;
        color: white;
        border: none;
        padding: 6px 12px;
        border-radius: 4px;
        cursor: pointer;
        font-weight: bold;
        transition: background 0.2s;
    `;
    btn.onmouseover = () => { btn.style.background = '#1A54C0'; };
    btn.onmouseout = () => { btn.style.background = '#2F6FE4'; };
    btn.onclick = () => {
        localStorage.removeItem('svt_test_start_time');
        localStorage.removeItem('svt_diamond_unlocked');
        location.reload();
    };

    panel.append(title, desc, btn);
    document.body.appendChild(panel);
}

if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', injectTestResetButton);
    } else {
        injectTestResetButton();
    }
}

