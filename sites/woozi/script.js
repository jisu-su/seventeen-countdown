// 1. 카운트다운 로직 (2027년 3월 14일 전역일 기준)
const targetDate = new Date("March 14, 2027 00:00:00").getTime();

function updateCountdown() {
    const now = new Date().getTime();
    const distance = targetDate - now;

    const d = Math.floor(distance / (1000 * 60 * 60 * 24));
    const h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((distance % (1000 * 60)) / 1000);

    const clockEl = document.getElementById("clock-woozi");
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