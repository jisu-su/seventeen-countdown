// apps/hub/script.js
import { initCountdown } from '../../packages/shared/timer.js';

const members = [
    { id: 'jeonghan', date: "June 25, 2026 00:00:00" },
    { id: 'wonwoo', date: "January 2, 2027 00:00:00" },
    { id: 'woozi', date: "March 14, 2027 00:00:00" },
    { id: 'hoshi', date: "March 15, 2027 00:00:00" }
];

// 각 멤버별로 공통 타이머 실행
members.forEach(member => {
    initCountdown(member.date, `clock-${member.id}`);
});

// 2. 모든 타이머를 한꺼번에 업데이트하는 함수
function updateAllCountdowns() {
    const now = new Date().getTime(); // 현재 시간을 밀리초 단위로 가져옴

    // 배열을 순회(forEach)하며 한 명씩 계산
    members.forEach(member => {
        const target = new Date(member.date).getTime(); // 전역일 시간
        const distance = target - now; // 남은 시간 계산

        // 시간 단위 변환 (밀리초 -> 일, 시, 분, 초)
        const d = Math.floor(distance / (1000 * 60 * 60 * 24));
        const h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((distance % (1000 * 60)) / 1000);

        // HTML의 id(예: clock-woozi)를 찾아 남은 시간 텍스트 삽입
        const clockEl = document.getElementById(`clock-${member.id}`);
        if(clockEl) {
            // padStart(2, '0'): 숫자가 한 자리일 때 앞에 0을 붙여줌 (예: 7 -> 07)
            clockEl.innerHTML = `${d}d ${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
        }
    });
}

// 3. 실행 설정: 1초(1000ms)마다 함수 반복 실행
setInterval(updateAllCountdowns, 1000);

// 4. 초기 호출: 페이지가 로드되자마자 00:00:00이 아닌 실제 시간이 보이도록 즉시 실행
updateAllCountdowns();
