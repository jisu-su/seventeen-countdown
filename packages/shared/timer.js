// packages/shared/timer.js

/**
 * 전역일까지 남은 시간을 계산하여 화면에 표시하는 공통 함수
 * @param {string} targetDateString - "March 14, 2027 00:00:00" 형태의 날짜
 * @param {string} elementId - 시간을 표시할 HTML 태그의 ID (예: 'clock-woozi')
 */
export function initCountdown(targetDateString, elementId) {
    const targetDate = new Date(targetDateString).getTime();

    function update() {
        const now = new Date().getTime();
        const distance = targetDate - now;

        // 시간 단위 변환 로직 (공통화의 핵심!)
        const d = Math.floor(distance / (1000 * 60 * 60 * 24));
        const h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((distance % (1000 * 60)) / 1000);

        const clockEl = document.getElementById(elementId);
        if (clockEl) {
            // 남은 시간이 마이너스라면 '전역 완료' 메시지 표시
            if (distance < 0) {
                clockEl.innerHTML = "그가 온다";
            } else {
                clockEl.innerHTML = `${d}d ${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
            }
        }
    }

    update(); // 1. 즉시 한 번 실행하여 숫자를 바로 채움
    setInterval(update, 1000); // 2. 그 후 1초마다 반복
}