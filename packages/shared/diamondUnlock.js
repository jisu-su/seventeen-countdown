import {
    createDiamondSvg,
    initDiamondState,
    isDiamondMemberUnlocked,
    unlockDiamondMember
} from './diamondState.js';

/**
 * @param {string} memberId
 * @param {number|string} target 밀리초 타임스탬프, 또는 Date가 파싱할 수 있는 문자열
 */
export function setupMemberDiamondUnlock(memberId, target) {
    const timerPage = document.getElementById('timer-page');
    const targetTime = typeof target === 'number' ? target : new Date(target).getTime();
    let intervalId;

    if (!timerPage || Number.isNaN(targetTime)) {
        return;
    }

    function unlockNow() {
        if (Date.now() < targetTime) {
            return false;
        }

        timerPage.classList.add('is-unlockable');

        if (isDiamondMemberUnlocked(memberId)) {
            timerPage.classList.add('is-unlocked');
            return true;
        }

        const unlockedNow = unlockDiamondMember(memberId);

        timerPage.classList.add('is-unlocked');

        if (unlockedNow) {
            playDiamondUnlockAnimation();
        }

        return true;
    }

    function prepareClickUnlock() {
        timerPage.classList.add('is-unlockable');
        timerPage.addEventListener('click', unlockNow, { once: true });
    }

    if (Date.now() >= targetTime) {
        prepareClickUnlock();
        return;
    }

    intervalId = setInterval(() => {
        if (Date.now() >= targetTime) {
            clearInterval(intervalId);
            prepareClickUnlock();
        }
    }, 1000);

    if (Date.now() >= targetTime) {
        clearInterval(intervalId);
        prepareClickUnlock();
    }
}

function playDiamondUnlockAnimation() {
    const overlay = document.createElement('div');
    const diamond = createDiamondSvg();

    overlay.className = 'diamond-unlock-overlay';
    diamond.classList.add('diamond-unlock-svg');
    overlay.append(diamond);
    document.body.append(overlay);

    initDiamondState(diamond);

    window.setTimeout(() => {
        overlay.classList.add('is-leaving');
    }, 1800);

    window.setTimeout(() => {
        overlay.remove();
    }, 2600);
}
