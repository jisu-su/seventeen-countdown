// apps/hub/script.js
import { initCountdown } from './packages/shared/timer.js';
import { createDiamondSvg, initDiamondState, isDiamondMemberUnlocked } from './packages/shared/diamondState.js';

const members = [
    { id: 'jeonghan', date: "June 25, 2026 00:00:00" },
    { id: 'wonwoo', date: "January 2, 2027 00:00:00" },
    { id: 'woozi', date: "March 14, 2027 00:00:00" },
    { id: 'hoshi', date: "March 15, 2027 00:00:00" }
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
    card.append(diamond);
    initDiamondState(diamond);
}
