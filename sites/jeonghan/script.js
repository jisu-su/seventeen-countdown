// 1. 카운트다운 로직 (2026년 6월 25일 전역일 기준)
const targetDate = new Date("June 25, 2026 00:00:00").getTime();

function updateCountdown() {
    const now = new Date().getTime();
    const distance = targetDate - now;

    const d = Math.floor(distance / (1000 * 60 * 60 * 24));
    const h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((distance % (1000 * 60)) / 1000);

    const clockEl = document.getElementById("clock-jeonghan");
    if(clockEl) {
        clockEl.innerHTML = `${d}d ${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
    }
}
setInterval(updateCountdown, 1000);

// [중요] 페이지 로드 시 실행될 초기화 로직
document.addEventListener('DOMContentLoaded', () => {
    // 1. 카운트다운 즉시 실행
    updateCountdown();
});