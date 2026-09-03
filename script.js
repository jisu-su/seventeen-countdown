import { MEMBERS } from './packages/shared/members.js';
import { STATUS } from './packages/shared/memberStatus.js';
import { initMemberTimer } from './packages/shared/memberTimer.js';
import { createDiamondSvg, initDiamondState, isDiamondMemberUnlocked } from './packages/shared/diamondState.js';

// 멤버 목록과 날짜는 packages/shared/members.js 한 곳에만 있다.
MEMBERS.forEach(member => {
    const card = document.querySelector(`[data-member-id="${member.id}"]`);
    const display = document.getElementById(`clock-${member.id}`);

    if (!card || !display) {
        return;
    }

    initMemberTimer(member, {
        display,
        container: card,
        onStatusChange(next) {
            if (next === STATUS.DISCHARGED) {
                renderUnlockedDiamond(member, card);
            }
        }
    });
});

/**
 * 전역했고 해금까지 마친 멤버의 카드에 다이아몬드를 올린다.
 * 전 멤버에게 미리 배치하는 작업은 #11에서 다룬다.
 */
function renderUnlockedDiamond(member, card) {
    if (!isDiamondMemberUnlocked(member.id) || card.querySelector('.member-diamond')) {
        return;
    }

    const diamond = createDiamondSvg();

    diamond.classList.add('member-diamond');
    card.classList.add('has-member-diamond');
    card.append(diamond);
    initDiamondState(diamond);
}
