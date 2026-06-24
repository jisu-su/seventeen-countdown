// apps/hub/script.js
import { initCountdown } from './packages/shared/timer.js';
import { createDiamondSvg, initDiamondState, isDiamondMemberUnlocked } from './packages/shared/diamondState.js';

// 테스트 전용 동적 날짜 계산 (test/diamond-unlock-flow 브랜치)
let testStartTime = localStorage.getItem('svt_test_start_time');
if (!testStartTime) {
    testStartTime = Date.now().toString();
    localStorage.setItem('svt_test_start_time', testStartTime);
}
const startMs = parseInt(testStartTime, 10);

const testDates = {
    jeonghan: new Date(startMs + 60 * 1000).toISOString(),
    wonwoo: new Date(startMs + 120 * 1000).toISOString(),
    woozi: new Date(startMs + 180 * 1000).toISOString(),
    hoshi: new Date(startMs + 240 * 1000).toISOString()
};

const members = [
    { id: 'jeonghan', date: testDates.jeonghan },
    { id: 'wonwoo', date: testDates.wonwoo },
    { id: 'woozi', date: testDates.woozi },
    { id: 'hoshi', date: testDates.hoshi }
];

// 각 멤버별로 공통 타이머 실행
members.forEach(member => {
    initCountdown(member.date, `clock-${member.id}`);
    renderUnlockedDiamond(member);
});

function renderUnlockedDiamond(member) {
    const isCountdownComplete = new Date(member.date).getTime() <= Date.now();

    if (!isCountdownComplete || !isDiamondMemberUnlocked(member.id)) {
        return;
    }

    const card = document.querySelector(`[data-member-id="${member.id}"]`);

    if (!card || card.querySelector('.member-diamond')) {
        return;
    }

    const diamond = createDiamondSvg();
    diamond.classList.add('member-diamond');
    card.classList.add('has-member-diamond');
    card.append(diamond);
    initDiamondState(diamond);
}
