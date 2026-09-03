import { MEMBERS, getDischargeTime } from './packages/shared/members.js';
import { initCountdown } from './packages/shared/timer.js';
import { createDiamondSvg, initDiamondState, isDiamondMemberUnlocked } from './packages/shared/diamondState.js';

// 멤버 목록과 날짜는 packages/shared/members.js 한 곳에만 있다.
MEMBERS.forEach(member => {
    const dischargeTime = getDischargeTime(member);

    initCountdown(dischargeTime, `clock-${member.id}`);
    renderUnlockedDiamond(member, dischargeTime);
});

function renderUnlockedDiamond(member, dischargeTime) {
    const isCountdownComplete = dischargeTime !== null && dischargeTime <= Date.now();

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
