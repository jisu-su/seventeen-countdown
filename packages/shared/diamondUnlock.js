/**
 * 다이아몬드 해금
 * 파일 경로: packages/shared/diamondUnlock.js
 *
 * 전역일 도달 여부를 스스로 감시하지 않는다. 그 판단은 memberStatus.js가
 * 하고, memberTimer의 상태 전환 콜백이 이 파일의 armDiamondUnlock()을
 * 불러준다. 예전에는 여기서 setInterval을 따로 돌렸다.
 */

import {
    createDiamondSvg,
    initDiamondState,
    isDiamondMemberUnlocked,
    unlockDiamondMember
} from './diamondState.js';

/**
 * 클릭하면 해금되도록 준비한다. 전역 상태가 된 뒤에 호출해야 한다.
 *
 * @param {string} memberId
 * @param {Object} [options]
 * @param {Element} [options.container] 클릭을 받을 요소. 기본은 #timer-page.
 * @returns {boolean} 준비되었으면 true
 */
export function armDiamondUnlock(memberId, options = {}) {
    const { container = document.getElementById('timer-page') } = options;

    if (!container) {
        return false;
    }

    container.classList.add('is-unlockable');

    // 이미 해금한 사람에게 연출을 다시 보여주지는 않는다.
    if (isDiamondMemberUnlocked(memberId)) {
        container.classList.add('is-unlocked');
        return true;
    }

    container.addEventListener('click', () => {
        const unlockedNow = unlockDiamondMember(memberId);

        container.classList.add('is-unlocked');

        if (unlockedNow) {
            playDiamondUnlockAnimation();
        }
    }, { once: true });

    return true;
}

/**
 * 전체화면 해금 연출을 한 번 재생한다.
 * #11에서 허브가 ?unlock= 파라미터를 받았을 때도 이 함수를 쓴다.
 */
export function playDiamondUnlockAnimation() {
    const overlay = document.createElement('div');
    const diamond = createDiamondSvg();

    overlay.className = 'diamond-unlock-overlay';
    diamond.classList.add('diamond-unlock-svg');
    overlay.append(diamond);
    document.body.append(overlay);

    initDiamondState(diamond);

    window.setTimeout(() => overlay.classList.add('is-leaving'), 1800);
    window.setTimeout(() => overlay.remove(), 2600);
}
